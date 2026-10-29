import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import {
  Article,
  VideoReport,
  Submission,
  UserProfile,
  NotificationItem,
  MainTab,
  UserRole,
  SubmissionStatus,
  SponsoredBannerData,
} from '../types';
import { newsApi } from '../api/newsApi';

interface NewsContextType {
  currentTab: MainTab;
  selectTab: (tab: MainTab) => void;
  heroArticle: Article | null;
  liveVideos: VideoReport[];
  opinionArticle: Article | null;
  standardNewsArticles: Article[];
  premiumColumnArticle: Article | null;
  moreAuthorArticles: Article[];
  userProfile: UserProfile;
  submissions: Submission[];
  publishedBentoArticles: Article[];
  bookmarkedArticleIds: Set<string>;
  toggleBookmark: (articleId: string) => Promise<void>;
  likedVideoIds: Set<string>;
  toggleVideoLike: (videoId: string) => Promise<number | undefined>;
  isUserPremium: boolean;
  upgradeToPremium: () => Promise<void>;
  selectedArticle: Article | null;
  openArticle: (article: Article) => void;
  closeArticle: () => void;
  selectedVideo: VideoReport | null;
  openVideo: (video: VideoReport) => void;
  closeVideo: () => void;
  showPremiumDialog: boolean;
  setShowPremiumDialog: (show: boolean) => void;
  showNotificationDialog: boolean;
  setShowNotificationDialog: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showAdminUserModal: boolean;
  setShowAdminUserModal: (show: boolean) => void;
  showSearchModal: boolean;
  setShowSearchModal: (show: boolean) => void;
  showSponsoredModal: boolean;
  setShowSponsoredModal: (show: boolean) => void;
  sponsoredBanner: SponsoredBannerData | null;
  updateSponsoredBanner: (banner: Partial<SponsoredBannerData>) => Promise<void>;
  notifications: NotificationItem[];
  toastMessage: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
  activeCategoryFilter: string;
  setCategoryFilter: (category: string) => void;
  submitReport: (
    title: string,
    category: string,
    location: string,
    description: string,
    sourceNotes: string,
    attachments?: string,
    audioUri?: string
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  login: (role?: UserRole, email?: string, password?: string) => Promise<void>;
  register: (name: string, email: string, role: UserRole, bio?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfilePhoto: (avatarUrl: string) => Promise<void>;
  createAdminUser: (payload: { name: string; email: string; password?: string; role: UserRole; bio?: string }) => Promise<void>;
  updateSubmissionStatus: (id: string, status: SubmissionStatus, note?: string) => Promise<void>;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
}

const guestProfile: UserProfile = {
  id: 'guest_user',
  name: 'Guest',
  email: '',
  role: 'USER',
  roleBadge: 'GUEST',
  bio: '',
  avatarUrl: '',
  isPremium: false,
  publishedCount: 0,
  totalViews: '0',
  bookmarkedArticleIds: [],
  likedVideoIds: [],
};

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<MainTab>('HOME');
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const [liveVideos, setLiveVideos] = useState<VideoReport[]>([]);
  const [opinionArticle, setOpinionArticle] = useState<Article | null>(null);
  const [standardNewsArticles, setStandardNewsArticles] = useState<Article[]>([]);
  const [premiumColumnArticle, setPremiumColumnArticle] = useState<Article | null>(null);
  const [moreAuthorArticles, setMoreAuthorArticles] = useState<Article[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(guestProfile);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [publishedBentoArticles, setPublishedBentoArticles] = useState<Article[]>([]);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<Set<string>>(new Set());
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [isUserPremium, setIsUserPremium] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoReport | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState<boolean>(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdminUserModal, setShowAdminUserModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSponsoredModal, setShowSponsoredModal] = useState<boolean>(false);
  const [sponsoredBanner, setSponsoredBanner] = useState<SponsoredBannerData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const selectTab = (tab: MainTab) => {
    if (tab === 'POST') {
      const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';
      if (isGuest) {
        Alert.alert(
          'Login Required',
          'Aap bina login kiye post create nahi kar sakte. Post create karne ke liye pehle login karein.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Login / Register',
              onPress: () => setShowAuthModal(true),
            },
          ]
        );
        return;
      }
    }
    setCurrentTab(tab);
  };

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    if (article?.id) {
      newsApi.getArticleById(article.id).catch(() => {});
    }
  };
  const closeArticle = () => setSelectedArticle(null);

  const openVideo = (video: VideoReport) => setSelectedVideo(video);
  const closeVideo = () => setSelectedVideo(null);

  const showToast = (msg: string) => setToastMessage(msg);
  const clearToast = () => setToastMessage(null);

  // Fetch all initial data from backend API
  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [
        heroRes,
        opinionRes,
        columnsRes,
        videosRes,
        articlesRes,
        profileRes,
        submissionsRes,
        bentoRes,
        bookmarksRes,
        notifsRes,
        bannerRes,
      ] = await Promise.allSettled([
        newsApi.getHeroArticle(),
        newsApi.getOpinionArticle(),
        newsApi.getPremiumColumns(),
        newsApi.getVideos(),
        newsApi.getArticles(activeCategoryFilter),
        newsApi.getUserProfile(),
        newsApi.getSubmissions(),
        newsApi.getPublishedBento(),
        newsApi.getBookmarks(),
        newsApi.getNotifications(),
        newsApi.getSponsoredBanner(),
      ]);

      if (heroRes.status === 'fulfilled' && heroRes.value) {
        setHeroArticle(heroRes.value);
      }
      if (opinionRes.status === 'fulfilled' && opinionRes.value) {
        setOpinionArticle(opinionRes.value);
      }
      if (columnsRes.status === 'fulfilled' && columnsRes.value) {
        setPremiumColumnArticle(columnsRes.value.premiumColumn);
        setMoreAuthorArticles(columnsRes.value.moreAuthorArticles || []);
      }
      if (videosRes.status === 'fulfilled' && videosRes.value) {
        setLiveVideos(videosRes.value);
      }
      if (articlesRes.status === 'fulfilled' && articlesRes.value) {
        const std = articlesRes.value.filter(
          (a) => a.id !== 'hero_1' && a.id !== 'op_1' && !a.isBentoPublished
        );
        setStandardNewsArticles(std.length > 0 ? std : articlesRes.value);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setUserProfile(profileRes.value);
        setIsUserPremium(Boolean(profileRes.value.isPremium));
        if (profileRes.value.bookmarkedArticleIds) {
          setBookmarkedArticleIds(new Set(profileRes.value.bookmarkedArticleIds));
        }
        if (profileRes.value.likedVideoIds) {
          setLikedVideoIds(new Set(profileRes.value.likedVideoIds));
        }
      }
      if (submissionsRes.status === 'fulfilled' && submissionsRes.value) {
        setSubmissions(submissionsRes.value);
      }
      if (bentoRes.status === 'fulfilled' && bentoRes.value) {
        setPublishedBentoArticles(bentoRes.value);
      }
      if (bookmarksRes.status === 'fulfilled' && bookmarksRes.value) {
        setBookmarkedArticleIds(new Set(bookmarksRes.value.bookmarkedIds || []));
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value) {
        setNotifications(notifsRes.value);
      }
      if (bannerRes.status === 'fulfilled' && bannerRes.value) {
        setSponsoredBanner(bannerRes.value);
      }
    } catch (err) {
      console.warn('[NewsContext] Error fetching initial data from backend:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeCategoryFilter]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle category filter change
  const setCategoryFilter = async (category: string) => {
    setActiveCategoryFilter(category);
    try {
      const filteredArticles = await newsApi.getArticles(category);
      setStandardNewsArticles(filteredArticles);
    } catch (err) {
      console.warn('[NewsContext] Error updating category filter:', err);
    }
  };

  // Toggle bookmark with API persistence
  const toggleBookmark = async (articleId: string) => {
    const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';
    if (isGuest) {
      Alert.alert(
        'Login Required',
        'Aap bina login kiye post bookmark/save nahi kar sakte. Post save karne ke liye pehle login karein.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login / Register',
            onPress: () => setShowAuthModal(true),
          },
        ]
      );
      return;
    }

    const isCurrentlyBookmarked = bookmarkedArticleIds.has(articleId);
    setBookmarkedArticleIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });

    try {
      const res = await newsApi.toggleBookmark(articleId);
      showToast(res.isBookmarked ? 'Article saved to reading list' : 'Removed from reading list');
    } catch (err) {
      setBookmarkedArticleIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) {
          next.add(articleId);
        } else {
          next.delete(articleId);
        }
        return next;
      });
      showToast('Could not update bookmark. Please try again.');
    }
  };

  // Upgrade to premium
  const upgradeToPremium = async () => {
    try {
      const updatedProfile = await newsApi.upgradePremium();
      setIsUserPremium(true);
      setUserProfile(updatedProfile);
      setShowPremiumDialog(false);
      showToast('Welcome to Next Truth Premium! All ground reports unlocked.');
    } catch (err) {
      setIsUserPremium(true);
      setUserProfile((prev) => ({ ...prev, isPremium: true }));
      setShowPremiumDialog(false);
      showToast('Welcome to Next Truth Premium! All ground reports unlocked.');
    }
  };

  // Auth: Login
  const login = async (role?: UserRole, email?: string, password?: string) => {
    try {
      const res = await newsApi.login({ role, email, password });
      if (res.data) {
        setUserProfile(res.data);
        setIsUserPremium(Boolean(res.data.isPremium));
        if (res.data.bookmarkedArticleIds) {
          setBookmarkedArticleIds(new Set(res.data.bookmarkedArticleIds));
        }
        if (res.data.likedVideoIds) {
          setLikedVideoIds(new Set(res.data.likedVideoIds));
        }
        showToast(res.message || `Logged in as ${res.data.name}`);
        fetchAllData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed');
      throw err;
    }
  };

  // Auth: Register
  const register = async (name: string, email: string, role: UserRole, bio?: string, password?: string) => {
    try {
      const res = await newsApi.register({ name, email, password, role, bio });
      if (res.data) {
        setUserProfile(res.data);
        setIsUserPremium(Boolean(res.data.isPremium));
        if (res.data.bookmarkedArticleIds) {
          setBookmarkedArticleIds(new Set(res.data.bookmarkedArticleIds));
        }
        if (res.data.likedVideoIds) {
          setLikedVideoIds(new Set(res.data.likedVideoIds));
        }
        showToast(`Welcome, ${res.data.name}! Account registered.`);
        fetchAllData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed');
      throw err;
    }
  };

  // Auth: Logout (clears session and redirects directly to Login page)
  const logout = async () => {
    try {
      await newsApi.logout();
    } catch (err) {
      // Ignore network error on logout
    } finally {
      setUserProfile(guestProfile);
      setIsUserPremium(false);
      setSubmissions([]);
      setBookmarkedArticleIds(new Set());
      setLikedVideoIds(new Set());
      showToast('Logged out. Please sign in to continue.');
      setShowAuthModal(true);
    }
  };

  // Admin: Create new staff user
  const createAdminUser = async (payload: { name: string; email: string; password?: string; role: UserRole; bio?: string }) => {
    try {
      const newUser = await newsApi.createAdminUser(payload);
      showToast(`Account created for ${newUser.name} (${newUser.roleBadge})`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create user');
      throw err;
    }
  };

  // Update Profile Photo
  const updateUserProfilePhoto = async (avatarUrl: string) => {
    try {
      const updated = await newsApi.updateUserProfile({ avatarUrl });
      setUserProfile(updated);
      showToast('Profile photo updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile photo');
      throw err;
    }
  };

  // Admin: Moderate submission status
  const updateSubmissionStatus = async (id: string, status: SubmissionStatus, note?: string) => {
    try {
      const updated = await newsApi.updateSubmissionStatus(id, status, note);
      setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast(`Submission marked as ${status}`);
      if (status === 'APPROVED') {
        fetchAllData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating submission');
    }
  };

  // Admin: Update Sponsored Banner & Audience Targeting
  const updateSponsoredBanner = async (bannerData: Partial<SponsoredBannerData>) => {
    try {
      const updated = await newsApi.updateSponsoredBanner(bannerData);
      setSponsoredBanner(updated);
      showToast('Sponsored campaign & audience updated!');
      fetchAllData(true);
    } catch (err: any) {
      showToast(err.message || 'Error updating sponsored banner');
    }
  };

  // Submit report to backend API
  const submitReport = async (
    title: string,
    category: string,
    location: string,
    description: string,
    sourceNotes: string,
    attachments?: string,
    audioUri?: string
  ) => {
    if (!title.trim()) return;

    const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';
    if (isGuest) {
      Alert.alert(
        'Login Required',
        'Aap bina login kiye post create nahi kar sakte. Post create karne ke liye pehle login karein.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login / Register',
            onPress: () => setShowAuthModal(true),
          },
        ]
      );
      return;
    }

    try {
      const newSubmission = await newsApi.createSubmission({
        title: title.trim(),
        category,
        location,
        description,
        sourceNotes,
        attachments,
        audioUri,
      });

      setSubmissions((prev) => [newSubmission, ...prev]);
      showToast('Report transmitted to Verification Desk!');
      // Refresh notifications and full data so the new submission appears
      newsApi.getNotifications().then(setNotifications).catch(() => {});
      fetchAllData(true);
    } catch (err) {
      console.warn('[NewsContext] Submission API error:', err);
      const fallbackSub: Submission = {
        id: `sub_${Date.now()}`,
        title: title.trim(),
        status: 'PENDING',
        submittedTimeAgo: 'Just now',
        note: sourceNotes || 'Under editorial review',
        location: location || 'Downtown Metro',
        category,
        attachments,
        audioUri,
        authorName: userProfile.name,
        authorAvatarUrl: userProfile.avatarUrl,
        createdAt: new Date().toISOString(),
      };
      setSubmissions((prev) => [fallbackSub, ...prev]);
      showToast('Report transmitted to Verification Desk!');
    }
  };

  // Toggle video like
  const toggleVideoLike = async (videoId: string): Promise<number | undefined> => {
    const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';
    if (isGuest) {
      Alert.alert(
        'Login Required',
        'Aap bina login kiye video like nahi kar sakte. Video like karne ke liye pehle login karein.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login / Register',
            onPress: () => setShowAuthModal(true),
          },
        ]
      );
      return undefined;
    }

    const isCurrentlyLiked = likedVideoIds.has(videoId);
    const action = isCurrentlyLiked ? 'unlike' : 'like';

    setLikedVideoIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });

    try {
      const newLikesCount = await newsApi.toggleVideoLike(videoId, action);
      if (typeof newLikesCount === 'number') {
        setLiveVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, likesCount: newLikesCount } : v))
        );
      }
      showToast(isCurrentlyLiked ? 'Video like removed' : 'Video liked');
      return newLikesCount;
    } catch (err) {
      setLikedVideoIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.add(videoId);
        } else {
          next.delete(videoId);
        }
        return next;
      });
      console.warn('[NewsContext] Error toggling video like:', err);
      return undefined;
    }
  };

  // Mark notification read
  const markNotificationRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    try {
      await newsApi.markNotificationRead(notificationId);
    } catch (err) {
      console.warn('[NewsContext] Error marking notification read:', err);
    }
  };

  // Mark all notifications read
  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await newsApi.markAllNotificationsRead();
    } catch (err) {
      console.warn('[NewsContext] Error marking all notifications read:', err);
    }
  };

  const refreshData = async () => {
    await fetchAllData(true);
  };

  return (
    <NewsContext.Provider
      value={{
        currentTab,
        selectTab,
        heroArticle,
        liveVideos,
        opinionArticle,
        standardNewsArticles,
        premiumColumnArticle,
        moreAuthorArticles,
        userProfile,
        submissions,
        publishedBentoArticles,
        bookmarkedArticleIds,
        toggleBookmark,
        likedVideoIds,
        toggleVideoLike,
        isUserPremium,
        upgradeToPremium,
        selectedArticle,
        openArticle,
        closeArticle,
        selectedVideo,
        openVideo,
        closeVideo,
        showPremiumDialog,
        setShowPremiumDialog,
        showNotificationDialog,
        setShowNotificationDialog,
        showAuthModal,
        setShowAuthModal,
        showAdminUserModal,
        setShowAdminUserModal,
        showSearchModal,
        setShowSearchModal,
        showSponsoredModal,
        setShowSponsoredModal,
        sponsoredBanner,
        updateSponsoredBanner,
        notifications,
        toastMessage,
        clearToast,
        showToast,
        activeCategoryFilter,
        setCategoryFilter,
        submitReport,
        markNotificationRead,
        markAllNotificationsRead,
        login,
        register,
        logout,
        updateUserProfilePhoto,
        createAdminUser,
        updateSubmissionStatus,
        isLoading,
        isRefreshing,
        refreshData,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
