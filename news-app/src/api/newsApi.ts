import { getApiBaseUrl, CURRENT_API_HOST, setCustomApiHost } from './config';
import {
  Article,
  VideoReport,
  Submission,
  UserProfile,
  NotificationItem,
  SponsoredBannerData,
  CategoryItem,
  UserRole,
  SubmissionStatus,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  bookmarkedIds?: string[];
  error?: any;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  console.log(`[API REQUEST 📡] ${options?.method || 'GET'} -> ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...options,
    });

    clearTimeout(timeoutId);

    console.log(`[API RESPONSE 📥] Status ${res.status} from ${endpoint}`);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message =
        errorBody.message ||
        errorBody.error ||
        `Backend returned HTTP ${res.status}: ${res.statusText}`;
      console.warn(`[API ERROR ❌] ${endpoint} failed:`, message);
      throw new Error(message);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    let friendlyMessage = error.message || 'An unexpected network error occurred.';
    if (error.name === 'AbortError') {
      friendlyMessage = `Connection timed out. Backend server at ${baseUrl} did not respond. Check if backend is running.`;
    } else if (
      friendlyMessage.includes('Network request failed') ||
      friendlyMessage.includes('Failed to fetch')
    ) {
      friendlyMessage = `Cannot reach backend at ${baseUrl}. Ensure backend server is started on port 5000 and computer & phone are on the same Wi-Fi.`;
    }
    console.error(`[API NETWORK ERROR ⚠️] ${endpoint}:`, friendlyMessage);
    throw new Error(friendlyMessage);
  }
}

export const newsApi = {
  // Test connection
  async testHealth(): Promise<{ ok: boolean; message: string; host: string }> {
    try {
      const res: any = await request('/health');
      return {
        ok: true,
        message: `Connected: ${res.platform || 'API'} (${res.database || 'Ready'})`,
        host: CURRENT_API_HOST,
      };
    } catch (e: any) {
      return {
        ok: false,
        message: e.message || 'Server unreachable',
        host: CURRENT_API_HOST,
      };
    }
  },

  getHost: () => CURRENT_API_HOST,
  setHost: (host: string) => setCustomApiHost(host),

  // Auth & Session
  async login(payload: { email?: string; password?: string; role?: UserRole }): Promise<ApiResponse<UserProfile>> {
    return await request<ApiResponse<UserProfile>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: {
    name: string;
    email: string;
    password?: string;
    bio?: string;
    role?: UserRole;
  }): Promise<ApiResponse<UserProfile>> {
    return await request<ApiResponse<UserProfile>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return await request<ApiResponse<UserProfile>>('/auth/me');
  },

  async logout(): Promise<ApiResponse<null>> {
    return await request<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
    });
  },

  // Submissions
  async getSubmissions(status?: SubmissionStatus, userId?: string): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await request<ApiResponse<Submission[]>>(`/submissions${queryString}`);
    return res.data || [];
  },

  async createSubmission(payload: {
    title: string;
    category?: string;
    location?: string;
    description?: string;
    sourceNotes?: string;
    attachments?: string;
    audioUri?: string;
  }): Promise<Submission> {
    const res = await request<ApiResponse<Submission>>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Failed to create submission');
    return res.data;
  },

  async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    note?: string
  ): Promise<Submission> {
    const res = await request<ApiResponse<Submission>>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    if (!res.data) throw new Error('Failed to update submission');
    return res.data;
  },

  // Articles
  async getArticles(category?: string, search?: string): Promise<Article[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await request<ApiResponse<Article[]>>(`/articles${queryString}`);
    return res.data || [];
  },

  async getHeroArticle(): Promise<Article | null> {
    const res = await request<ApiResponse<Article>>('/articles/hero');
    return res.data || null;
  },

  async getOpinionArticle(): Promise<Article | null> {
    const res = await request<ApiResponse<Article>>('/articles/opinion');
    return res.data || null;
  },

  async getPremiumColumns(): Promise<{ premiumColumn: Article | null; moreAuthorArticles: Article[] }> {
    const res = await request<ApiResponse<{ premiumColumn: Article | null; moreAuthorArticles: Article[] }>>(
      '/articles/columns'
    );
    return res.data || { premiumColumn: null, moreAuthorArticles: [] };
  },

  async getPublishedBentoArticles(): Promise<Article[]> {
    const res = await request<ApiResponse<Article[]>>('/articles/bento/published');
    return res.data || [];
  },

  async getPublishedBento(): Promise<Article[]> {
    const res = await request<ApiResponse<Article[]>>('/articles/bento/published');
    return res.data || [];
  },

  async getArticleById(id: string): Promise<Article | null> {
    const res = await request<ApiResponse<Article>>(`/articles/${id}`);
    return res.data || null;
  },

  // Videos
  async getVideos(isLive?: boolean): Promise<VideoReport[]> {
    const params = new URLSearchParams();
    if (isLive !== undefined) params.append('isLive', String(isLive));
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await request<ApiResponse<VideoReport[]>>(`/videos${queryString}`);
    return res.data || [];
  },

  async toggleVideoLike(videoId: string, action: 'like' | 'unlike'): Promise<number | undefined> {
    const res = await request<{ success: boolean; likesCount: number }>(`/videos/${videoId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    return res.likesCount;
  },

  // User Profile & Bookmarks
  async getUserProfile(): Promise<UserProfile> {
    const res = await request<ApiResponse<UserProfile>>('/user/profile');
    if (!res.data) throw new Error('Failed to retrieve user profile');
    return res.data;
  },

  async updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await request<ApiResponse<UserProfile>>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Failed to update profile');
    return res.data;
  },

  async upgradePremium(): Promise<UserProfile> {
    const res = await request<ApiResponse<UserProfile>>('/user/upgrade-premium', {
      method: 'POST',
    });
    if (!res.data) throw new Error('Failed to upgrade subscription');
    return res.data;
  },

  async getBookmarks(): Promise<{ articles: Article[]; bookmarkedIds: string[] }> {
    const res = await request<ApiResponse<Article[]>>('/user/bookmarks');
    return {
      articles: res.data || [],
      bookmarkedIds: res.bookmarkedIds || [],
    };
  },

  async toggleBookmark(articleId: string): Promise<{ isBookmarked: boolean; bookmarkedIds: string[] }> {
    const res = await request<{ success: boolean; isBookmarked: boolean; bookmarkedIds: string[] }>(
      `/user/bookmarks/${articleId}`,
      { method: 'POST' }
    );
    return {
      isBookmarked: res.isBookmarked,
      bookmarkedIds: res.bookmarkedIds || [],
    };
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await request<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await request('/notifications/read-all', { method: 'PATCH' });
  },

  // Meta & Taxonomies
  async getCategories(): Promise<CategoryItem[]> {
    const res = await request<ApiResponse<CategoryItem[]>>('/categories');
    return res.data || [];
  },

  async getSponsoredBanner(): Promise<SponsoredBannerData | null> {
    const res = await request<ApiResponse<SponsoredBannerData>>('/banners/sponsored');
    return res.data || null;
  },

  // Admin Hub
  async getAdminUsers(): Promise<UserProfile[]> {
    const res = await request<ApiResponse<UserProfile[]>>('/admin/users');
    return res.data || [];
  },

  async createAdminUser(payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    bio?: string;
    avatarUrl?: string;
  }): Promise<UserProfile> {
    const res = await request<ApiResponse<UserProfile>>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Failed to create staff credential');
    return res.data;
  },

  async updateSponsoredBanner(payload: Partial<SponsoredBannerData>): Promise<SponsoredBannerData> {
    const res = await request<ApiResponse<SponsoredBannerData>>('/admin/banners/sponsored', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Failed to update sponsored banner');
    return res.data;
  },
};
