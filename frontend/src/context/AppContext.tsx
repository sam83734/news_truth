import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  Article,
  VideoReport,
  UserProfile,
  CategoryItem,
  UserRole,
  Submission,
  LayoutConfig,
} from '../types';
import {
  fetchArticles,
  fetchHeroArticle,
  fetchVideos,
  fetchCategories,
  fetchSubmissions,
  fetchUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  likeVideo,
  toggleBookmark as apiToggleBookmark,
  fetchLayoutConfig,
  updateLayoutConfig as apiUpdateLayoutConfig,
  createCategory as apiCreateCategory,
  updateUserProfile as apiUpdateUserProfile,
  changeUserPassword as apiChangePassword,
  createLiveStream as apiCreateLiveStream,
  updateLiveStream as apiUpdateLiveStream,
  deleteLiveStream as apiDeleteLiveStream,
} from '../api/client';
import { formatLiveRelativeTime } from '../utils/timeAgo';
import { AppContext, type AudioState } from './context';

const defaultUserProfiles: Record<string, UserProfile> = {
  CITIZEN: {
    id: 'user_citizen',
    name: 'Rohan Sharma',
    email: 'citizen@nexttruth.media',
    role: 'USER',
    roleBadge: 'CITIZEN REPORTER',
    bio: 'Local community delegate and active eyewitness reporter in District 4.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
    isPremium: false,
    publishedCount: 3,
    totalViews: '8.2k',
    bookmarkedArticleIds: [],
  },
  JOURNALIST: {
    id: 'user_journalist',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@nexttruth.media',
    role: 'JOURNALIST',
    roleBadge: 'STAFF JOURNALIST',
    bio: 'Senior Political and Tech Correspondent investigating algorithmic policy and civic infrastructure.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
    isPremium: true,
    publishedCount: 28,
    totalViews: '310k',
    bookmarkedArticleIds: ['prem_col_1'],
  },
  EXPERT: {
    id: 'user_expert',
    name: 'Elias Thorne',
    email: 'elias.thorne@nexttruth.media',
    role: 'EXPERT',
    roleBadge: 'GROUND EXPERT',
    bio: 'Independent investigative reporter and infrastructure policy researcher.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    isPremium: false,
    publishedCount: 14,
    totalViews: '184k',
    bookmarkedArticleIds: ['hero_1'],
  },
  ADMIN: {
    id: 'user_admin',
    name: 'Dr. Alexander Vance',
    email: 'admin@nexttruth.media',
    role: 'ADMIN',
    roleBadge: 'CHIEF EDITOR',
    bio: 'Editorial Director & Systems Lead overseeing Next Truth global ground reporting networks.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120',
    isPremium: true,
    publishedCount: 42,
    totalViews: '520k',
    bookmarkedArticleIds: ['hero_1', 'op_1'],
  },
  GUEST: {
    id: 'guest_user',
    name: 'Guest Reader',
    email: '',
    role: 'USER',
    roleBadge: 'GUEST',
    bio: 'Public truth observer browsing ground dispatches.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
    isPremium: false,
    bookmarkedArticleIds: [],
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nexttruth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'guest_user') return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const [videos, setVideos] = useState<VideoReport[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDLTModalOpen, setIsDLTModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    heroBannerCategory: 'Urgent Breaking',
    secondaryBannerCategory: 'Tech & Media',
    secondaryBannerTitle: 'Tech & Media News',
    videoSectionCategory: 'All',
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexttruth_liked_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title?: string; type?: 'image' | 'video' } | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-ticker to trigger dynamic live relative times (7m ago, 8m ago) every 30s
  const [timeTicker, setTimeTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTicker((t) => (t + 1) % 100000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = useCallback((date?: string | Date) => {
    // Reference timeTicker to ensure component updates dynamically
    if (timeTicker < 0) return '';
    return formatLiveRelativeTime(date);
  }, [timeTicker]);

  const openLightbox = useCallback((url: string, title?: string, type?: 'image' | 'video') => {
    if (!url) return;
    setLightboxMedia({ url, title, type: type || 'image' });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxMedia(null);
  }, []);

  // Audio Player State & Tracking
  const [audioState, setAudioState] = useState<AudioState>({
    article: null,
    isPlaying: false,
    progress: 0,
    duration: '03:42',
    speed: 1.0,
  });

  const currentCharIndexRef = useRef<number>(0);
  const currentFullTextRef = useRef<string>('');
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const refreshSubmissions = React.useCallback(async (targetUserId?: string): Promise<Submission[]> => {
    try {
      const isApprover = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EXPERT' || currentUser.role === 'JOURNALIST');
      const queryUser = targetUserId !== undefined ? targetUserId : (isApprover ? undefined : currentUser?.id);
      const data = await fetchSubmissions(queryUser);
      setSubmissions(data);
      return data;
    } catch {
      return [];
    }
  }, [currentUser]);

  const addSubmissionLocally = React.useCallback((newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev.filter((s) => s.id !== newSub.id)]);
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      const isApprover = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EXPERT' || currentUser.role === 'JOURNALIST');
      const queryUser = isApprover ? undefined : (currentUser ? currentUser.id : undefined);

      const [artData, heroData, vidData, catData, subData, layoutData] = await Promise.all([
        fetchArticles(activeCategory === 'All' ? undefined : activeCategory, searchQuery),
        fetchHeroArticle(),
        fetchVideos(),
        fetchCategories(),
        fetchSubmissions(queryUser),
        fetchLayoutConfig(),
      ]);

      setArticles(artData);
      setHeroArticle(heroData || artData[0] || null);
      setVideos(vidData);
      setCategories(catData);
      setSubmissions(subData);
      if (layoutData) setLayoutConfig(layoutData);

      if (currentUser && currentUser.id !== 'guest_user') {
        const saved = localStorage.getItem('nexttruth_user');
        if (saved) {
          const profile = await fetchUserProfile(currentUser.id);
          if (profile && localStorage.getItem('nexttruth_user')) {
            setBookmarkedIds(profile.bookmarkedArticleIds || []);
          }
        }
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, currentUser]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadData();
  }, [loadData]);

  // Clean up Web Speech API on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const buildNarrationText = useCallback((article: Article): string => {
    const headline = article.title ? `${article.title.trim()}.` : '';
    const reporter = article.authorName ? `Reported by ${article.authorName.trim()}.` : '';
    // Prevent duplicate reading: if fullContent is present, use only fullContent as body!
    const body =
      article.fullContent && article.fullContent.trim().length > 0
        ? article.fullContent.trim()
        : article.excerpt
        ? article.excerpt.trim()
        : '';

    return `${headline} ${reporter} ${body}`
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const speakFromCharIndex = useCallback(
    (article: Article, charIndex: number, rate: number = 1.0) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const fullText = buildNarrationText(article);
      currentFullTextRef.current = fullText;
      const clampedIndex = Math.max(0, Math.min(charIndex, fullText.length));
      currentCharIndexRef.current = clampedIndex;

      const textToSpeak = fullText.slice(clampedIndex);
      if (!textToSpeak.trim()) {
        setAudioState((prev) => ({ ...prev, isPlaying: false, progress: 100 }));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      currentUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      utterance.onboundary = (e) => {
        const currentAbsolute = clampedIndex + (e.charIndex || 0);
        currentCharIndexRef.current = currentAbsolute;
        if (fullText.length > 0) {
          const pct = Math.min(100, Math.max(0, Math.round((currentAbsolute / fullText.length) * 100)));
          setAudioState((prev) => ({ ...prev, progress: pct }));
        }
      };

      utterance.onend = () => {
        currentCharIndexRef.current = fullText.length;
        setAudioState((prev) => ({ ...prev, isPlaying: false, progress: 100 }));
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('SpeechSynthesis error:', e);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [buildNarrationText]
  );

  const switchUserRole = async (role: UserRole | 'GUEST') => {
    try {
      if (role === 'GUEST') {
        setCurrentUser(null);
        try {
          localStorage.removeItem('nexttruth_user');
        } catch {
          // ignore
        }
        setBookmarkedIds([]);
        return;
      }
      const roleKey = role === 'USER' ? 'CITIZEN' : role;
      const targetUser = defaultUserProfiles[roleKey];
      try {
        const loggedIn = await loginUser(targetUser.email, undefined, role);
        setCurrentUser(loggedIn);
        try {
          localStorage.setItem('nexttruth_user', JSON.stringify(loggedIn));
        } catch {
          // ignore
        }
        setBookmarkedIds(loggedIn.bookmarkedArticleIds || []);
      } catch {
        setCurrentUser(targetUser);
        try {
          localStorage.setItem('nexttruth_user', JSON.stringify(targetUser));
        } catch {
          // ignore
        }
        setBookmarkedIds(targetUser.bookmarkedArticleIds || []);
      }
    } catch (err) {
      console.warn('Switch role error:', err);
    }
  };

  const toggleBookmarkItem = async (articleId: string) => {
    const isCurrently = bookmarkedIds.includes(articleId);
    const updated = isCurrently
      ? bookmarkedIds.filter((id) => id !== articleId)
      : [...bookmarkedIds, articleId];
    setBookmarkedIds(updated);

    if (currentUser && currentUser.id !== 'guest_user') {
      try {
        const serverBookmarks = await apiToggleBookmark(articleId, currentUser.id);
        if (serverBookmarks && serverBookmarks.length > 0) {
          setBookmarkedIds(serverBookmarks);
        }
      } catch (err) {
        console.warn('Bookmark sync warning:', err);
      }
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('nexttruth_user');
      sessionStorage.removeItem('nexttruth_user');
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setIsDashboardOpen(false);
    setBookmarkedIds([]);
    logoutUser().catch(() => {});
  };

  const loginWithCredentials = async (email: string, password?: string) => {
    const user = await loginUser(email, password);
    setCurrentUser(user);
    try {
      localStorage.setItem('nexttruth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setBookmarkedIds(user.bookmarkedArticleIds || []);
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  };

  const registerNewAccount = async (userData: any) => {
    const user = await registerUser(userData);
    setCurrentUser(user);
    try {
      localStorage.setItem('nexttruth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setBookmarkedIds(user.bookmarkedArticleIds || []);
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  };

  const toggleLikeVideo = useCallback(
    async (videoId: string) => {
      const alreadyLiked = likedVideoIds.includes(videoId);
      const action = alreadyLiked ? 'unlike' : 'like';
      const nextLiked = alreadyLiked
        ? likedVideoIds.filter((id) => id !== videoId)
        : [...likedVideoIds, videoId];

      setLikedVideoIds(nextLiked);
      try {
        localStorage.setItem('nexttruth_liked_videos', JSON.stringify(nextLiked));
      } catch {
        // ignore
      }

      // Optimistically update video like count
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === videoId
            ? {
                ...v,
                likesCount: Math.max(0, (v.likesCount || 0) + (alreadyLiked ? -1 : 1)),
              }
            : v
        )
      );

      try {
        const res = await likeVideo(videoId, action, currentUser?.id);
        if (res.likesCount !== undefined) {
          setVideos((prevVideos) =>
            prevVideos.map((v) =>
              v.id === videoId ? { ...v, likesCount: res.likesCount } : v
            )
          );
        }
        if (res.likedVideoIds) {
          setLikedVideoIds(res.likedVideoIds);
          try {
            localStorage.setItem('nexttruth_liked_videos', JSON.stringify(res.likedVideoIds));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Error toggling like:', err);
      }
    },
    [likedVideoIds, currentUser]
  );

  const createLiveStreamVideo = useCallback(async (videoData: Partial<VideoReport>) => {
    const created = await apiCreateLiveStream({
      title: videoData.title || 'Live Stream',
      videoUrl: videoData.videoUrl || '',
      videoThumbnailUrl: videoData.videoThumbnailUrl,
      reporterName: videoData.reporterName,
      location: videoData.location,
      description: videoData.description,
      isLive: videoData.isLive !== false,
    });
    setVideos((prev) => [created, ...prev.filter((v) => v.id !== created.id)]);
    return created;
  }, []);

  const deleteLiveStreamVideo = useCallback(async (id: string) => {
    await apiDeleteLiveStream(id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const updateLiveStreamVideo = useCallback(async (id: string, updates: Partial<VideoReport>) => {
    const updated = await apiUpdateLiveStream(id, updates);
    setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  }, []);

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentCharIndexRef.current = 0;
    currentFullTextRef.current = '';
    setAudioState({
      article: null,
      isPlaying: false,
      progress: 0,
      duration: '00:00',
      speed: 1.0,
    });
  }, []);

  const playArticleAudio = useCallback(
    (article: Article | null) => {
      if (!article) {
        stopAudio();
        return;
      }
      const targetSpeed = audioState.speed || 1.0;
      currentCharIndexRef.current = 0;
      setAudioState({
        article,
        isPlaying: true,
        progress: 0,
        duration: article.readTime || '03:45',
        speed: targetSpeed,
      });
      speakFromCharIndex(article, 0, targetSpeed);
    },
    [audioState.speed, speakFromCharIndex, stopAudio]
  );

  const toggleAudioPlayback = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      return;
    }

    if (audioState.isPlaying) {
      // Pause playback: cancel speech output but keep currentCharIndexRef frozen
      window.speechSynthesis.cancel();
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      // Resume playback starting exactly from frozen currentCharIndexRef
      if (audioState.article) {
        speakFromCharIndex(audioState.article, currentCharIndexRef.current, audioState.speed);
        setAudioState((prev) => ({ ...prev, isPlaying: true }));
      }
    }
  }, [audioState.isPlaying, audioState.article, audioState.speed, speakFromCharIndex]);

  const setAudioSpeed = useCallback(
    (speed: number) => {
      setAudioState((prev) => ({ ...prev, speed }));
      if (audioState.article && audioState.isPlaying) {
        speakFromCharIndex(audioState.article, currentCharIndexRef.current, speed);
      }
    },
    [audioState.article, audioState.isPlaying, speakFromCharIndex]
  );

  const seekAudio = useCallback(
    (percent: number) => {
      if (!audioState.article) return;
      const fullText = currentFullTextRef.current || buildNarrationText(audioState.article);
      const targetChar = Math.floor((percent / 100) * fullText.length);
      currentCharIndexRef.current = targetChar;
      setAudioState((prev) => ({ ...prev, progress: percent }));
      if (audioState.isPlaying) {
        speakFromCharIndex(audioState.article, targetChar, audioState.speed);
      }
    },
    [audioState.article, audioState.isPlaying, audioState.speed, buildNarrationText, speakFromCharIndex]
  );

  const updateProfileData = useCallback(
    async (data: { name?: string; bio?: string; avatarUrl?: string }) => {
      if (!currentUser || currentUser.id === 'guest_user') return;
      const updated = await apiUpdateUserProfile(data, currentUser.id);
      setCurrentUser(updated);
      try {
        localStorage.setItem('nexttruth_user', JSON.stringify(updated));
      } catch {
        // ignore
      }
    },
    [currentUser]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!currentUser || currentUser.id === 'guest_user') throw new Error('Must be logged in to change password');
      return await apiChangePassword(currentPassword, newPassword, currentUser.id);
    },
    [currentUser]
  );

  const updateLayoutConfigSetting = useCallback(
    async (config: Partial<LayoutConfig>) => {
      const updated = await apiUpdateLayoutConfig(config, currentUser?.id);
      setLayoutConfig(updated);
    },
    [currentUser]
  );

  const addNewCategory = useCallback(async (name: string, description?: string) => {
    const newCat = await apiCreateCategory(name, description);
    setCategories((prev) => [...prev.filter((c) => c.slug !== newCat.slug), newCat]);
    return newCat;
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        articles,
        heroArticle,
        videos,
        categories,
        submissions,
        layoutConfig,
        activeCategory,
        searchQuery,
        selectedArticle,
        isSubmitModalOpen,
        isAdminModalOpen,
        isDLTModalOpen,
        isSupportModalOpen,
        isAuthModalOpen,
        isDashboardOpen,
        isProfileModalOpen,
        bookmarkedIds,
        likedVideoIds,
        lightboxMedia,
        audioState,
        loading,
        setCategory: setActiveCategory,
        setSearch: setSearchQuery,
        selectArticle: setSelectedArticle,
        toggleBookmarkItem,
        toggleLikeVideo,
        switchUserRole,
        openSubmitModal: setIsSubmitModalOpen,
        openAdminModal: setIsAdminModalOpen,
        openDLTModal: setIsDLTModalOpen,
        openSupportModal: setIsSupportModalOpen,
        openAuthModal: setIsAuthModalOpen,
        openDashboard: setIsDashboardOpen,
        openProfileModal: setIsProfileModalOpen,
        openLightbox,
        closeLightbox,
        formatTimeAgo,
        logout,
        loginWithCredentials,
        registerNewAccount,
        updateProfileData,
        changePassword,
        updateLayoutConfigSetting,
        addNewCategory,
        createLiveStreamVideo,
        deleteLiveStreamVideo,
        updateLiveStreamVideo,
        refreshData: loadData,
        refreshSubmissions,
        addSubmissionLocally,
        playArticleAudio,
        stopAudio,
        toggleAudioPlayback,
        setAudioSpeed,
        seekAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
