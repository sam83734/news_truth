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
    const { title, videoThumbnailUrl, videoUrl, reporterName, location, isLive } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Video title is required.' });
    }

    const videoData = {
      customId: `vid_${uuidv4().substring(0, 8)}`,
      title: title.trim(),
      videoThumbnailUrl: videoThumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
      videoUrl: videoUrl || '',
      reporterName: reporterName || 'Staff Reporter',
      location: location || 'Ground Station',
      isLive: Boolean(isLive),
      isReplay: !isLive,
      viewersCount: '1',
      likesCount: 0,
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

    res.status(201).json({ success: true, data: created || memVideo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating video', error });
  }
};

export const toggleVideoLike = async (req: Request, res: Response) => {
  try {
    const activeUserId = db.activeUserId;
    if (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye video like nahi kar sakte. Pehle login karein.',
      });
    }

    const { id } = req.params;
    const { action } = req.body;

    const delta = action === 'unlike' ? -1 : 1;

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { customId: id };
      updated = await VideoModel.findOneAndUpdate(
        query,
        { $inc: { likesCount: delta } },
        { new: true }
      );

      if (db.activeUserId && db.activeUserId !== 'guest_user' && db.activeUserId !== 'guest') {
        const userQuery = mongoose.Types.ObjectId.isValid(db.activeUserId) && db.activeUserId.length === 24
          ? { _id: db.activeUserId }
          : { customId: db.activeUserId };
        if (action === 'unlike') {
          await UserModel.findOneAndUpdate(userQuery, { $pull: { likedVideoIds: id } });
        } else {
          await UserModel.findOneAndUpdate(userQuery, { $addToSet: { likedVideoIds: id } });
        }
      }
    }

    const video = db.liveVideos.find((v) => v.id === id);
    if (video) {
      video.likesCount = Math.max(0, video.likesCount + delta);
    }

    if (db.activeUserId && db.activeUserId !== 'guest_user' && db.activeUserId !== 'guest') {
      const user = db.users.find((u) => u.id === db.activeUserId);
      if (user) {
        if (!user.likedVideoIds) user.likedVideoIds = [];
        if (action === 'unlike') {
          user.likedVideoIds = user.likedVideoIds.filter((vId) => vId !== id);
        } else if (!user.likedVideoIds.includes(id)) {
          user.likedVideoIds.push(id);
        }
      }
    }

    const finalVideo = updated || video;

    if (!finalVideo) {
      return res.status(404).json({ success: false, message: `Video with ID ${id} not found` });
    }

    res.json({
      success: true,
      likesCount: finalVideo.likesCount,
      data: finalVideo,
      likedVideoIds: db.userProfile?.likedVideoIds || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error toggling like', error });
  }
};
