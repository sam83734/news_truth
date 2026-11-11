export type UserRole = 'USER' | 'JOURNALIST' | 'EXPERT' | 'ADMIN';
export type SubmissionStatus = 'PENDING' | 'PENDING_EXPERT' | 'PENDING_JOURNALIST' | 'REVISE' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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

export interface DLTValidatorSignature {
  nodeId: string;
  nodeName: string;
  signature: string;
  timestamp: string;
  status: 'VALID' | 'ANCHORED';
}

export interface DLTBlock {
  blockIndex: number;
  blockHash: string;
  previousHash: string;
  contentHash: string;
  merkleRoot: string;
  timestamp: string;
  entityId: string;
  title: string;
  author: string;
  category: string;
  ipfsCid: string;
  validators: DLTValidatorSignature[];
  status: 'CONFIRMED_IMMUTABLE' | 'TAMPER_ALERT';
}

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
  videoUrl?: string;
  mediaType?: 'image' | 'video';
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
  verifiedByJournalist?: string;
  factCheckedBy?: string;
  finalAuditor?: string;
  editorialDesk?: string;
  verificationStatus?: string;
  createdAt?: string;
  // DLT Cryptographic Ledger Verification
  dltBlockHash?: string;
  dltBlockIndex?: number;
  dltContentHash?: string;
  dltIpfsCid?: string;
  dltStatus?: 'CONFIRMED_IMMUTABLE' | 'PENDING' | 'TAMPER_ALERT';
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
  authorName?: string;
  authorAvatarUrl?: string;
  rejectionReason?: string;
  requireJournalistReview?: boolean;
  requireExpertFactCheck?: boolean;
  journalistApproval?: {
    approved: boolean;
    approverName: string;
    approverId?: string;
    approverRole?: string;
    timestamp: string;
    note?: string;
  };
  expertApproval?: {
    approved: boolean;
    approverName: string;
    approverId?: string;
    approverRole?: string;
    timestamp: string;
    note?: string;
  };
  verifiedByJournalist?: string;
  factCheckedBy?: string;
  finalApprovedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface SponsoredBanner {
  id: string;
  title: string;
  sponsorName: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  actionUrl: string;
  imageUrl?: string;
  targetAudience?: 'ALL' | 'PREMIUM_ONLY' | 'COMMUNITY_ONLY' | 'INVESTIGATIVE' | string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'WHISTLEBLOWER_TIP' | 'CENSORSHIP_REPORT' | 'FACT_CHECK' | 'GENERAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  isAnonymous?: boolean;
  createdAt: string;
}

export interface LayoutConfig {
  heroBannerCategory: string;
  secondaryBannerCategory: string;
  secondaryBannerTitle?: string;
  videoSectionCategory: string;
}

