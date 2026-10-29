import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { ArticleModel } from '../models/Article';
import { db } from '../data/db';

const findUser = async (id: string) => {
  if (!id) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  if (isObjectId) {
    const u = await UserModel.findById(id);
    if (u) return u;
  }
  return await UserModel.findOne({ customId: id });
};

const updateUser = async (id: string, updateData: any) => {
  if (!id) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  if (isObjectId) {
    const u = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (u) return u;
  }
  return await UserModel.findOneAndUpdate({ customId: id }, updateData, { new: true });
};

export const getUserProfile = async (_req: Request, res: Response) => {
  try {
    let profile: any = null;

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      profile = await findUser(db.activeUserId);
    }

    if (!profile) {
      profile = db.userProfile;
    }

    const profileObj = profile.toJSON ? profile.toJSON() : { ...profile };
    delete profileObj.password;

    res.json({
      success: true,
      data: profileObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving user profile', error });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio, avatarUrl } = req.body;

    let updated: any = null;

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      updated = await updateUser(db.activeUserId, {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(avatarUrl && { avatarUrl: avatarUrl.trim() }),
      });
    }

    const memProfile = db.userProfile;
    if (name) memProfile.name = name.trim();
    if (bio !== undefined) memProfile.bio = bio.trim();
    if (avatarUrl) memProfile.avatarUrl = avatarUrl.trim();

    const finalObj = updated ? updated.toJSON() : { ...memProfile };
    delete finalObj.password;

    res.json({
      success: true,
      message: 'Profile updated successfully in database',
      data: finalObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating user profile', error });
  }
};

export const upgradePremium = async (req: Request, res: Response) => {
  try {
    const { isPremium = true } = req.body;

    let updated: any = null;

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      updated = await updateUser(db.activeUserId, { isPremium: Boolean(isPremium) });
    }

    const memProfile = db.userProfile;
    memProfile.isPremium = Boolean(isPremium);

    const finalObj = updated ? updated.toJSON() : { ...memProfile };
    delete finalObj.password;

    res.json({
      success: true,
      message: 'User upgraded to Next Truth Premium in database',
      data: finalObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error upgrading subscription', error });
  }
};

export const getBookmarks = async (_req: Request, res: Response) => {
  try {
    let bookmarkIds: string[] = db.userProfile.bookmarkedArticleIds || [];
    let bookmarkedArticles: any[] = [];

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      const user = await findUser(db.activeUserId);
      if (user) {
        bookmarkIds = user.bookmarkedArticleIds || [];
      }
      bookmarkedArticles = await ArticleModel.find({
        $or: [
          { customId: { $in: bookmarkIds } },
          { _id: { $in: bookmarkIds.filter((id) => mongoose.Types.ObjectId.isValid(id) && id.length === 24) } },
        ],
      });
    }

    if (bookmarkedArticles.length === 0) {
      bookmarkedArticles = db.articles.filter((a) => bookmarkIds.includes(a.id));
    }

    res.json({
      success: true,
      count: bookmarkedArticles.length,
      bookmarkedIds: bookmarkIds,
      data: bookmarkedArticles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving bookmarks', error });
  }
};

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const activeUserId = db.activeUserId;
    if (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye bookmark/save nahi kar sakte. Pehle login karein.',
      });
    }

    const { articleId } = req.params;

    let currentBookmarks: string[] = db.userProfile.bookmarkedArticleIds || [];

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      const user = await findUser(db.activeUserId);
      if (user) {
        currentBookmarks = user.bookmarkedArticleIds || [];
      }
    }

    const isBookmarked = currentBookmarks.includes(articleId);
    let updatedBookmarks: string[];

    if (isBookmarked) {
      updatedBookmarks = currentBookmarks.filter((id) => id !== articleId);
    } else {
      updatedBookmarks = [...currentBookmarks, articleId];
    }

    if (mongoose.connection.readyState === 1 && db.activeUserId) {
      await updateUser(db.activeUserId, {
        bookmarkedArticleIds: updatedBookmarks,
      });
    }

    db.userProfile.bookmarkedArticleIds = updatedBookmarks;

    res.json({
      success: true,
      message: isBookmarked ? 'Article removed from reading list' : 'Article saved to reading list',
      isBookmarked: !isBookmarked,
      bookmarkedIds: updatedBookmarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error toggling bookmark', error });
  }
};
