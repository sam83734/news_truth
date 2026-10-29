import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SubmissionModel } from '../models/Submission';
import { ArticleModel } from '../models/Article';
import { db } from '../data/db';
import { Submission, SubmissionStatus, Article } from '../types';
import { v4 as uuidv4 } from 'uuid';

/** Compute a human-readable relative-time string from an ISO timestamp */
const getRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;

    const activeUserId = db.activeUserId;
    const isGuest = !activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest';

    // If guest and no specific userId requested, return empty
    if (isGuest && !userId) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const currentUser = db.userProfile;
    const isAdmin = currentUser && currentUser.role === 'ADMIN';

    // Filter by target userId: if query param provided, use it; otherwise non-admins only get their own submissions
    const targetUserId = userId || (!isAdmin && !isGuest ? activeUserId : undefined);

    let submissions: any[] = [];

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (status && typeof status === 'string') query.status = status.toUpperCase();
      if (targetUserId && typeof targetUserId === 'string') query.userId = targetUserId;

      submissions = await SubmissionModel.find(query).sort({ createdAt: -1 });
    }

    if (submissions.length === 0) {
      let filtered = [...db.submissions];
      if (status && typeof status === 'string') {
        filtered = filtered.filter((s) => s.status === status.toUpperCase());
      }
      if (targetUserId && typeof targetUserId === 'string') {
        filtered = filtered.filter((s) => s.userId === targetUserId);
      }
      submissions = filtered;
    }

    // Enrich each submission with a dynamically computed submittedTimeAgo
    const enriched = submissions.map((s: any) => {
      const plain = s.toJSON ? s.toJSON() : { ...s };
      if (plain.createdAt) {
        plain.submittedTimeAgo = getRelativeTime(plain.createdAt);
      }
      return plain;
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving submissions', error });
  }
};

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const activeUserId = db.activeUserId;
    if (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye post create nahi kar sakte. Post create karne ke liye pehle login karein.',
      });
    }

    const { title, category, location, description, sourceNotes, attachments, audioUri } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Headline / Incident Summary is required.' });
    }

    // Lookup author info from active user
    const author = db.users.find((u) => u.id === activeUserId);

    const subData = {
      title: title.trim(),
      status: 'PENDING' as SubmissionStatus,
      submittedTimeAgo: 'Just now',
      note: sourceNotes || 'Verification desk checking geotag metadata and eyewitness materials.',
      location: location || 'Downtown Metro (GPS Detected)',
      category: category || 'Ground Reports',
      description: description || '',
      attachments: attachments || '',
      audioUri: audioUri || '',
      userId: activeUserId,
      authorName: author?.name || 'Citizen Reporter',
      authorAvatarUrl: author?.avatarUrl || '',
    };

    let newSubmission: any = null;

    if (mongoose.connection.readyState === 1) {
      newSubmission = await SubmissionModel.create(subData);
    }

    const nowIso = new Date().toISOString();
    const memorySub: Submission = {
      id: newSubmission ? newSubmission._id.toString() : `sub_${uuidv4().substring(0, 8)}`,
      ...subData,
      createdAt: nowIso,
    };

    db.submissions.unshift(memorySub);

    // Trigger Notification
    db.notifications.unshift({
      id: `notif_${uuidv4().substring(0, 8)}`,
      title: 'Submission Transmitted',
      message: `Your report '${memorySub.title}' has been routed to the Ground Verification Desk.`,
      timeAgo: 'Just now',
      isUrgent: false,
      isRead: false,
      type: 'SUBMISSION',
      createdAt: new Date().toISOString(),
    });

    const result = newSubmission ? newSubmission.toJSON() : memorySub;

    res.status(201).json({
      success: true,
      message: 'Eyewitness report submitted successfully to MongoDB database.',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating submission', error });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses: SubmissionStatus[] = ['PENDING', 'REVISE', 'APPROVED'];
    if (!status || !validStatuses.includes(status.toUpperCase() as SubmissionStatus)) {
      return res.status(400).json({ success: false, message: 'Valid status required: PENDING, REVISE, APPROVED' });
    }

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
      const query = isObjectId ? { _id: id } : { customId: id };
      updated = await SubmissionModel.findOneAndUpdate(
        query,
        { status: status.toUpperCase(), ...(note !== undefined && { note }) },
        { new: true }
      );
    }

    const memSub = db.submissions.find((s) => s.id === id);
    if (memSub) {
      memSub.status = status.toUpperCase() as SubmissionStatus;
      if (note) memSub.note = note;
      memSub.updatedAt = new Date().toISOString();
    }

    const targetSub = updated ? updated.toJSON() : memSub;

    if (!targetSub) {
      return res.status(404).json({ success: false, message: `Submission with ID ${id} not found` });
    }

    // Auto-publish to ArticleModel if approved
    if (status.toUpperCase() === 'APPROVED') {
      let imgUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
      if (targetSub.attachments) {
        try {
          const parsed = JSON.parse(targetSub.attachments);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.uri) {
            imgUrl = parsed[0].uri;
          }
        } catch (e) {}
      }

      let authorName = 'Eyewitness Correspondent';
      let authorTitle = 'Verified Citizen Reporter';
      let authorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120';

      if (targetSub.userId) {
        const u = db.users.find((user) => user.id === targetSub.userId);
        if (u) {
          authorName = u.name;
          authorTitle = u.roleBadge || 'Citizen Reporter';
          authorAvatar = u.avatarUrl || authorAvatar;
        }
      }

      const nowPublished = new Date().toISOString();
      const publishedArticleData = {
        customId: `art_sub_${targetSub.id || targetSub._id || uuidv4().substring(0, 8)}`,
        title: targetSub.title,
        excerpt: targetSub.description ? targetSub.description.substring(0, 160) : targetSub.title,
        fullContent: targetSub.description || targetSub.title,
        authorName,
        authorTitle,
        authorAvatarUrl: authorAvatar,
        dateOrTimeAgo: getRelativeTime(nowPublished),
        category: targetSub.category || 'Ground Reports',
        imageUrl: imgUrl,
        isVerifiedGround: true,
        isHero: false,
        readTime: (() => {
          const wordCount = (targetSub.description || targetSub.title || '').split(/\s+/).filter(Boolean).length;
          const mins = Math.max(1, Math.round(wordCount / 200));
          return `${mins} min read`;
        })(),
        views: '1',
        viewCount: 1,
        categoryTag: 'VERIFIED DISPATCH',
        createdAt: nowPublished,
        // Carry over voice note URI from submission if it's a real file URI (not sentinel)
        ...(targetSub.audioUri && targetSub.audioUri !== 'recorded' && targetSub.audioUri.length > 10
          ? { voiceNoteUri: targetSub.audioUri }
          : {}),
      };

      if (mongoose.connection.readyState === 1) {
        await ArticleModel.findOneAndUpdate(
          { customId: publishedArticleData.customId },
          publishedArticleData,
          { upsert: true, new: true }
        );
      }

      const existingIdx = db.articles.findIndex((a) => a.id === publishedArticleData.customId);
      const memArt: Article = { id: publishedArticleData.customId, ...publishedArticleData };
      if (existingIdx >= 0) {
        db.articles[existingIdx] = memArt;
      } else {
        db.articles.unshift(memArt);
      }
    }

    res.json({
      success: true,
      message: `Submission status updated to ${status} and published to Home feed.`,
      data: targetSub,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating submission', error });
  }
};
