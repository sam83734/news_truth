import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VideoModel } from '../models/Video';
import { UserModel } from '../models/User';
import { db } from '../data/db';
import { VideoReport } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getVideos = async (req: Request, res: Response) => {
  try {
    const { isLive } = req.query;

    let videos: any[] = [];

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (isLive !== undefined) {
        query.isLive = isLive === 'true';
      }
      videos = await VideoModel.find(query).sort({ createdAt: -1 });
    }

    if (videos.length === 0) {
      let filtered = [...db.liveVideos];
      if (isLive !== undefined) {
        const liveBool = isLive === 'true';
        filtered = filtered.filter((v) => v.isLive === liveBool);
      }
      videos = filtered;
    }

    res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving videos', error });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let video: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { customId: id };
      video = await VideoModel.findOne(query);
    }

    if (!video) {
      video = db.liveVideos.find((v) => v.id === id);
    }

    if (!video) {
      return res.status(404).json({ success: false, message: `Video with ID ${id} not found` });
    }

    res.json({ success: true, data: video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving video', error });
  }
};

export const createVideo = async (req: Request, res: Response) => {
  try {
    const { title, videoThumbnailUrl, videoUrl, reporterName, location, isLive, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Video title is required.' });
    }

    const cleanUrl = (videoUrl || '').trim();
    let resolvedThumbnail = (videoThumbnailUrl || '').trim();

    // Auto-derive YouTube thumbnail if link is YouTube
    const ytRegExp = /(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = cleanUrl.match(ytRegExp);
    if (match && match[1]) {
      if (!resolvedThumbnail || resolvedThumbnail.includes('unsplash') || resolvedThumbnail.includes('gtv-videos')) {
        resolvedThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    } else if (!resolvedThumbnail) {
      resolvedThumbnail = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800';
    }

    const videoData = {
      customId: `vid_${uuidv4().substring(0, 8)}`,
      title: title.trim(),
      videoThumbnailUrl: resolvedThumbnail,
      videoUrl: cleanUrl,
      reporterName: reporterName || 'Staff Anchor',
      location: location || 'Broadcast Operations',
      isLive: isLive !== false,
      isReplay: isLive === false,
      viewersCount: isLive !== false ? '1.4k watching' : 'Replay Stream',
      likesCount: 0,
      description: description || '',
    };

    let created: any = null;
    if (mongoose.connection.readyState === 1) {
      created = await VideoModel.create(videoData);
    }

    const memVideo: VideoReport = {
      id: created ? created._id.toString() : videoData.customId,
      ...videoData,
    };
    db.liveVideos.unshift(memVideo);

    res.status(201).json({ success: true, data: created ? created.toJSON() : memVideo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating video', error });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, videoThumbnailUrl, reporterName, location, isLive, description } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const query = isObjectId ? { _id: id } : { customId: id };

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (reporterName !== undefined) updateData.reporterName = reporterName;
    if (location !== undefined) updateData.location = location;
    if (isLive !== undefined) {
      updateData.isLive = Boolean(isLive);
      updateData.isReplay = !isLive;
      if (Boolean(isLive)) {
        updateData.viewersCount = '1.2k watching';
      }
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl.trim();
      const ytRegExp = /(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
      const match = videoUrl.match(ytRegExp);
      if (match && match[1] && (!videoThumbnailUrl || videoThumbnailUrl.includes('unsplash'))) {
        updateData.videoThumbnailUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    if (videoThumbnailUrl !== undefined) updateData.videoThumbnailUrl = videoThumbnailUrl;

    let updated: any = null;
    if (mongoose.connection.readyState === 1) {
      updated = await VideoModel.findOneAndUpdate(query, updateData, { new: true });
    }

    const memVid = db.liveVideos.find((v) => v.id === id);
    if (memVid) {
      Object.assign(memVid, updateData);
    }

    if (!updated && !memVid) {
      return res.status(404).json({ success: false, message: `Video with ID ${id} not found` });
    }

    res.json({ success: true, data: updated ? updated.toJSON() : memVid });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating video', error });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const query = isObjectId ? { _id: id } : { customId: id };

    if (mongoose.connection.readyState === 1) {
      await VideoModel.findOneAndDelete(query);
    }

    const idx = db.liveVideos.findIndex((v) => v.id === id);
    if (idx >= 0) {
      db.liveVideos.splice(idx, 1);
    }

    res.json({ success: true, message: 'Video stream deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error deleting video', error });
  }
};

export const toggleVideoLike = async (req: Request, res: Response) => {
  try {
    const activeUserId = (req.headers['x-user-id'] as string)?.trim() || db.activeUserId;
    if (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye video like nahi kar sakte. Pehle login karein.',
      });
    }

    const { id } = req.params;
    const { action } = req.body;

    let userDoc: any = null;
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(activeUserId) && activeUserId.length === 24;
      userDoc = await UserModel.findOne(
        isObjectId ? { _id: activeUserId } : { $or: [{ customId: activeUserId }, { id: activeUserId }] }
      );
    }

    const memUser = db.users.find((u) => u.id === activeUserId);
    const userLikedList: string[] = userDoc?.likedVideoIds || memUser?.likedVideoIds || [];
    const isAlreadyLiked = userLikedList.includes(id);

    let finalAction = action;
    if (!finalAction) {
      finalAction = isAlreadyLiked ? 'unlike' : 'like';
    }

    // Strict constraint: cannot like more than once
    if (finalAction === 'like' && isAlreadyLiked) {
      const currentVideo =
        (mongoose.connection.readyState === 1
          ? await VideoModel.findOne(mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { customId: id })
          : null) || db.liveVideos.find((v) => v.id === id);

      return res.json({
        success: true,
        message: 'Aap is video ko pehle hi like kar chuke hain.',
        likesCount: currentVideo?.likesCount || 0,
        isLiked: true,
        likedVideoIds: userLikedList,
      });
    }

    if (finalAction === 'unlike' && !isAlreadyLiked) {
      const currentVideo =
        (mongoose.connection.readyState === 1
          ? await VideoModel.findOne(mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { customId: id })
          : null) || db.liveVideos.find((v) => v.id === id);

      return res.json({
        success: true,
        message: 'Video is not currently liked.',
        likesCount: currentVideo?.likesCount || 0,
        isLiked: false,
        likedVideoIds: userLikedList,
      });
    }

    const delta = finalAction === 'unlike' ? -1 : 1;
    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
      const query = isObjectId ? { _id: id } : { customId: id };
      updated = await VideoModel.findOneAndUpdate(
        query,
        { $inc: { likesCount: delta } },
        { new: true }
      );

      if (userDoc) {
        if (finalAction === 'unlike') {
          await UserModel.findByIdAndUpdate(userDoc._id, { $pull: { likedVideoIds: id } });
        } else {
          await UserModel.findByIdAndUpdate(userDoc._id, { $addToSet: { likedVideoIds: id } });
        }
      }
    }

    const video = db.liveVideos.find((v) => v.id === id);
    if (video) {
      video.likesCount = Math.max(0, video.likesCount + delta);
    }

    if (memUser) {
      if (!memUser.likedVideoIds) memUser.likedVideoIds = [];
      if (finalAction === 'unlike') {
        memUser.likedVideoIds = memUser.likedVideoIds.filter((vId) => vId !== id);
      } else if (!memUser.likedVideoIds.includes(id)) {
        memUser.likedVideoIds.push(id);
      }
    }

    const finalVideo = updated ? updated.toJSON() : video;
    if (!finalVideo) {
      return res.status(404).json({ success: false, message: `Video with ID ${id} not found` });
    }

    const updatedLikedList =
      finalAction === 'unlike'
        ? userLikedList.filter((vId) => vId !== id)
        : [...userLikedList.filter((vId) => vId !== id), id];

    res.json({
      success: true,
      likesCount: finalVideo.likesCount,
      isLiked: finalAction === 'like',
      data: finalVideo,
      likedVideoIds: updatedLikedList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error toggling like', error });
  }
};
