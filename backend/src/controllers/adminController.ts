import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { SubmissionModel } from '../models/Submission';
import { BannerModel } from '../models/Banner';
import { ArticleModel } from '../models/Article';
import { db } from '../data/db';
import { UserProfile, UserRole, SubmissionStatus, TargetAudience, Article } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getAdminUsers = async (_req: Request, res: Response) => {
  try {
    let users: any[] = [];

    if (mongoose.connection.readyState === 1) {
      users = await UserModel.find().sort({ createdAt: -1 });
    }

    if (users.length === 0) {
      users = db.users;
    }

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving users list', error });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, bio, avatarUrl } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and role (JOURNALIST, EXPERT, USER, ADMIN) are required.',
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existingInDb = await UserModel.findOne({ email: emailLower });
      if (existingInDb) {
        return res.status(400).json({
          success: false,
          message: `User with email ${emailLower} already exists in database.`,
        });
      }
    }

    const userRole: UserRole = ['USER', 'JOURNALIST', 'EXPERT', 'ADMIN'].includes(role.toUpperCase())
      ? (role.toUpperCase() as UserRole)
      : 'JOURNALIST';

    const getRoleBadge = (r: UserRole) => {
      switch (r) {
        case 'ADMIN':
          return 'CHIEF EDITOR';
        case 'JOURNALIST':
          return 'STAFF JOURNALIST';
        case 'EXPERT':
          return 'GROUND EXPERT';
        default:
          return 'CITIZEN REPORTER';
      }
    };

    const newUserData = {
      name: name.trim(),
      email: emailLower,
      password: password || (userRole === 'ADMIN' ? 'admin123' : userRole === 'JOURNALIST' ? 'journalist123' : userRole === 'EXPERT' ? 'expert123' : 'citizen123'),
      role: userRole,
      roleBadge: getRoleBadge(userRole),
      bio: bio?.trim() || `Accredited ${userRole.toLowerCase()} correspondent on Next Truth Platform.`,
      avatarUrl:
        avatarUrl ||
        (userRole === 'JOURNALIST'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA'
          : userRole === 'EXPERT'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuByJne4Qwb-P_F0TU4UfX9xzAvqDm3Nlyhd__LQkUAzHvVbrWdeM-eyCU7rDdmkjNROjSE017nAoagBS5p7XsGXwdDf-o9ezd-oEBOguBVOuR1kmAgwcRxZwgPqSOYRRN6DjnHnhm_kl203eHMM58OLlsjwEhP5Jf7lt-MqiSxnx6F3tU4H7qrJsA05l_FOkCfThzR3UMoprtysOJlrP6iqok6QYPoVTC6ZErCUm4L4qywn3VopvOWQxA'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'),
      isPremium: true,
      publishedCount: 0,
      totalViews: '0',
      bookmarkedArticleIds: [],
    };

    let createdUser: any = null;

    if (mongoose.connection.readyState === 1) {
      createdUser = await UserModel.create(newUserData);
    }

    const memoryUser: UserProfile = {
      id: createdUser ? createdUser._id.toString() : `user_${uuidv4().substring(0, 8)}`,
      ...newUserData,
      createdAt: new Date().toISOString(),
    };

    db.users.push(memoryUser);

    const userObj = createdUser ? createdUser.toJSON() : { ...memoryUser };
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: `New ${userRole} account for ${userObj.name} created successfully in MongoDB.`,
      data: userObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating user', error });
  }
};

export const updateSubmissionVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
      const query = isObjectId ? { _id: id } : { customId: id };
      updated = await SubmissionModel.findOneAndUpdate(
        query,
        {
          status: status.toUpperCase(),
          ...(note !== undefined && { note }),
        },
        { new: true }
      );
    }

    const memSub = db.submissions.find((s) => s.id === id);
    if (memSub) {
      if (status) memSub.status = status.toUpperCase() as SubmissionStatus;
      if (note !== undefined) memSub.note = note;
      memSub.updatedAt = new Date().toISOString();
    }

    const targetSub = updated ? updated.toJSON() : memSub;

    if (!targetSub) {
      return res.status(404).json({ success: false, message: `Submission with ID ${id} not found` });
    }

    // If APPROVED, publish this post as a verified ground news article on Home feed
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

      const publishedArticleData = {
        customId: `art_sub_${targetSub.id || targetSub._id || uuidv4().substring(0, 8)}`,
        title: targetSub.title,
        excerpt: targetSub.description ? targetSub.description.substring(0, 160) : targetSub.title,
        fullContent: targetSub.description || targetSub.title,
        authorName,
        authorTitle,
        authorAvatarUrl: authorAvatar,
        dateOrTimeAgo: 'Just now (Approved)',
        category: targetSub.category || 'Ground Reports',
        imageUrl: imgUrl,
        isVerifiedGround: true,
        isHero: false,
        readTime: '2 min',
        views: '1',
        viewCount: 1,
        categoryTag: 'VERIFIED DISPATCH',
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
      message: `Submission ${id} updated to ${status} and published to Home feed.`,
      data: targetSub,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating submission verification', error });
  }
};

export const updateSponsoredBanner = async (req: Request, res: Response) => {
  try {
    const { title, sponsorName, subtitle, badge, ctaText, actionUrl, targetAudience } = req.body;

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      updated = await BannerModel.findOneAndUpdate(
        {},
        {
          ...(title && { title }),
          ...(sponsorName && { sponsorName }),
          ...(subtitle !== undefined && { subtitle }),
          ...(badge && { badge }),
          ...(ctaText && { ctaText }),
          ...(actionUrl && { actionUrl }),
          ...(targetAudience && { targetAudience: targetAudience as TargetAudience }),
        },
        { new: true, upsert: true }
      );
    }

    if (title) db.sponsoredBanner.title = title;
    if (sponsorName) db.sponsoredBanner.sponsorName = sponsorName;
    if (subtitle !== undefined) db.sponsoredBanner.subtitle = subtitle;
    if (badge) db.sponsoredBanner.badge = badge;
    if (ctaText) db.sponsoredBanner.ctaText = ctaText;
    if (actionUrl) db.sponsoredBanner.actionUrl = actionUrl;
    if (targetAudience) db.sponsoredBanner.targetAudience = targetAudience as TargetAudience;

    res.json({
      success: true,
      message: 'Sponsored campaign and audience targeting updated successfully in database',
      data: updated ? updated.toJSON() : db.sponsoredBanner,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating sponsored banner', error });
  }
};
