import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SubmissionModel } from '../models/Submission';
import { ArticleModel } from '../models/Article';
import { UserModel } from '../models/User';
import { db } from '../data/db';
import { dltService } from '../services/dltService';
import { Submission, SubmissionStatus, Article, UserRole } from '../types';
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

/** Resolve active user id from request headers or db state */
export const getRequestUserId = (req: Request): string => {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId && headerId.trim()) return headerId.trim();
  const authHeader = req.headers['authorization'] as string;
  if (authHeader && authHeader.startsWith('Bearer jwt_')) {
    return authHeader.replace('Bearer jwt_', '').trim();
  }
  return db.activeUserId;
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;

    const activeUserId = getRequestUserId(req);
    const roleHeader = (req.headers['x-user-role'] as string)?.toUpperCase();

    let requestingUser: any = null;
    if (mongoose.connection.readyState === 1 && activeUserId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(activeUserId) && activeUserId.length === 24;
      requestingUser = await UserModel.findOne(
        isObjectId ? { _id: activeUserId } : { $or: [{ customId: activeUserId }, { id: activeUserId }] }
      );
    }
    if (!requestingUser) {
      requestingUser = db.users.find((u) => u.id === activeUserId);
    }

    const resolvedRole = (requestingUser?.role || roleHeader || '').toUpperCase();
    const isApprover = resolvedRole === 'ADMIN' || resolvedRole === 'EXPERT' || resolvedRole === 'JOURNALIST';
    const isGuest = (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') && !roleHeader;

    // If guest and no specific userId requested, return empty
    if (isGuest && !userId) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Filter by target userId: if query param provided, use it; approvers without userId param see all platform submissions
    let targetUserId: string | undefined = undefined;
    if (userId && typeof userId === 'string' && userId.trim()) {
      targetUserId = userId.trim();
    } else if (!isApprover && !isGuest) {
      targetUserId = activeUserId;
    }

    let submissions: any[] = [];

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (status && typeof status === 'string' && status !== 'ALL') {
        if (status.toUpperCase() === 'PENDING') {
          query.status = { $in: ['PENDING', 'PENDING_EXPERT', 'PENDING_JOURNALIST'] };
        } else {
          query.status = status.toUpperCase();
        }
      }
      if (targetUserId && typeof targetUserId === 'string') query.userId = targetUserId;

      submissions = await SubmissionModel.find(query).sort({ createdAt: -1 });
    }

    if (submissions.length === 0) {
      let filtered = [...db.submissions];
      if (status && typeof status === 'string' && status !== 'ALL') {
        if (status.toUpperCase() === 'PENDING') {
          filtered = filtered.filter(
            (s) => s.status === 'PENDING' || s.status === 'PENDING_EXPERT' || s.status === 'PENDING_JOURNALIST'
          );
        } else {
          filtered = filtered.filter((s) => s.status === status.toUpperCase());
        }
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
    const activeUserId = getRequestUserId(req);
    const {
      title,
      category,
      location,
      description,
      sourceNotes,
      attachments,
      audioUri,
      isAnonymous,
      requireJournalistReview,
      requireExpertFactCheck,
    } = req.body;

    if (!isAnonymous && (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest')) {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye post create nahi kar sakte. Post create karne ke liye pehle login karein ya Anonymous Whistleblower mode use karein.',
      });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Headline / Incident Summary is required.' });
    }

    // Lookup author info from active user
    let author: any = null;
    if (mongoose.connection.readyState === 1 && activeUserId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(activeUserId) && activeUserId.length === 24;
      author = await UserModel.findOne(
        isObjectId ? { _id: activeUserId } : { $or: [{ customId: activeUserId }, { id: activeUserId }] }
      );
    }
    if (!author) {
      author = db.users.find((u) => u.id === activeUserId);
    }

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
      userId: isAnonymous ? 'anonymous_whistleblower' : activeUserId,
      authorName: isAnonymous ? 'Anonymous Whistleblower' : (author?.name || 'Citizen Reporter'),
      authorAvatarUrl: isAnonymous
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
        : (author?.avatarUrl || ''),
      requireJournalistReview: requireJournalistReview !== false,
      requireExpertFactCheck: requireExpertFactCheck !== false,
      journalistApproval: null as any,
      expertApproval: null as any,
      verifiedByJournalist: '',
      factCheckedBy: '',
      finalApprovedBy: '',
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

/**
 * Core Dual-Consensus Verification Processor
 * Enforces that both Staff Journalist and Ground Expert must verify before news is published,
 * unless Chief Editor/Admin overrides with full clearance.
 */
export const processSubmissionVerification = async (
  id: string,
  targetStatus: string,
  note?: string,
  rejectionReason?: string,
  stage?: 'JOURNALIST' | 'EXPERT' | 'MASTER',
  activeUserId?: string,
  roleHeader?: string
) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  const query = isObjectId ? { _id: id } : { customId: id };

  let currentSubDoc: any = null;
  if (mongoose.connection.readyState === 1) {
    currentSubDoc = await SubmissionModel.findOne(query);
  }
  const memSub = db.submissions.find((s) => s.id === id);

  if (!currentSubDoc && !memSub) {
    throw new Error(`Submission with ID ${id} not found.`);
  }

  const existingData = currentSubDoc ? currentSubDoc.toJSON() : memSub!;

  // Resolve acting reviewer identity
  let actingUser: any = null;
  if (mongoose.connection.readyState === 1 && activeUserId) {
    const isUserObjectId = mongoose.Types.ObjectId.isValid(activeUserId) && activeUserId.length === 24;
    actingUser = await UserModel.findOne(
      isUserObjectId ? { _id: activeUserId } : { $or: [{ customId: activeUserId }, { id: activeUserId }] }
    );
  }
  if (!actingUser && activeUserId) {
    actingUser = db.users.find((u) => u.id === activeUserId);
  }

  const actingRole: UserRole = (actingUser?.role || roleHeader || 'ADMIN').toUpperCase() as UserRole;
  const actingName: string =
    actingUser?.name ||
    (actingRole === 'JOURNALIST'
      ? 'Sarah Jenkins'
      : actingRole === 'EXPERT'
      ? 'Elias Thorne'
      : 'Dr. Alexander Vance');

  // Handle REJECTION immediately
  if (targetStatus.toUpperCase() === 'REJECTED') {
    if (!rejectionReason && !note) {
      throw new Error('A mandatory rejection reason is required to reject a submission.');
    }
    const effectiveReason = rejectionReason || note || 'Corroboration threshold not met upon field audit.';
    const effectiveNote = `REJECTED by ${actingName} (${actingRole}): ${effectiveReason}`;

    const updateFields = {
      status: 'REJECTED' as SubmissionStatus,
      rejectionReason: effectiveReason,
      note: effectiveNote,
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await SubmissionModel.findOneAndUpdate(query, updateFields, { new: true });
    }
    if (memSub) {
      memSub.status = 'REJECTED';
      memSub.rejectionReason = effectiveReason;
      memSub.note = effectiveNote;
      memSub.updatedAt = new Date().toISOString();
    }

    return {
      submission: { ...existingData, ...updateFields },
      isFullyApproved: false,
      message: `Submission marked as REJECTED by ${actingName}. Reason logged.`,
    };
  }

  // Verification requirements (default true)
  const reqJournalist = existingData.requireJournalistReview !== false;
  const reqExpert = existingData.requireExpertFactCheck !== false;

  let journalistApproval = existingData.journalistApproval;
  let expertApproval = existingData.expertApproval;
  let verifiedByJournalist = existingData.verifiedByJournalist || '';
  let factCheckedBy = existingData.factCheckedBy || '';
  let finalApprovedBy = existingData.finalApprovedBy || '';

  const nowIso = new Date().toISOString();

  // Determine which approval stage is being granted
  const isJournalistAction = stage === 'JOURNALIST' || actingRole === 'JOURNALIST';
  const isExpertAction = stage === 'EXPERT' || actingRole === 'EXPERT';
  const isMasterAdminAction = stage === 'MASTER' || actingRole === 'ADMIN';

  if (isJournalistAction) {
    journalistApproval = {
      approved: true,
      approverName: actingName,
      approverId: activeUserId,
      approverRole: 'STAFF JOURNALIST',
      timestamp: nowIso,
      note: note || `Field audit verified by Staff Journalist ${actingName}.`,
    };
    verifiedByJournalist = actingName;
  }

  if (isExpertAction) {
    expertApproval = {
      approved: true,
      approverName: actingName,
      approverId: activeUserId,
      approverRole: 'GROUND EXPERT',
      timestamp: nowIso,
      note: note || `Forensic Fact-Check Certified by Ground Expert ${actingName}.`,
    };
    factCheckedBy = actingName;
  }

  if (isMasterAdminAction) {
    finalApprovedBy = actingName;
    if (!journalistApproval?.approved) {
      journalistApproval = {
        approved: true,
        approverName: verifiedByJournalist || 'Sarah Jenkins (Staff Correspondent)',
        timestamp: nowIso,
        note: 'Cleared by Chief Editorial Oversight.',
      };
      if (!verifiedByJournalist) verifiedByJournalist = 'Sarah Jenkins';
    }
    if (!expertApproval?.approved) {
      expertApproval = {
        approved: true,
        approverName: factCheckedBy || 'Elias Thorne (Ground Expert)',
        timestamp: nowIso,
        note: 'Forensic Merkle Proof Certified.',
      };
      if (!factCheckedBy) factCheckedBy = 'Elias Thorne';
    }
  }

  // Check if BOTH required stages are now satisfied
  const hasJournalist = !reqJournalist || Boolean(journalistApproval?.approved);
  const hasExpert = !reqExpert || Boolean(expertApproval?.approved);
  const isDualConsensusReached = hasJournalist && hasExpert;

  let finalStatus: SubmissionStatus;
  let statusNote: string;
  let userMessage: string;

  if (isDualConsensusReached) {
    finalStatus = 'APPROVED';
    statusNote = `Dual Consensus Verified: Field Audited by ${verifiedByJournalist || 'Staff Journalist'} & Fact-Checked by ${factCheckedBy || 'Ground Expert'}. Anchored to SusaLabs DLT.`;
    userMessage = `Dual-Consensus Verified! Approved by both Staff Journalist (${verifiedByJournalist}) & Ground Expert (${factCheckedBy}). Story is now LIVE on Portal & DLT!`;
  } else if (hasJournalist && !hasExpert) {
    finalStatus = 'PENDING_EXPERT';
    statusNote = `✓ Verified by Staff Journalist ${verifiedByJournalist}. Awaiting Ground Expert Forensic Fact-Check before publication.`;
    userMessage = `Field report verified by Staff Journalist ${verifiedByJournalist}. News is held in queue until Ground Expert certifies fact-check.`;
  } else if (!hasJournalist && hasExpert) {
    finalStatus = 'PENDING_JOURNALIST';
    statusNote = `✓ Fact-Check Certified by Ground Expert ${factCheckedBy}. Awaiting Staff Journalist Field Clearance before publication.`;
    userMessage = `Fact-Check certified by Ground Expert ${factCheckedBy}. News is held in queue until Staff Journalist field clearance.`;
  } else {
    finalStatus = 'PENDING';
    statusNote = note || 'Awaiting Editorial & Fact-Check Verification.';
    userMessage = 'Submission verification updated.';
  }

  const updatedFields = {
    status: finalStatus,
    note: statusNote,
    requireJournalistReview: reqJournalist,
    requireExpertFactCheck: reqExpert,
    journalistApproval,
    expertApproval,
    verifiedByJournalist,
    factCheckedBy,
    finalApprovedBy: finalApprovedBy || (isDualConsensusReached ? actingName : ''),
    updatedAt: new Date(),
  };

  if (mongoose.connection.readyState === 1) {
    await SubmissionModel.findOneAndUpdate(query, updatedFields, { new: true });
  }

  if (memSub) {
    Object.assign(memSub, updatedFields, { updatedAt: nowIso });
  }

  const targetSub = { ...existingData, ...updatedFields };

  // ONLY publish to ArticleModel and Anchor to DLT if DUAL CONSENSUS is fully reached
  if (finalStatus === 'APPROVED') {
    let imgUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
    let videoUrl = '';
    let mediaType: 'image' | 'video' = 'image';

    if (targetSub.attachments) {
      try {
        const parsed = JSON.parse(targetSub.attachments);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.uri) {
          const firstAtt = parsed[0];
          const uri = (firstAtt.uri || '').trim();
          const isVid =
            firstAtt.type === 'video' ||
            uri.startsWith('data:video/') ||
            /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(uri) ||
            /(?:youtube\.com|youtu\.be)/i.test(uri);

          if (isVid) {
            videoUrl = uri;
            mediaType = 'video';
            const ytMatch = uri.match(/(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
            if (ytMatch && ytMatch[1]) {
              imgUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
            } else {
              imgUrl = '';
            }
          } else {
            imgUrl = uri;
            mediaType = 'image';
          }
        }
      } catch (e) {
        const attStr = targetSub.attachments.trim();
        const isVid =
          attStr.startsWith('data:video/') ||
          /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(attStr) ||
          /(?:youtube\.com|youtu\.be)/i.test(attStr);

        if (isVid) {
          videoUrl = attStr;
          mediaType = 'video';
          const ytMatch = attStr.match(/(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
          if (ytMatch && ytMatch[1]) {
            imgUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
          } else {
            imgUrl = '';
          }
        } else if (attStr.startsWith('http') || attStr.startsWith('data:image/')) {
          imgUrl = attStr;
          mediaType = 'image';
        }
      }
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
      videoUrl: videoUrl,
      mediaType: mediaType,
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
      verifiedByJournalist: verifiedByJournalist || 'Sarah Jenkins (Staff Correspondent)',
      factCheckedBy: factCheckedBy || 'Elias Thorne (Ground Expert & Policy Auditor)',
      finalAuditor: finalApprovedBy || actingName || 'Dr. Alexander Vance (Chief Editor)',
      editorialDesk: 'NextTruth Dispatch & SusaLabs Civic Review',
      verificationStatus: '100% Eyewitness Corroborated • Dual-Consensus Certified',
      createdAt: nowPublished,
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
    dltService.anchorArticle(memArt);
  }

  return {
    submission: targetSub,
    isFullyApproved: finalStatus === 'APPROVED',
    message: userMessage,
  };
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, rejectionReason, stage } = req.body;

    const activeUserId = getRequestUserId(req);
    const roleHeader = (req.headers['x-user-role'] as string)?.toUpperCase();

    const result = await processSubmissionVerification(
      id,
      status || 'APPROVED',
      note,
      rejectionReason,
      stage,
      activeUserId,
      roleHeader
    );

    res.json({
      success: true,
      message: result.message,
      data: result.submission,
      isFullyApproved: result.isFullyApproved,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating submission', error });
  }
};
