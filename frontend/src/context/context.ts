import { createContext, useContext } from 'react';
import type {
  Article,
  VideoReport,
  UserProfile,
  CategoryItem,
  UserRole,
  Submission,
  LayoutConfig,
} from '../types';

export interface AudioState {
  article: Article | null;
  isPlaying: boolean;
  progress: number;
  duration: string;
  speed: number;
}

export interface AppContextType {
  currentUser: UserProfile | null;
  articles: Article[];
  heroArticle: Article | null;
  videos: VideoReport[];
  categories: CategoryItem[];
  submissions: Submission[];
  layoutConfig: LayoutConfig;
  activeCategory: string;
  searchQuery: string;
  selectedArticle: Article | null;
  isSubmitModalOpen: boolean;
  isAdminModalOpen: boolean;
  isDLTModalOpen: boolean;
  isSupportModalOpen: boolean;
  isAuthModalOpen: boolean;
  isDashboardOpen: boolean;
  isProfileModalOpen: boolean;
  bookmarkedIds: string[];
  likedVideoIds: string[];
  audioState: AudioState;
  lightboxMedia: { url: string; title?: string; type?: 'image' | 'video' } | null;
  loading: boolean;
  setCategory: (cat: string) => void;
  setSearch: (q: string) => void;
  selectArticle: (a: Article | null) => void;
  toggleBookmarkItem: (articleId: string) => Promise<void>;
  toggleLikeVideo: (videoId: string) => Promise<void>;
  switchUserRole: (role: UserRole | 'GUEST') => Promise<void>;
  openSubmitModal: (open: boolean) => void;
  openAdminModal: (open: boolean) => void;
  openDLTModal: (open: boolean) => void;
  openSupportModal: (open: boolean) => void;
  openAuthModal: (open: boolean) => void;
  openDashboard: (open: boolean) => void;
  openProfileModal: (open: boolean) => void;
  openLightbox: (url: string, title?: string, type?: 'image' | 'video') => void;
  closeLightbox: () => void;
  formatTimeAgo: (date?: string | Date) => string;
  logout: () => void;
  loginWithCredentials: (email: string, password?: string) => Promise<void>;
  registerNewAccount: (userData: any) => Promise<void>;
  updateProfileData: (data: { name?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateLayoutConfigSetting: (config: Partial<LayoutConfig>) => Promise<void>;
  addNewCategory: (name: string, description?: string) => Promise<CategoryItem>;
  createLiveStreamVideo: (videoData: Partial<VideoReport>) => Promise<VideoReport>;
  deleteLiveStreamVideo: (id: string) => Promise<void>;
  updateLiveStreamVideo: (id: string, updates: Partial<VideoReport>) => Promise<VideoReport>;
  refreshData: () => Promise<void>;
  refreshSubmissions: (targetUserId?: string) => Promise<Submission[]>;
  addSubmissionLocally: (sub: Submission) => void;
  playArticleAudio: (article: Article | null) => void;
  stopAudio: () => void;
  toggleAudioPlayback: () => void;
  setAudioSpeed: (speed: number) => void;
  seekAudio: (percent: number) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

