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

const resolveUserId = (req: Request): string => {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId && headerId.trim()) return headerId.trim();
  const authHeader = req.headers['authorization'] as string;
  if (authHeader && authHeader.startsWith('Bearer jwt_')) {
    return authHeader.replace('Bearer jwt_', '').trim();
  }
  return db.activeUserId;
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req);
    let profile: any = null;

    if (mongoose.connection.readyState === 1 && userId && userId !== 'guest_user') {
      profile = await findUser(userId);
    }

    if (!profile) {
      if (userId && userId !== 'guest_user') {
        profile = db.users.find((u) => u.id === userId);
      }
      if (!profile) {
        profile = db.userProfile;
      }
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
    const userId = resolveUserId(req);
    const { name, bio, avatarUrl } = req.body;

    let updated: any = null;

    if (mongoose.connection.readyState === 1 && userId && userId !== 'guest_user') {
      updated = await updateUser(userId, {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(avatarUrl && { avatarUrl: avatarUrl.trim() }),
      });
    }

    const memUser = db.users.find((u) => u.id === userId);
    if (memUser) {
      if (name) memUser.name = name.trim();
      if (bio !== undefined) memUser.bio = bio.trim();
      if (avatarUrl) memUser.avatarUrl = avatarUrl.trim();
    }

    const memProfile = db.userProfile;
    if (name) memProfile.name = name.trim();
    if (bio !== undefined) memProfile.bio = bio.trim();
    if (avatarUrl) memProfile.avatarUrl = avatarUrl.trim();

    const finalObj = updated ? updated.toJSON() : memUser || { ...memProfile };
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    let user: any = null;
    if (mongoose.connection.readyState === 1 && userId && userId !== 'guest_user') {
      user = await findUser(userId);
    }
    if (!user) {
      user = db.users.find((u) => u.id === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password if user has one
    if (user.password && currentPassword && user.password !== currentPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
      });
    }

    if (mongoose.connection.readyState === 1 && userId && userId !== 'guest_user') {
      await updateUser(userId, { password: newPassword.trim() });
    }

    const memUser = db.users.find((u) => u.id === userId);
    if (memUser) {
      memUser.password = newPassword.trim();
    }

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error changing password', error });
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

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req);
    let bookmarkIds: string[] = db.userProfile.bookmarkedArticleIds || [];
    let bookmarkedArticles: any[] = [];

    if (mongoose.connection.readyState === 1 && userId && userId !== 'guest_user') {
      const user = await findUser(userId);
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
      if (userId && userId !== 'guest_user') {
        const u = db.users.find((user) => user.id === userId);
        if (u) bookmarkIds = u.bookmarkedArticleIds || [];
      }
      bookmarkedArticles = db.articles.filter((a) => bookmarkIds.includes(a.id));
    }

    const sanitized = bookmarkedArticles.map((a: any) => {
      const plain = a.toJSON ? a.toJSON() : { ...a };
      plain.id = plain.customId || (plain._id ? plain._id.toString() : plain.id);
      return plain;
    });

    res.json({
      success: true,
      count: sanitized.length,
      bookmarkedIds: bookmarkIds,
      data: sanitized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving bookmarks', error });
  }
};

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const activeUserId = resolveUserId(req);
    if (!activeUserId || activeUserId === 'guest_user' || activeUserId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'Aap bina login kiye bookmark/save nahi kar sakte. Pehle login karein.',
      });
    }

    const { articleId } = req.params;

    let targetUser = db.users.find((u) => u.id === activeUserId) || db.userProfile;
    let currentBookmarks: string[] = targetUser.bookmarkedArticleIds || [];

    if (mongoose.connection.readyState === 1 && activeUserId) {
      const user = await findUser(activeUserId);
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

    if (mongoose.connection.readyState === 1 && activeUserId) {
      await updateUser(activeUserId, { bookmarkedArticleIds: updatedBookmarks });
    }

    targetUser.bookmarkedArticleIds = updatedBookmarks;

    res.json({
      success: true,
      message: isBookmarked ? 'Article bookmark removed' : 'Article bookmarked successfully',
      isBookmarked: !isBookmarked,
      bookmarkedIds: updatedBookmarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating bookmark', error });
  }
};
