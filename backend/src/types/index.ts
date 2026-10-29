export type MainTab = 'HOME' | 'VIDEO' | 'COLUMNS' | 'POST' | 'PROFILE';

export type SubmissionStatus = 'PENDING' | 'REVISE' | 'APPROVED';

export type UserRole = 'USER' | 'JOURNALIST' | 'EXPERT' | 'ADMIN';

export type TargetAudience = 'ALL' | 'PREMIUM_ONLY' | 'COMMUNITY_ONLY' | 'INVESTIGATIVE';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  fullContent: string;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl: string;
  dateOrTimeAgo: string;
  category: string;
  imageUrl: string;
  isVerifiedGround?: boolean;
  isUrgent?: boolean;
  isPremium?: boolean;
  isHero?: boolean;
  isOpinion?: boolean;
  isAuthorColumn?: boolean;
  isBentoPublished?: boolean;
  readTime?: string;
  views?: string;
  viewCount?: number;
  categoryTag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoReport {
  id: string;
  title: string;
  videoThumbnailUrl: string;
  videoUrl?: string;
  isLive: boolean;
  isReplay: boolean;
  reporterName: string;
  location: string;
  viewersCount: string;
  likesCount: number;
  description?: string;
  createdAt?: string;
}

export interface Submission {
  id: string;
  title: string;
  status: SubmissionStatus;
  submittedTimeAgo: string;
  note: string;
  location?: string;
  category?: string;
  description?: string;
  attachments?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleBadge: string;
  bio: string;
  avatarUrl: string;
  isPremium: boolean;
  publishedCount?: number;
  totalViews?: string;
  bookmarkedArticleIds: string[];
  likedVideoIds?: string[];
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  isUrgent?: boolean;
  isRead?: boolean;
  type?: 'URGENT' | 'SUBMISSION' | 'EDITORIAL' | 'SYSTEM';
  targetArticleId?: string;
  createdAt: string;
}

export interface SponsoredBanner {
  id: string;
  title: string;
  sponsorName: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  actionUrl: string;
  targetAudience?: TargetAudience;
  imageUrl?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
