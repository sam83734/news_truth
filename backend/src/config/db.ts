import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { ArticleModel } from '../models/Article';
import { VideoModel } from '../models/Video';
import { SubmissionModel } from '../models/Submission';
import { NotificationModel } from '../models/Notification';
import { BannerModel } from '../models/Banner';
import { CategoryModel } from '../models/Category';
import { db } from '../data/db';

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexttruth';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`🍃 Connected to MongoDB Database: ${mongoUri}`);

    // Auto-seed initial data to MongoDB if empty
    await seedDatabaseIfEmpty();

    return true;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection error (${error.message}). Running with in-memory sync mode.`);
    return false;
  }
};

const seedDatabaseIfEmpty = async () => {
  try {
    // 1. Seed Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial users into MongoDB...');
      for (const u of db.users) {
        await UserModel.create({
          customId: u.id,
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password || 'password123',
          role: u.role,
          roleBadge: u.roleBadge,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          isPremium: u.isPremium,
          publishedCount: u.publishedCount || 0,
          totalViews: u.totalViews || '0',
          bookmarkedArticleIds: u.bookmarkedArticleIds || [],
        });
      }
    }

    // 2. Seed Articles
    const articleCount = await ArticleModel.countDocuments();
    if (articleCount === 0) {
      console.log('🌱 Seeding initial articles into MongoDB...');
      for (const a of db.articles) {
        await ArticleModel.create({
          customId: a.id,
          title: a.title,
          excerpt: a.excerpt,
          fullContent: a.fullContent,
          authorName: a.authorName,
          authorTitle: a.authorTitle,
          authorAvatarUrl: a.authorAvatarUrl,
          dateOrTimeAgo: a.dateOrTimeAgo,
          category: a.category,
          imageUrl: a.imageUrl,
          isVerifiedGround: a.isVerifiedGround,
          isUrgent: a.isUrgent,
          isPremium: a.isPremium,
          isHero: a.isHero,
          isOpinion: a.isOpinion,
          isAuthorColumn: a.isAuthorColumn,
          isBentoPublished: a.isBentoPublished,
          readTime: a.readTime,
          views: a.views,
          viewCount: a.viewCount,
          categoryTag: a.categoryTag,
        });
      }
    }

    // 3. Seed Videos
    const videoCount = await VideoModel.countDocuments();
    if (videoCount === 0) {
      console.log('🌱 Seeding initial videos into MongoDB...');
      for (const v of db.liveVideos) {
        await VideoModel.create({
          customId: v.id,
          title: v.title,
          videoThumbnailUrl: v.videoThumbnailUrl,
          videoUrl: v.videoUrl,
          isLive: v.isLive,
          isReplay: v.isReplay,
          reporterName: v.reporterName,
          location: v.location,
          viewersCount: v.viewersCount,
          likesCount: v.likesCount,
          description: v.description,
        });
      }
    }

    // 4. Seed Submissions
    const subCount = await SubmissionModel.countDocuments();
    if (subCount === 0) {
      console.log('🌱 Seeding initial submissions into MongoDB...');
      for (const s of db.submissions) {
        await SubmissionModel.create({
          customId: s.id,
          title: s.title,
          status: s.status,
          submittedTimeAgo: s.submittedTimeAgo,
          note: s.note,
          location: s.location,
          category: s.category,
          description: s.description,
          attachments: s.attachments,
          userId: s.userId,
        });
      }
    }

    // 5. Seed Notifications
    const notifCount = await NotificationModel.countDocuments();
    if (notifCount === 0) {
      console.log('🌱 Seeding initial notifications into MongoDB...');
      for (const n of db.notifications) {
        await NotificationModel.create({
          customId: n.id,
          title: n.title,
          message: n.message,
          timeAgo: n.timeAgo,
          isUrgent: n.isUrgent,
          isRead: n.isRead,
          type: n.type,
          targetArticleId: n.targetArticleId,
        });
      }
    }

    // 6. Seed Banner
    const bannerCount = await BannerModel.countDocuments();
    if (bannerCount === 0) {
      console.log('🌱 Seeding initial sponsored banner into MongoDB...');
      const b = db.sponsoredBanner;
      await BannerModel.create({
        title: b.title,
        sponsorName: b.sponsorName,
        subtitle: b.subtitle,
        badge: b.badge,
        ctaText: b.ctaText,
        actionUrl: b.actionUrl,
        targetAudience: b.targetAudience || 'ALL',
      });
    }

    // 7. Seed Categories
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0) {
      console.log('🌱 Seeding initial categories into MongoDB...');
      for (const c of db.categories) {
        await CategoryModel.create({
          name: c.name,
          slug: c.slug,
          description: c.description,
        });
      }
    }

    console.log('✨ MongoDB initialization complete!');
  } catch (err: any) {
    console.warn('Seeding warning:', err?.message);
  }
};
