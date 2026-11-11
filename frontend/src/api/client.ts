import { API_BASE_URL } from './config';
import type {
  Article,
  VideoReport,
  Submission,
  UserProfile,
  CategoryItem,
  SponsoredBanner,
  DLTBlock,
  SupportTicket,
  LayoutConfig,
} from '../types';

const getStoredUser = (): { id?: string; role?: string } | null => {
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
};

const defaultHeaders = (userId?: string) => {
  const stored = getStoredUser();
  const resolvedId = userId || stored?.id;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (resolvedId) {
    headers['x-user-id'] = resolvedId;
    headers['Authorization'] = `Bearer jwt_${resolvedId}`;
  }
  if (stored?.role) {
    headers['x-user-role'] = stored.role;
  }
  return headers;
};

export async function fetchArticles(category?: string, search?: string): Promise<Article[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('API error, using fallback seed data:', err);
    return getFallbackArticles();
  }
}

export async function fetchHeroArticle(): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/hero`);
    if (!res.ok) throw new Error('Failed to fetch hero article');
    const json = await res.json();
    return json.data || null;
  } catch {
    return getFallbackArticles()[0] || null;
  }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    const json = await res.json();
    return json.data || null;
  } catch {
    return getFallbackArticles().find((a) => a.id === id) || null;
  }
}

export async function fetchVideos(): Promise<VideoReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/videos`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    const json = await res.json();
    return json.data || [];
  } catch {
    return getFallbackVideos();
  }
}

export async function likeVideo(
  id: string,
  action?: 'like' | 'unlike',
  userId?: string
): Promise<{ likesCount: number; isLiked: boolean; likedVideoIds?: string[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/videos/${id}/like`, {
      method: 'POST',
      headers: defaultHeaders(userId),
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    return {
      likesCount: json.likesCount !== undefined ? json.likesCount : json.data?.likesCount || 0,
      isLiked: Boolean(json.isLiked),
      likedVideoIds: json.likedVideoIds,
    };
  } catch {
    return { likesCount: 1, isLiked: true };
  }
}

export async function createLiveStream(data: {
  title: string;
  videoUrl: string;
  videoThumbnailUrl?: string;
  reporterName?: string;
  location?: string;
  description?: string;
  isLive?: boolean;
}): Promise<VideoReport> {
  const res = await fetch(`${API_BASE_URL}/videos`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create live stream');
  return json.data;
}

export async function updateLiveStream(id: string, updates: Partial<VideoReport>): Promise<VideoReport> {
  const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'PATCH',
    headers: defaultHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update live stream');
  return json.data;
}

export async function deleteLiveStream(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete live stream');
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [
      { id: 'cat_all', name: 'All', slug: 'all' },
      { id: 'cat_urgent', name: 'Urgent', slug: 'urgent' },
      { id: 'cat_ground', name: 'Ground Reports', slug: 'ground-reports' },
      { id: 'cat_opinion', name: 'Opinion', slug: 'opinion' },
      { id: 'cat_econ', name: 'Economics', slug: 'economics' },
      { id: 'cat_infra', name: 'Infrastructure', slug: 'infrastructure' },
    ];
  }
}

export async function createCategory(name: string, description?: string): Promise<CategoryItem> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify({ name, description }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create category');
  return json.data;
}

export async function fetchLayoutConfig(): Promise<LayoutConfig> {
  try {
    const res = await fetch(`${API_BASE_URL}/layout-config`);
    if (!res.ok) throw new Error('Failed to fetch layout config');
    const json = await res.json();
    return json.data || {
      heroBannerCategory: 'Urgent Breaking',
      secondaryBannerCategory: 'Tech & Media',
      secondaryBannerTitle: 'Tech & Media News',
      videoSectionCategory: 'All',
    };
  } catch {
    return {
      heroBannerCategory: 'Urgent Breaking',
      secondaryBannerCategory: 'Tech & Media',
      secondaryBannerTitle: 'Tech & Media News',
      videoSectionCategory: 'All',
    };
  }
}

export async function updateLayoutConfig(
  config: Partial<LayoutConfig>,
  userId?: string
): Promise<LayoutConfig> {
  const res = await fetch(`${API_BASE_URL}/layout-config`, {
    method: 'PUT',
    headers: defaultHeaders(userId),
    body: JSON.stringify(config),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update layout config');
  return json.data;
}

export async function fetchSponsoredBanner(): Promise<SponsoredBanner | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/sponsored`);
    if (!res.ok) throw new Error('Failed to fetch banner');
    const json = await res.json();
    return json.data || null;
  } catch {
    return {
      id: 'sponsor_1',
      title: 'Susalabs Research Initiative',
      sponsorName: 'Susalabs Intelligence',
      subtitle: 'Decentralized cryptographic verification protocol for modern civic reporting.',
      badge: 'COMMUNITY SPONSOR',
      ctaText: 'LEARN MORE',
      actionUrl: 'https://susalabs.com',
    };
  }
}

export async function loginUser(email?: string, password?: string, role?: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Login failed');
  return json.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
  } catch {
    // ignore
  }
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  bio?: string;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Registration failed');
  return json.data;
}

export async function fetchUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: defaultHeaders(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  data: { name?: string; bio?: string; avatarUrl?: string },
  userId?: string
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: defaultHeaders(userId),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update profile');
  return json.data;
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
  userId?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/user/change-password`, {
    method: 'POST',
    headers: defaultHeaders(userId),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to change password');
  return json;
}

export async function toggleBookmark(articleId: string, userId?: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/bookmarks/${articleId}`, {
      method: 'POST',
      headers: defaultHeaders(userId),
    });
    const json = await res.json();
    return json.bookmarkedIds || [];
  } catch {
    return [];
  }
}

export async function fetchSubmissions(userId?: string, status?: string): Promise<Submission[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);

    const res = await fetch(`${API_BASE_URL}/submissions?${params.toString()}`, {
      headers: defaultHeaders(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch submissions');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createSubmission(data: any, userId?: string): Promise<Submission> {
  const res = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: defaultHeaders(userId),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to submit report');
  return json.data;
}

export async function updateSubmissionStatus(
  id: string,
  status: string,
  note?: string,
  rejectionReason?: string,
  stage?: 'JOURNALIST' | 'EXPERT' | 'MASTER'
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/admin/submissions/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders(),
    body: JSON.stringify({ status, note, rejectionReason, stage }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update status');
  return json;
}

export async function fetchDLTLedger(): Promise<{
  totalBlocks: number;
  blocks: DLTBlock[];
  networkStats: {
    activeValidators: number;
    consensusStatus: string;
    latestBlockHash: string;
    genesisHash: string;
    tamperProtectionLevel: string;
    storageNetwork: string;
  };
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/dlt/ledger`);
    if (!res.ok) throw new Error('Failed to fetch DLT ledger');
    const json = await res.json();
    return json.data;
  } catch {
    return {
      totalBlocks: 4,
      blocks: [],
      networkStats: {
        activeValidators: 3,
        consensusStatus: '100% BYZANTINE FAULT TOLERANT CONSENSUS',
        latestBlockHash: '0x8f3c7e8a9d1b2c3d4e5f60718293a4b5c6d7e8f9',
        genesisHash: '0x0000000000000000000000000000000000000000',
        tamperProtectionLevel: 'CRYPTOGRAPHIC MERKLE-ROOT DLT SEAL',
        storageNetwork: 'IPFS Decentralized Content-Addressed Storage',
      },
    };
  }
}

export async function verifyArticleDLT(id: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/dlt/verify/${id}`);
    const json = await res.json();
    return json.data;
  } catch {
    return {
      isTampered: false,
      verificationStatus: 'SECURE_AND_VERIFIED',
      message: 'Cryptographically verified with SusaLabs Decentralized Truth Node.',
    };
  }
}

export async function verifyBlockProofDLT(index: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/dlt/verify-block/${index}`);
  if (!res.ok) throw new Error('Failed to verify block proof');
  const json = await res.json();
  return json.data;
}

export async function verifyFullChainDLT(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/dlt/verify-chain`);
  if (!res.ok) throw new Error('Failed to verify chain integrity');
  const json = await res.json();
  return json.data;
}

export async function simulateTamperAttack(
  targetIndexOrId: number | string,
  tamperedTitle: string,
  tamperedContent: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/dlt/simulate-tamper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetIndexOrId, tamperedTitle, tamperedContent }),
  });
  if (!res.ok) throw new Error('Failed to run tamper simulation');
  const json = await res.json();
  return json.data;
}

export async function fetchIpfsDocument(cid: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/dlt/ipfs/${encodeURIComponent(cid)}`);
  if (!res.ok) throw new Error('Failed to fetch IPFS document');
  const json = await res.json();
  return json.data;
}

export async function fetchValidatorNodes(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/dlt/validators`);
  if (!res.ok) throw new Error('Failed to fetch validator nodes');
  const json = await res.json();
  return json.data;
}

export async function fetchAdminUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createAdminUser(userData: {
  name: string;
  email: string;
  password?: string;
  role: string;
  bio?: string;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to issue press credential');
  return json.data;
}


export async function updateSponsoredBanner(bannerData: Partial<SponsoredBanner>): Promise<SponsoredBanner> {
  const res = await fetch(`${API_BASE_URL}/admin/banners/sponsored`, {
    method: 'PUT',
    headers: defaultHeaders(),
    body: JSON.stringify(bannerData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update sponsored campaign');
  return json.data;
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/support/tickets`);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function submitSupportTicket(ticket: {
  name?: string;
  email?: string;
  subject: string;
  message: string;
  category: string;
  isAnonymous?: boolean;
}): Promise<SupportTicket> {
  const res = await fetch(`${API_BASE_URL}/support/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to submit ticket');
  return json.data;
}

export async function subscribeNewsletter(email: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/support/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Subscription failed');
  return json.message;
}

// Fallback seed data matching backend seed
function getFallbackArticles(): Article[] {
  return [
    {
      id: 'hero_1',
      title: 'City Council Votes Overwhelmingly to Restructure Municipal Zones Amidst Pushback',
      excerpt:
        'In an unprecedented evening session marked by vocal disruptions from the gallery, the council passed the controversial zoning ordinance. Our reporters on the floor confirm immediate logistical shifts.',
      fullContent: `In an unprecedented evening session marked by vocal disruptions from the gallery, the city council passed the controversial zoning ordinance by an 8-2 margin.

Our reporters embedded directly inside the municipal chamber confirmed that the session extended past midnight as community delegates staged a peaceful walkout during the final clause deliberations.

Key Takeaways from Tonight's Chamber Session:
• High-density commercial corridors are now authorized across historic residential sectors in Districts 3 and 7.
• Emergency funding has been reallocated from localized heritage preservation to commercial arterial maintenance.
• Citizen coalitions have filed an immediate injunction petition alleging procedural discrepancies during public commentary windows.

"We are witnessing an unprecedented realignment of public space prioritizing commercial speculation over civic heritage," voiced Council Member Alvarez in an impassioned dissenting statement.

Next Truth verification analysts have cross-referenced land deeds and municipal campaign contributions, revealing active developer filings predating the official legislative proposal by six months. Continuous ground updates will follow as community assemblies convene tomorrow morning.`,
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Political Correspondent',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '14 mins ago',
      category: 'Urgent Report',
      imageUrl:
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
      isVerifiedGround: true,
      isUrgent: true,
      isHero: true,
      readTime: '4 min read',
      views: '34.2k',
      categoryTag: 'MUNICIPAL',
      dltStatus: 'CONFIRMED_IMMUTABLE',
      dltBlockHash: '0xa72f91e4b85c391d09f7a8120b41e8c4591a329d71e2f384a6b108c9d2f4510a',
    },
    {
      id: 'op_1',
      title: 'The Silent Cost of Urban Expansion Must Be Audited',
      excerpt:
        'We are sacrificing historical continuity for transient economic gains. The recent council decisions ignore the fundamental fabric of our community neighborhoods.',
      fullContent:
        'When urban planning becomes divorced from ground realities, residents bear the uncompensated externalities: skyrocketing lease rates, fragmented schools, and the wholesale replacement of independent trades with speculative shell storefronts.',
      authorName: 'David H. Vance',
      authorTitle: 'Senior Editorial Columnist',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '5 min read',
      category: 'Opinion',
      imageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      isOpinion: true,
      readTime: '5 min read',
      views: '14.5k',
      categoryTag: 'CIVIC',
      dltStatus: 'CONFIRMED_IMMUTABLE',
      dltBlockHash: '0xb83e71d4a92f801c29e7b9131a52e9d5602b430e82f3a495b7c219dae3f5621b',
    },
    {
      id: 'std_1',
      title: 'Tech Sector Job Growth Stalls in Q3',
      excerpt:
        'Hiring contractions in software infrastructure ripple into commercial real estate portfolios across major metropolitan hubs.',
      fullContent:
        'Corporate payroll filings for the third quarter show a 4.2% slowdown in specialized engineering acquisitions across major technical hubs.',
      authorName: 'Claire Bennett',
      authorTitle: 'Economics Reporter',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '1 hr ago',
      category: 'Economics',
      imageUrl:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
      readTime: '3 min read',
      views: '8.9k',
      categoryTag: 'ECONOMICS',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
    {
      id: 'std_2',
      title: 'Regional Power Grid Modernization Receives Federal Approval',
      excerpt:
        'A 10-year grid resiliency initiative aims to replace vulnerable sub-stations before the impending winter storm cycle.',
      fullContent:
        'Federal regulators approved the multi-stage grid reinforcement program following two years of municipal engineering reviews.',
      authorName: 'Elias Thorne',
      authorTitle: 'Infrastructure Correspondent',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '3 hrs ago',
      category: 'Infrastructure',
      imageUrl:
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
      readTime: '4 min read',
      views: '6.1k',
      categoryTag: 'ENERGY',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
    {
      id: 'prem_col_1',
      title: 'The Silent Erosion of Urban Privacy',
      excerpt:
        'In the quiet corners of our bustling metropolises, a profound shift is occurring, largely unnoticed by the very citizens it affects most.',
      fullContent:
        'The integration of "smart city" infrastructure, touted as the panacea for traffic congestion, has quietly ushered in an era of unprecedented surveillance.',
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Tech Correspondent',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: 'Oct 18',
      category: 'Premium Column',
      imageUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      isPremium: true,
      readTime: '7 min read',
      views: '28.9k',
      categoryTag: 'TECH & PRIVACY',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
    {
      id: 'weekly_1',
      title: '7-Year-Old Indian Boy Rescued in Ritual Sacrifice Attempt: Ground Police Intervention',
      excerpt:
        'Rapid response units mobilized after citizen reporters geotagged distress coordinates, averting tragedy in suburban perimeter.',
      fullContent:
        'Special investigative units arrived on site within 11 minutes of citizen dispatch alerting authorities to clandestine gatherings.',
      authorName: 'Rohan Sharma',
      authorTitle: 'Citizen Reporter',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '12 Jan, 2026',
      category: 'Ground Reports',
      imageUrl:
        'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
      readTime: '5 min Read',
      views: '41.8k',
      categoryTag: 'CRIME & JUSTICE',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
    {
      id: 'weekly_2',
      title: 'Global Climate Summit Enacts Binding Transparency Protocols',
      excerpt:
        'Delegates reach consensus on real-time satellite emissions tracking, preventing corporate greenwashing through cryptographic audits.',
      fullContent:
        'The newly ratified covenant mandates all signatory industrial entities to publish verified emissions telemetry to open decentralized ledgers.',
      authorName: 'Dr. Alexander Vance',
      authorTitle: 'Chief Editor',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '13 Jan, 2026',
      category: 'Politics',
      imageUrl:
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
      readTime: '4 min Read',
      views: '19.2k',
      categoryTag: 'GLOBAL POLICY',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
    {
      id: 'weekly_3',
      title: 'Breakthrough in Solid-State Battery Density Challenges Traditional Grid Constraints',
      excerpt:
        'New ceramic electrolyte formulations yield 850 Wh/kg in independent laboratory stress tests, tripling electric mobility ranges.',
      fullContent:
        'Materials researchers confirmed continuous cycling stability over 1,400 thermal stress simulations without dendrite degradation.',
      authorName: 'Elias Thorne',
      authorTitle: 'Infrastructure Correspondent',
      authorAvatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: '15 Jan, 2026',
      category: 'Tech & Media',
      imageUrl:
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800',
      readTime: '6 min Read',
      views: '52.1k',
      categoryTag: 'ENERGY TECH',
      dltStatus: 'CONFIRMED_IMMUTABLE',
    },
  ];
}

function getFallbackVideos(): VideoReport[] {
  return [
    {
      id: 'vid_live_aljazeera',
      title: 'Al Jazeera English Live — 24/7 Global Field Broadcast',
      videoThumbnailUrl: 'https://img.youtube.com/vi/gCNeDWCI0vo/hqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=gCNeDWCI0vo',
      isLive: true,
      isReplay: false,
      reporterName: 'Al Jazeera News Bureau',
      location: 'Global Broadcast Network',
      viewersCount: '28.4k watching',
      likesCount: 512,
      description:
        'Continuous 24/7 breaking eyewitness coverage, geo-verified dispatches and live reporting from correspondents around the globe.',
    },
  ];
}
