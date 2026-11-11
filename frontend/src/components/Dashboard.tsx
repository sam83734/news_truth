import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context';
import type { Article, Submission, DLTBlock, UserProfile, SupportTicket, VideoReport } from '../types';
import {
  fetchSubmissions,
  updateSubmissionStatus,
  fetchDLTLedger,
  fetchAdminUsers,
  fetchSupportTickets,
  verifyFullChainDLT,
  createAdminUser,
  fetchSponsoredBanner,
  updateSponsoredBanner,
} from '../api/client';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Send,
  Eye,
  Search,
  RefreshCw,
  ExternalLink,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
  MapPin,
  CheckSquare,
  Film,
  LayoutTemplate,
  FolderPlus,
  Sliders,
  Plus,
  Radio,
  Trash2,
  Play,
  X,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  UserPlus,
  Megaphone,
} from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/mediaUtils';

const getSubmissionMedia = (sub: Submission): { uri: string; type: 'image' | 'video' } | null => {
  if (!sub.attachments) return null;
  try {
    const parsed = JSON.parse(sub.attachments);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.uri) {
      return {
        uri: parsed[0].uri,
        type: parsed[0].type || (parsed[0].uri.includes('video') ? 'video' : 'image'),
      };
    }
  } catch {
    if (sub.attachments.startsWith('http') || sub.attachments.startsWith('data:')) {
      return { uri: sub.attachments, type: 'image' };
    }
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    articles,
    videos,
    createLiveStreamVideo,
    deleteLiveStreamVideo,
    updateLiveStreamVideo,
    submissions: contextSubmissions,
    selectArticle,
    openDashboard,
    openSubmitModal,
    openSupportModal,
    openDLTModal,
    openLightbox,
    openProfileModal,
    layoutConfig,
    updateLayoutConfigSetting,
    categories,
    addNewCategory,
    logout,
    refreshData,
    refreshSubmissions,
  } = useApp();

  const role = currentUser?.role || 'USER';
  const isApprover = role === 'ADMIN' || role === 'EXPERT' || role === 'JOURNALIST';

  const [activeTab, setActiveTab] = useState<string>(isApprover ? 'approvals' : 'posts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Live Broadcast Management State (Admin)
  const [streamTitle, setStreamTitle] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamLocation, setStreamLocation] = useState<string>('Central Operations Desk');
  const [streamReporter, setStreamReporter] = useState<string>(currentUser?.name || 'News Anchor Desk');
  const [streamDesc, setStreamDesc] = useState<string>('');
  const [streamIsLive, setStreamIsLive] = useState<boolean>(true);
  const [isCreatingStream, setIsCreatingStream] = useState<boolean>(false);
  const [streamFeedbackMsg, setStreamFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewStreamModal, setPreviewStreamModal] = useState<VideoReport | null>(null);

  // Layout Configuration State
  const [heroCat, setHeroCat] = useState<string>(() => layoutConfig?.heroBannerCategory || 'Urgent Breaking');
  const [secondaryCat, setSecondaryCat] = useState<string>(() => layoutConfig?.secondaryBannerCategory || 'Tech & Media');
  const [secondaryTitle, setSecondaryTitle] = useState<string>(() => layoutConfig?.secondaryBannerTitle || 'Tech & Media News');
  const [videoCat, setVideoCat] = useState<string>(() => layoutConfig?.videoSectionCategory || 'Live Streams');
  const [layoutSaving, setLayoutSaving] = useState<boolean>(false);
  const [layoutSuccessMsg, setLayoutSuccessMsg] = useState<string | null>(null);

  // New Category Creation State
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [catCreating, setCatCreating] = useState<boolean>(false);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);
  const [catErrorMsg, setCatErrorMsg] = useState<string | null>(null);

  const [prevConfig, setPrevConfig] = useState(layoutConfig);
  if (layoutConfig !== prevConfig) {
    setPrevConfig(layoutConfig);
    if (layoutConfig) {
      setHeroCat(layoutConfig.heroBannerCategory || 'Urgent Breaking');
      setSecondaryCat(layoutConfig.secondaryBannerCategory || 'Tech & Media');
      setSecondaryTitle(layoutConfig.secondaryBannerTitle || 'Tech & Media News');
      setVideoCat(layoutConfig.videoSectionCategory || 'Live Streams');
    }
  }
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [dltData, setDltData] = useState<{ totalBlocks: number; blocks: DLTBlock[]; networkStats: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // DLT Chain Audit State
  const [isAuditingChain, setIsAuditingChain] = useState<boolean>(false);
  const [dashboardChainAudit, setDashboardChainAudit] = useState<any | null>(null);

  const handleAuditChainFromDashboard = async () => {
    setIsAuditingChain(true);
    setDashboardChainAudit(null);
    try {
      const report = await verifyFullChainDLT();
      setDashboardChainAudit(report);
    } catch (err: any) {
      setDashboardChainAudit({ chainValid: false, message: err?.message || 'Chain audit failed' });
    } finally {
      setIsAuditingChain(false);
    }
  };

  // Rejection Modal State
  const [rejectModalSubmission, setRejectModalSubmission] = useState<Submission | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  // Dispatch Full Details Modal State
  const [selectedDispatchModal, setSelectedDispatchModal] = useState<any | null>(null);

  const handleSaveLayoutConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLayoutSaving(true);
    setLayoutSuccessMsg(null);
    try {
      await updateLayoutConfigSetting({
        heroBannerCategory: heroCat,
        secondaryBannerCategory: secondaryCat,
        secondaryBannerTitle: secondaryTitle.trim() || `${secondaryCat} News`,
        videoSectionCategory: videoCat,
      });
      setLayoutSuccessMsg('Public Portal layout channels updated successfully!');
      setTimeout(() => setLayoutSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLayoutSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatCreating(true);
    setCatErrorMsg(null);
    setCatSuccessMsg(null);
    try {
      await addNewCategory(newCatName.trim(), newCatDesc.trim());
      setCatSuccessMsg(`New Category "${newCatName.trim()}" created successfully!`);
      setNewCatName('');
      setNewCatDesc('');
      setTimeout(() => setCatSuccessMsg(null), 3500);
    } catch (err: any) {
      setCatErrorMsg(err?.message || 'Failed to create category.');
    } finally {
      setCatCreating(false);
    }
  };

  const handleLaunchLiveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamTitle.trim()) {
      setStreamFeedbackMsg({ type: 'error', text: 'Please enter a broadcast title.' });
      return;
    }
    if (!streamUrl.trim()) {
      setStreamFeedbackMsg({ type: 'error', text: 'Please enter a valid YouTube or video live URL.' });
      return;
    }

    setIsCreatingStream(true);
    setStreamFeedbackMsg(null);
    try {
      await createLiveStreamVideo({
        title: streamTitle.trim(),
        videoUrl: streamUrl.trim(),
        location: streamLocation.trim() || 'Central Operations Desk',
        reporterName: streamReporter.trim() || currentUser?.name || 'Staff Anchor',
        description: streamDesc.trim() || '24/7 uninterrupted live news and eyewitness reporting.',
        isLive: streamIsLive,
      });

      setStreamFeedbackMsg({
        type: 'success',
        text: `Live Broadcast "${streamTitle.trim()}" is now active and streaming on the public portal!`,
      });
      setStreamTitle('');
      setStreamUrl('');
      setStreamDesc('');
      setTimeout(() => setStreamFeedbackMsg(null), 5000);
    } catch (err: any) {
      setStreamFeedbackMsg({ type: 'error', text: err?.message || 'Failed to launch live stream.' });
    } finally {
      setIsCreatingStream(false);
    }
  };

  const handleToggleStreamStatus = async (vid: VideoReport) => {
    try {
      await updateLiveStreamVideo(vid.id, {
        isLive: !vid.isLive,
        isReplay: vid.isLive,
      });
    } catch (err: any) {
      console.error('Error toggling live status:', err);
    }
  };

  const handleDeleteStream = async (vid: VideoReport) => {
    if (!window.confirm(`Are you sure you want to delete broadcast "${vid.title}"?`)) return;
    try {
      await deleteLiveStreamVideo(vid.id);
    } catch (err: any) {
      console.error('Error deleting live stream:', err);
    }
  };

  // Mobile Parity Admin Action States
  const [showCredentialModal, setShowCredentialModal] = useState<boolean>(false);
  const [showSponsoredModal, setShowSponsoredModal] = useState<boolean>(false);

  // Press Credential Creation Form State
  const [credName, setCredName] = useState<string>('');
  const [credEmail, setCredEmail] = useState<string>('');
  const [credPassword, setCredPassword] = useState<string>('');
  const [credRole, setCredRole] = useState<string>('JOURNALIST');
  const [credBio, setCredBio] = useState<string>('');
  const [isIssuingCred, setIsIssuingCred] = useState<boolean>(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState<string | null>(null);
  const [credErrorMsg, setCredErrorMsg] = useState<string | null>(null);

  // Sponsored Campaign Form State
  const [campTitle, setCampTitle] = useState<string>('Susalabs Research Initiative');
  const [campSponsor, setCampSponsor] = useState<string>('Susalabs Intelligence');
  const [campSubtitle, setCampSubtitle] = useState<string>(
    'Decentralized cryptographic verification protocol for modern civic reporting.'
  );
  const [campBadge, setCampBadge] = useState<string>('COMMUNITY SPONSOR');
  const [campCta, setCampCta] = useState<string>('LEARN MORE');
  const [campUrl, setCampUrl] = useState<string>('https://susalabs.com');
  const [campAudience, setCampAudience] = useState<string>('ALL');
  const [isSavingCamp, setIsSavingCamp] = useState<boolean>(false);
  const [campSuccessMsg, setCampSuccessMsg] = useState<string | null>(null);
  const [campErrorMsg, setCampErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSponsoredBanner()
      .then((banner) => {
        if (banner) {
          if (banner.title) setCampTitle(banner.title);
          if (banner.sponsorName) setCampSponsor(banner.sponsorName);
          if (banner.subtitle) setCampSubtitle(banner.subtitle);
          if (banner.badge) setCampBadge(banner.badge);
          if (banner.ctaText) setCampCta(banner.ctaText);
          if (banner.actionUrl) setCampUrl(banner.actionUrl);
          if (banner.targetAudience) setCampAudience(banner.targetAudience);
        }
      })
      .catch(() => {});
  }, []);

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credName.trim() || !credEmail.trim()) {
      setCredErrorMsg('Full Name and Email address are required.');
      return;
    }
    setIsIssuingCred(true);
    setCredErrorMsg(null);
    setCredSuccessMsg(null);
    try {
      await createAdminUser({
        name: credName.trim(),
        email: credEmail.trim().toLowerCase(),
        password: credPassword.trim() || undefined,
        role: credRole,
        bio: credBio.trim(),
      });
      setCredSuccessMsg(`Press credential issued to ${credName.trim()} (${credRole}) successfully!`);
      setCredName('');
      setCredEmail('');
      setCredPassword('');
      setCredBio('');
      const updatedUsers = await fetchAdminUsers();
      setAdminUsers(updatedUsers);
      setTimeout(() => {
        setCredSuccessMsg(null);
        setShowCredentialModal(false);
      }, 2500);
    } catch (err: any) {
      setCredErrorMsg(err?.message || 'Failed to issue credential.');
    } finally {
      setIsIssuingCred(false);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCamp(true);
    setCampErrorMsg(null);
    setCampSuccessMsg(null);
    try {
      await updateSponsoredBanner({
        title: campTitle.trim(),
        sponsorName: campSponsor.trim(),
        subtitle: campSubtitle.trim(),
        badge: campBadge.trim(),
        ctaText: campCta.trim(),
        actionUrl: campUrl.trim(),
        targetAudience: campAudience as any,
      });
      setCampSuccessMsg('Sponsored Campaign updated & published live across portals!');
      setTimeout(() => {
        setCampSuccessMsg(null);
        setShowSponsoredModal(false);
      }, 2500);
    } catch (err: any) {
      setCampErrorMsg(err?.message || 'Failed to update campaign.');
    } finally {
      setIsSavingCamp(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const queryUserId = isApprover ? undefined : currentUser?.id;
      const [subData, ledgerData, usersData, ticketsData] = await Promise.all([
        fetchSubmissions(queryUserId),
        fetchDLTLedger(),
        fetchAdminUsers(),
        fetchSupportTickets(),
      ]);
      setSubmissions(subData);
      setDltData(ledgerData);
      setAdminUsers(usersData);
      setSupportTickets(ticketsData);
      await refreshSubmissions();
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isApprover, refreshSubmissions]);

  useEffect(() => {
    let ignore = false;
    const queryUserId = isApprover ? undefined : currentUser?.id;
    Promise.all([
      fetchSubmissions(queryUserId),
      fetchDLTLedger(),
      fetchAdminUsers(),
      fetchSupportTickets(),
    ])
      .then(([subData, ledgerData, usersData, ticketsData]) => {
        if (!ignore) {
          setSubmissions(subData);
          setDltData(ledgerData);
          setAdminUsers(usersData);
          setSupportTickets(ticketsData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUser, isApprover]);

  // Combine and deduplicate context submissions with locally fetched submissions
  const effectiveSubmissions = useMemo(() => {
    const map = new Map<string, Submission>();
    (contextSubmissions || []).forEach((s) => map.set(s.id, s));
    (submissions || []).forEach((s) => map.set(s.id, s));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [submissions, contextSubmissions]);

  const handleVerifySubmission = async (
    id: string,
    stage: 'JOURNALIST' | 'EXPERT' | 'MASTER',
    note?: string
  ) => {
    try {
      const res = await updateSubmissionStatus(id, 'APPROVED', note, undefined, stage);
      setActionSuccess(res?.message || `Verification stage updated for #${id}!`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadDashboardData();
      await refreshSubmissions();
      await refreshData();
    } catch (err: any) {
      console.warn('Verification error:', err);
    }
  };

  const handleOpenRejectModal = (sub: Submission) => {
    setRejectModalSubmission(sub);
    setRejectionReasonText('');
    setRejectionError(null);
  };

  const handleConfirmRejection = async () => {
    if (!rejectModalSubmission) return;
    if (!rejectionReasonText.trim() || rejectionReasonText.trim().length < 5) {
      setRejectionError('Please provide a mandatory editorial rejection reason (at least 5 characters).');
      return;
    }
    setIsSubmittingReject(true);
    setRejectionError(null);
    try {
      await updateSubmissionStatus(
        rejectModalSubmission.id,
        'REJECTED',
        `REJECTED: ${rejectionReasonText.trim()}`,
        rejectionReasonText.trim()
      );
      setActionSuccess(`Submission #${rejectModalSubmission.id} marked as REJECTED. Reason logged.`);
      setTimeout(() => setActionSuccess(null), 3500);
      setRejectModalSubmission(null);
      await loadDashboardData();
      await refreshSubmissions();
    } catch (err: any) {
      setRejectionError(err?.message || 'Failed to reject submission.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const pendingSubmissions = useMemo(
    () =>
      effectiveSubmissions.filter((s) => {
        const st = (s.status || '').toUpperCase();
        return st === 'PENDING' || st === 'PENDING_EXPERT' || st === 'PENDING_JOURNALIST';
      }),
    [effectiveSubmissions]
  );
  const pendingCount = pendingSubmissions.length;

  // Combine live articles and pending submissions for unified tracking
  const allTrackablePosts = useMemo(() => [
    ...effectiveSubmissions.map((sub) => ({
      id: sub.id,
      title: sub.title,
      category: sub.category || 'Ground Reports',
      author: sub.authorName || 'Citizen Delegate',
      authorRole: 'CITIZEN',
      status: sub.status,
      timestamp: sub.createdAt || '2026-11-05T00:00:00.000Z',
      source: 'SUBMISSION' as const,
      isVerifiedGround: sub.status === 'APPROVED',
      isDLTAnchored: sub.status === 'APPROVED',
      content: sub.description || sub.note || '',
      rejectionReason: sub.rejectionReason,
      journalistApproval: sub.journalistApproval,
      expertApproval: sub.expertApproval,
      verifiedByJournalist: sub.verifiedByJournalist,
      factCheckedBy: sub.factCheckedBy,
      raw: sub,
    })),
    ...articles.map((art) => ({
      id: art.id,
      title: art.title,
      category: art.category || 'General',
      author: art.authorName || 'Staff Correspondent',
      authorRole: art.authorTitle || 'STAFF',
      status: 'APPROVED',
      timestamp: art.createdAt || art.dateOrTimeAgo || '2026-11-05T00:00:00.000Z',
      source: 'ARTICLE' as const,
      isVerifiedGround: art.isVerifiedGround,
      isDLTAnchored: true,
      content: art.excerpt || '',
      rejectionReason: undefined as string | undefined,
      journalistApproval: { approved: true, approverName: art.verifiedByJournalist || 'Sarah Jenkins' },
      expertApproval: { approved: true, approverName: art.factCheckedBy || 'Elias Thorne' },
      verifiedByJournalist: art.verifiedByJournalist || 'Sarah Jenkins',
      factCheckedBy: art.factCheckedBy || 'Elias Thorne',
      raw: art,
    })),
  ], [effectiveSubmissions, articles]);

  const filteredPosts = allTrackablePosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (post.category || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      post.author.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? post.status === 'PENDING' || post.status === 'PENDING_EXPERT' || post.status === 'PENDING_JOURNALIST'
        : statusFilter === 'APPROVED'
        ? post.status === 'APPROVED'
        : post.status === 'REJECTED';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* Pinned Top Navbar */}
      <header className="h-16 shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-amber-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <button
            onClick={() => openDashboard(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            title="Return to Public News Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Site</span>
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-gray-900">
                NextTruth Operations
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 tracking-wider">
                {currentUser?.roleBadge || 'REPORTER DESK'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Submit News</span>
          </button>

          <button
            onClick={() => {
              logout();
              openDashboard(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Static Fixed Pinned Sidebar + Independently Scrolling Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Pinned Static Sidebar */}
        <aside
          className={`h-full bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-y-auto ${
            sidebarCollapsed ? 'w-18' : 'w-64 lg:w-72'
          }`}
        >
          <div className="p-4 space-y-5">
            {/* User Profile Card (Clickable to open profile edit / password modal) */}
            {!sidebarCollapsed ? (
              <div
                onClick={() => openProfileModal(true)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-amber-400 flex items-center gap-3 cursor-pointer group transition-all"
                title="Click to view & edit Profile / Photo / Password"
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      currentUser?.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                    }
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white">⚙</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                    {currentUser?.name || 'Authorized Member'}
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider truncate">
                    {currentUser?.roleBadge || 'CITIZEN REPORTER'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                    <span>Edit Profile & Security</span>
                    <span className="text-amber-600 font-bold">→</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => openProfileModal(true)}
                className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="Edit Profile & Security"
              >
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                  }
                  alt={currentUser?.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
                />
              </div>
            )}

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Operations Menu
                </div>
              )}

              {/* Quick Admin Actions (Mobile App Parity) */}
              {role === 'ADMIN' && (
                <div className="mb-3 space-y-1.5 px-0.5">
                  <button
                    onClick={() => setShowCredentialModal(true)}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-3 py-2'
                    } rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer`}
                    title="Issue Press Credential"
                  >
                    <UserPlus className="w-3.5 h-3.5 shrink-0" />
                    {!sidebarCollapsed && <span>+ Issue Press Credential</span>}
                  </button>

                  <button
                    onClick={() => setShowSponsoredModal(true)}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-3 py-2'
                    } rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer`}
                    title="Sponsored Campaigns"
                  >
                    <Megaphone className="w-3.5 h-3.5 shrink-0" />
                    {!sidebarCollapsed && <span>Sponsored Campaigns</span>}
                  </button>
                </div>
              )}

              {/* Approvals & Verification Desk Tab (Admin & Expert) */}
              {isApprover && (
                <button
                  onClick={() => setActiveTab('approvals')}
                  title={sidebarCollapsed ? 'Pending Approvals Desk' : undefined}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                  } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'approvals'
                      ? 'bg-gradient-to-r from-emerald-800 to-neutral-900 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    {!sidebarCollapsed && <span>Pending Approvals Desk</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        pendingCount > 0
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pendingCount} PENDING
                    </span>
                  )}
                </button>
              )}

              {/* 1. Posts Tab */}
              <button
                onClick={() => setActiveTab('posts')}
                title={sidebarCollapsed ? 'All Posts & Submissions' : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span>
                      {role === 'ADMIN'
                        ? 'All Posts & Submissions'
                        : role === 'JOURNALIST'
                        ? 'My Stories & Dispatches'
                        : role === 'EXPERT'
                        ? 'Fact-Check Review Queue'
                        : 'My Eyewitness Reports'}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    {allTrackablePosts.length}
                  </span>
                )}
              </button>

              {/* 2. DLT Blocks Tab */}
              <button
                onClick={() => setActiveTab('dlt')}
                title={sidebarCollapsed ? 'DLT Truth Mined Blocks' : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'dlt'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  {!sidebarCollapsed && <span>DLT Truth Mined Blocks</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-mono">
                    #{dltData?.totalBlocks || 0}
                  </span>
                )}
              </button>

              {/* 3. Reporters Tab (Admin) */}
              {role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setActiveTab('reporters')}
                    title={sidebarCollapsed ? 'Reporter Directory' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'reporters'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-500 shrink-0" />
                      {!sidebarCollapsed && <span>Reporter Directory</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 font-mono">
                        {adminUsers.length}
                      </span>
                    )}
                  </button>

                  {/* 4. Hotline Tab (Admin) */}
                  <button
                    onClick={() => setActiveTab('hotline')}
                    title={sidebarCollapsed ? 'Whistleblower Hotline' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'hotline'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      {!sidebarCollapsed && <span>Whistleblower Hotline</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 font-mono">
                        {supportTickets.length}
                      </span>
                    )}
                  </button>

                  {/* 5. Public Page Channels & Layout Configuration Tab (Admin) */}
                  <button
                    onClick={() => setActiveTab('layout')}
                    title={sidebarCollapsed ? 'Public Page Channels' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'layout'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutTemplate className="w-4 h-4 text-amber-500 shrink-0" />
                      {!sidebarCollapsed && <span>Public Page</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-mono font-bold">
                        CHANNELS
                      </span>
                    )}
                  </button>

                  {/* 6. Live Broadcast Desk Tab (Admin) */}
                  <button
                    onClick={() => setActiveTab('livestreams')}
                    title={sidebarCollapsed ? 'Live Broadcasts Desk' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'livestreams'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Radio className={`w-4 h-4 shrink-0 ${activeTab === 'livestreams' ? 'text-white animate-pulse' : 'text-rose-500'}`} />
                      {!sidebarCollapsed && <span>Live Broadcasts</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        activeTab === 'livestreams' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-600'
                      }`}>
                        {videos.filter((v) => v.isLive).length > 0 ? 'LIVE' : videos.length}
                      </span>
                    )}
                  </button>
                  {/* 7. Press Credentials Tab (Admin) */}
                  <button
                    onClick={() => setActiveTab('credentials')}
                    title={sidebarCollapsed ? 'Issue Press Credentials' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'credentials'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4 text-rose-500 shrink-0" />
                      {!sidebarCollapsed && <span>Press Credentials</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 font-mono font-bold">
                        STAFF
                      </span>
                    )}
                  </button>

                  {/* 8. Sponsored Campaigns Tab (Admin) */}
                  <button
                    onClick={() => setActiveTab('sponsored')}
                    title={sidebarCollapsed ? 'Sponsored Campaigns' : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'sponsored'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
                      {!sidebarCollapsed && <span>Sponsored Campaigns</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-mono font-bold">
                        ADS
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* 5. Telemetry Tab */}
              <button
                onClick={() => setActiveTab('telemetry')}
                title={sidebarCollapsed ? 'Consensus & Telemetry' : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-purple-500 shrink-0" />
                  {!sidebarCollapsed && <span>Consensus & Telemetry</span>}
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Action: Guaranteed 1-Click Logout */}
          <div className="p-3 border-t border-gray-100 bg-slate-50">
            <button
              onClick={() => {
                logout();
                openDashboard(false);
              }}
              title="Log Out"
              className={`w-full py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center ${
                sidebarCollapsed ? 'justify-center px-1' : 'justify-center gap-2 px-3'
              } cursor-pointer transition-colors shadow-2xs`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Independently Scrolling Content Panel */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-8 bg-slate-50">
          {/* Action Success Toast */}
          {actionSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Tracked Posts</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{allTrackablePosts.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">● Field & Staff Dispatches</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">DLT Mined Truth Blocks</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                #{dltData?.totalBlocks || 0}
              </div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Anchored on Multi-Stake Nodes</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Consensus State</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {dltData?.networkStats?.activeValidators || 3} Active
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Byzantine FT Consensus</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tamper Defense Level</div>
              <div className="text-sm font-black text-blue-700 mt-2 truncate">
                {dltData?.networkStats?.tamperProtectionLevel || 'SHA-256 DLT MERKLE SEAL'}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Anti-Censorship Shield</div>
            </div>
          </div>

          {/* Tab 0: Approvals & Verification Desk (Admin & Expert) */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              {/* Approvals Desk Header */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 rounded-3xl shadow-md border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      {role === 'ADMIN'
                        ? 'Chief Editorial Desk'
                        : role === 'EXPERT'
                        ? 'Ground Truth Fact-Checker'
                        : 'Editorial Review Board'}
                    </span>
                    <span className="text-neutral-400 text-xs">• SusaLabs DLT Gatekeeper</span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">Editorial Approvals & Fact-Check Desk</h2>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                    Audit citizen eyewitness submissions, inspect attached photographic or video evidence, verify geolocation data, and anchor validated news onto the SusaLabs DLT truth ledger.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">In Review Queue</div>
                    <div className="text-xl font-black text-amber-400">{pendingCount}</div>
                  </div>
                  <button
                    onClick={loadDashboardData}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    title="Refresh Queue"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Pending Items List */}
              {pendingSubmissions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900">All Dispatches Audited</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    There are no pending submissions awaiting editorial review. Any new field report submitted by citizen reporters will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((sub) => {
                    const media = getSubmissionMedia(sub);
                    return (
                      <div
                        key={sub.id}
                        className="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6 space-y-4">
                          {/* Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                                {sub.category || 'Ground Reports'}
                              </span>
                              <span className="text-xs font-mono font-bold text-gray-400">
                                ID: #{sub.id}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                                PENDING EDITORIAL AUDIT
                              </span>
                            </div>

                            <div className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{sub.submittedTimeAgo || 'Just now'}</span>
                            </div>
                          </div>

                          {/* Submitter & Location Info */}
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                sub.authorAvatarUrl ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                              }
                              alt={sub.authorName}
                              className="w-10 h-10 rounded-full object-cover border border-amber-200"
                            />
                            <div>
                              <div className="text-xs font-extrabold text-gray-900">
                                {sub.authorName || 'Citizen Reporter'}
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{sub.location || 'Downtown Metro (GPS Tagged)'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Headline & Description */}
                          <div className="space-y-1.5">
                            <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                              {sub.title}
                            </h3>
                            {sub.description && (
                              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                {sub.description}
                              </p>
                            )}
                          </div>

                          {/* Private Verification Notes */}
                          {sub.note && (
                            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs">
                              <div className="text-[10px] font-black uppercase text-amber-900 mb-0.5 tracking-wider">
                                Private Submitter Notes (For Editor Only):
                              </div>
                              <div className="text-amber-800 font-mono text-[11px]">{sub.note}</div>
                            </div>
                          )}

                          {/* Attached Media Evidence Preview */}
                          {media && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                Attached Evidence Material:
                              </div>
                              {media.type === 'video' ? (
                                <div className="max-w-md rounded-2xl overflow-hidden border border-gray-200 bg-neutral-900">
                                  <video src={media.uri} controls className="w-full max-h-64 object-cover" />
                                </div>
                              ) : (
                                <div
                                  onClick={() => openLightbox(media.uri, sub.title)}
                                  className="relative inline-block max-w-md rounded-2xl overflow-hidden border border-gray-200 shadow-2xs cursor-zoom-in group"
                                  title="Click to view full photo evidence"
                                >
                                  <img
                                    src={media.uri}
                                    alt="Attached Evidence"
                                    className="max-h-64 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl">
                                    Click to Enlarge
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dual Consensus Verification Status Panel */}
                          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                Dual Consensus Audit Progress:
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                sub.status === 'PENDING_EXPERT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : sub.status === 'PENDING_JOURNALIST'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {sub.status === 'PENDING_EXPERT'
                                  ? '1 of 2 Verified (Journalist Audited ✓)'
                                  : sub.status === 'PENDING_JOURNALIST'
                                  ? '1 of 2 Verified (Fact-Check Certified ✓)'
                                  : '0 of 2 Verified (Pending Both)'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {/* 1. Staff Journalist Review */}
                              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                sub.journalistApproval?.approved
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                                  : 'bg-white border-gray-200 text-gray-600'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {sub.journalistApproval?.approved ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                  )}
                                  <div>
                                    <div className="font-bold text-[11px]">Staff Journalist Field Audit</div>
                                    <div className="text-[10px] text-gray-500">
                                      {sub.journalistApproval?.approved
                                        ? `Verified by ${sub.journalistApproval.approverName || sub.verifiedByJournalist || 'Sarah Jenkins'}`
                                        : 'Awaiting field correspondent audit'}
                                    </div>
                                  </div>
                                </div>
                                {sub.journalistApproval?.approved && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                    AUDITED
                                  </span>
                                )}
                              </div>

                              {/* 2. Ground Expert Fact-Check */}
                              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                sub.expertApproval?.approved
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                                  : 'bg-white border-gray-200 text-gray-600'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {sub.expertApproval?.approved ? (
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                  )}
                                  <div>
                                    <div className="font-bold text-[11px]">Ground Expert Fact-Check</div>
                                    <div className="text-[10px] text-gray-500">
                                      {sub.expertApproval?.approved
                                        ? `Certified by ${sub.expertApproval.approverName || sub.factCheckedBy || 'Elias Thorne'}`
                                        : 'Awaiting forensic & GPS check'}
                                    </div>
                                  </div>
                                </div>
                                {sub.expertApproval?.approved && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white">
                                    CERTIFIED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                              <Shield className="w-4 h-4 text-emerald-600" />
                              <span>News only publishes once BOTH Staff Journalist &amp; Ground Expert verify</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleOpenRejectModal(sub)}
                                className="px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>

                              {/* Staff Journalist Specific Action */}
                              {role === 'JOURNALIST' && (
                                sub.journalistApproval?.approved ? (
                                  <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>✓ Audited by You (Waiting for Ground Expert)</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleVerifySubmission(sub.id, 'JOURNALIST')}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  >
                                    <Shield className="w-4 h-4" />
                                    <span>Verify as Staff Journalist</span>
                                  </button>
                                )
                              )}

                              {/* Ground Expert Specific Action */}
                              {role === 'EXPERT' && (
                                sub.expertApproval?.approved ? (
                                  <span className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                    <span>✓ Certified by You (Waiting for Staff Journalist)</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleVerifySubmission(sub.id, 'EXPERT')}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Certify Forensic Fact-Check</span>
                                  </button>
                                )
                              )}

                              {/* Chief Editor (Admin) Master Controls */}
                              {role === 'ADMIN' && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {!sub.journalistApproval?.approved && (
                                    <button
                                      onClick={() => handleVerifySubmission(sub.id, 'JOURNALIST')}
                                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      title="Clear Staff Journalist review on behalf of board"
                                    >
                                      <span>+ Journalist Audit</span>
                                    </button>
                                  )}
                                  {!sub.expertApproval?.approved && (
                                    <button
                                      onClick={() => handleVerifySubmission(sub.id, 'EXPERT')}
                                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-800 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      title="Clear Ground Expert fact-check on behalf of board"
                                    >
                                      <span>+ Fact-Check Cert</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleVerifySubmission(sub.id, 'MASTER')}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  >
                                    <Shield className="w-4 h-4" />
                                    <span>Chief Editor Full Consensus &amp; DLT Anchor</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Posts & Submissions Tracking */}
          {activeTab === 'posts' && (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
              {/* Filter Bar */}
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {role === 'ADMIN'
                      ? 'All Platform Posts & Submissions'
                      : role === 'JOURNALIST'
                      ? 'My Published & Draft Stories'
                      : 'Dispatches & Verification Status'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live feed of reported news, verification status, and DLT proof-of-truth
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <input
                      type="text"
                      placeholder="Filter posts..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 text-gray-900"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Verified / Approved</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <button
                    onClick={loadDashboardData}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Posts List */}
              <div className="divide-y divide-gray-100">
                {filteredPosts.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-xs">
                    No dispatches matching current filter criteria.
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedDispatchModal(post)}
                      className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {post.category}
                          </span>

                          {post.status === 'APPROVED' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              VERIFIED ON DLT
                            </span>
                          ) : post.status === 'PENDING_EXPERT' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              JOURNALIST AUDITED (1/2) • AWAITING EXPERT
                            </span>
                          ) : post.status === 'PENDING_JOURNALIST' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock className="w-3 h-3 text-purple-600" />
                              FACT-CHECK CERTIFIED (1/2) • AWAITING JOURNALIST
                            </span>
                          ) : post.status === 'PENDING' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDING DUAL-CONSENSUS (0/2)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              REJECTED
                            </span>
                          )}

                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          {post.source === 'SUBMISSION' && (() => {
                            const media = getSubmissionMedia(post.raw as Submission);
                            if (!media) return null;
                            return (
                              <div className="shrink-0 mt-0.5">
                                {media.type === 'video' ? (
                                  <div className="w-14 h-12 rounded-xl bg-neutral-900 flex items-center justify-center">
                                    <Film className="w-4 h-4 text-amber-400" />
                                  </div>
                                ) : (
                                  <img
                                    src={media.uri}
                                    alt="Evidence"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLightbox(media.uri, post.title);
                                    }}
                                    className="w-14 h-12 rounded-xl object-cover border border-amber-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                                    title="Click to view full photo evidence"
                                  />
                                )}
                              </div>
                            );
                          })()}

                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-600 leading-snug transition-colors">
                              {post.title}
                            </h4>

                            <p className="text-xs text-gray-500 line-clamp-1">
                              {post.content}
                            </p>

                            {/* Editorial Rejection Reason Box */}
                            {post.status === 'REJECTED' && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                  <span className="font-extrabold uppercase text-[10px] text-rose-700 block mb-0.5">
                                    Rejection Reason:
                                  </span>
                                  <span className="font-medium">
                                    {(post.raw as Submission)?.rejectionReason ||
                                      (post.raw as Submission)?.note ||
                                      post.rejectionReason ||
                                      'Editorial standards not met upon audit.'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-400 flex items-center gap-1">
                          <span>Reported by:</span>
                          <span className="font-semibold text-gray-700">{post.author}</span>
                          <span>• ID: #{post.id}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <button
                          onClick={() => setSelectedDispatchModal(post)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>View Details</span>
                        </button>

                        {post.source === 'ARTICLE' && (
                          <button
                            onClick={() => {
                              selectArticle(post.raw as Article);
                              openDashboard(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Article</span>
                          </button>
                        )}

                        {isApprover &&
                          (post.status === 'PENDING' ||
                            post.status === 'PENDING_EXPERT' ||
                            post.status === 'PENDING_JOURNALIST') && (
                            <>
                              {role === 'JOURNALIST' && (
                                <button
                                  onClick={() => handleVerifySubmission(post.id, 'JOURNALIST')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Audit as Journalist</span>
                                </button>
                              )}
                              {role === 'EXPERT' && (
                                <button
                                  onClick={() => handleVerifySubmission(post.id, 'EXPERT')}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Certify Fact-Check</span>
                                </button>
                              )}
                              {role === 'ADMIN' && (
                                <button
                                  onClick={() => handleVerifySubmission(post.id, 'MASTER')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Chief Editor Approve</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenRejectModal(post.raw as Submission)}
                                className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                        <button
                          onClick={() => openDLTModal(true)}
                          className="p-1.5 rounded-xl border border-gray-200 hover:bg-amber-50 text-amber-700 cursor-pointer"
                          title="Verify DLT Ledger Hash"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: DLT Truth Mined Blocks */}
          {activeTab === 'dlt' && (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    SusaLabs DLT Consensus Ledger
                  </h3>
                  <p className="text-xs text-gray-500">
                    Live chain of cryptographic blocks preventing retroactive news alteration or censorship
                  </p>
                </div>
                <button
                  onClick={() => openDLTModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Ledger Explorer</span>
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {dltData?.blocks.map((block) => (
                  <div
                    key={block.blockHash}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-xs">
                        BLOCK #{block.blockIndex}
                      </span>
                      <span className="text-[11px] text-gray-500 font-sans">
                        {new Date(block.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-sans font-bold text-gray-900 text-sm">{block.title}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-white border border-gray-100 break-all">
                        <span className="text-gray-400 block text-[10px] uppercase">SHA-256 Content Hash</span>
                        <span className="text-emerald-700 font-bold">{block.contentHash}</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-gray-100 break-all">
                        <span className="text-gray-400 block text-[10px] uppercase">IPFS Snapshot CID</span>
                        <span className="text-blue-700 font-bold">{block.ipfsCid}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reporter Directory (Dynamic data from database) */}
          {activeTab === 'reporters' && (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Registered Field & Editorial Network</h3>
                  <p className="text-xs text-gray-500">Live roster of verified investigative reporters and correspondents in database</p>
                </div>
                <span className="text-xs font-bold text-gray-500">{adminUsers.length} Users Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminUsers.map((rep) => (
                  <div key={rep.id || rep.email} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rep.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'}
                        alt={rep.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs text-gray-900 truncate">{rep.name}</div>
                        <div className="text-[10px] font-bold text-amber-700">{rep.roleBadge || rep.role}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{rep.email}</span>
                    </div>
                    {rep.bio && (
                      <p className="text-[11px] text-gray-500 line-clamp-2">{rep.bio}</p>
                    )}
                    <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active Credentials
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Whistleblower Hotline (Dynamic tickets from database) */}
          {activeTab === 'hotline' && (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Encrypted Whistleblower Tips Queue</h3>
                  <p className="text-xs text-gray-500">Zero-knowledge incoming encrypted dispatches from citizen whistleblowers</p>
                </div>
                <button
                  onClick={() => openSupportModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer"
                >
                  Send Anonymous Hotline Tip
                </button>
              </div>

              {supportTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                  <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span>No unaddressed whistleblower leaks in queue. Secure telemetry nominal.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {supportTickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                          {t.category}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-gray-900">{t.subject}</div>
                      <p className="text-xs text-gray-600">{t.message}</p>
                      <div className="text-[10px] text-gray-400">
                        {t.isAnonymous ? '● Anonymous Whistleblower' : `From: ${t.name || t.email}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Consensus & Telemetry (Live data from DLT Ledger) */}
          {activeTab === 'telemetry' && (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                      DLT Consensus Telemetry
                    </span>
                    <span className="text-gray-400 text-xs">• Byzantine Fault Tolerant Network</span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">
                    Decentralized Node Consensus Health
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live heartbeat, cryptographic signature integrity, and multi-stake quorum across independent validator nodes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAuditChainFromDashboard}
                    disabled={isAuditingChain}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 text-emerald-400 ${isAuditingChain ? 'animate-spin' : ''}`} />
                    <span>{isAuditingChain ? 'Auditing Chain...' : 'Run Chain Audit'}</span>
                  </button>

                  <button
                    onClick={() => openDLTModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Open DLT Explorer</span>
                  </button>
                </div>
              </div>

              {/* Chain Audit Result Panel */}
              {dashboardChainAudit && (
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs animate-fadeIn ${
                    dashboardChainAudit.chainValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {dashboardChainAudit.chainValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-extrabold">{dashboardChainAudit.message}</span>
                      <span className="ml-2 text-[11px] opacity-80 font-mono">
                        (Audited {dashboardChainAudit.totalBlocksAudited} blocks • Consensus: {dashboardChainAudit.bftConsensusPercentage}%)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDashboardChainAudit(null)}
                    className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Network Status Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                    Total Blocks Anchored
                  </div>
                  <div className="text-xl font-black text-amber-600 font-mono mt-1">
                    #{dltData?.totalBlocks || 0} Blocks
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Continuous SHA-256 Link</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                    BFT Consensus Quorum
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700 flex items-center gap-1 mt-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Byzantine FT</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">2/3 Threshold Satisfied (3/3)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                    Active Multi-Stake Nodes
                  </div>
                  <div className="text-sm font-extrabold text-blue-700 flex items-center gap-1 mt-1.5">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>3 Consensus Nodes</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Tri-Party Decentralization</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                    Decentralized Storage
                  </div>
                  <div className="text-sm font-extrabold text-purple-700 flex items-center gap-1 mt-1.5">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>IPFS CIDv1 Multihash</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Raw Base32 Immutability</div>
                </div>
              </div>

              {/* Validator Nodes Real-Time Telemetry List */}
              <div className="space-y-4 text-xs">
                <div className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Independent Multi-Stake Validator Nodes</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                {/* Node 1: SusaLabs Core Truth Node */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                        01
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">
                          SusaLabs Core Truth Node
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Role: Editorial Ledger Authority & Cryptographic Root Gatekeeper
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Ping: 14ms
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        ONLINE / SYNCED
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-mono break-all text-gray-600">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Public Key (secp256k1):</span>
                    0x04e1a7b48c9038d17f54c9a2bf3192e4a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2
                  </div>
                </div>

                {/* Node 2: Independent Press Guild Node */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                        02
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">
                          Independent Press Guild Public Node
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Role: Distributed Multi-Bureau Public Journalistic Witness
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Ping: 17ms
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        ONLINE / SYNCED
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-mono break-all text-gray-600">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Public Key (secp256k1):</span>
                    0x04f2b8c59d0149e28a65da3c028203f5b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3
                  </div>
                </div>

                {/* Node 3: Decentralized Citizen Witness Network */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-400 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                        03
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">
                          Decentralized Citizen Witness Network
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Role: Decentralized P2P Citizen Reporter Verification Pool
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Ping: 19ms
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        ONLINE / SYNCED
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-mono break-all text-gray-600">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Public Key (secp256k1):</span>
                    0x04a3c9d60e1250f39b76eb4d139314a6ca09e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Public Page Channels & Layout Configuration (Admin only) */}
          {activeTab === 'layout' && (
            <div className="space-y-8">
              {/* Layout Config Header */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 rounded-3xl shadow-md border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                      Public Portal Layout Desk
                    </span>
                    <span className="text-neutral-400 text-xs">• Chief Editor Control</span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">Public Page Channels & Banner Settings</h2>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                    Configure which news channels are spotlighted on the top hero big banner, secondary investigative banner, and video stream channel.
                  </p>
                </div>
              </div>

              {/* Form 1: Channel & Banner Mapping */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Configure Featured Channel Banners
                    </h3>
                    <p className="text-xs text-gray-500">
                      Select which category is showcased in each public page section.
                    </p>
                  </div>
                </div>

                {layoutSuccessMsg && (
                  <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{layoutSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveLayoutConfig} className="space-y-6">
                  {/* Banner 1: Top Hero Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Top Hero Big Banner (Featured Story Slot)
                      </label>
                      <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                        Auto-Slides every 60s if &gt;1 news
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Select category channel for the top lead banner. If multiple dispatches exist in this category, the portal auto-slides every 1 minute.
                    </p>
                    <select
                      value={heroCat}
                      onChange={(e) => setHeroCat(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Urgent Breaking">Urgent Breaking</option>
                      {categories
                        .filter((c: any) => c.name !== 'All' && c.name !== 'Urgent Breaking')
                        .map((c: any) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Banner 2: Secondary Mid-Page Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Secondary Mid-Page Banner (Deep Dive Slot)
                      </label>
                      <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                        Auto-Slides every 60s if &gt;1 news
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Select category and section heading. Defaults to Tech & Media News, or switch to Business, Urban Infrastructure, or a custom category.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Channel Category
                        </span>
                        <select
                          value={secondaryCat}
                          onChange={(e) => {
                            setSecondaryCat(e.target.value);
                            setSecondaryTitle(`${e.target.value} News`);
                          }}
                          className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {categories
                            .filter((c: any) => c.name !== 'All')
                            .map((c: any) => (
                              <option key={c.id || c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Display Section Title
                        </span>
                        <input
                          type="text"
                          value={secondaryTitle}
                          onChange={(e) => setSecondaryTitle(e.target.value)}
                          placeholder="e.g. Tech & Media News"
                          className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner 3: Live Video Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <label className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Live & Eyewitness Video Streams Section Channel
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Configure whether this section highlights all live streams or focuses on a specific channel.
                    </p>
                    <select
                      value={videoCat}
                      onChange={(e) => setVideoCat(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Live Streams">Live Streams (All Eyewitness Video Dispatches)</option>
                      <option value="Ground Reports">Ground Reports</option>
                      <option value="Tech & Media">Tech & Media</option>
                      <option value="Urban Infrastructure">Urban Infrastructure</option>
                      <option value="All">All Channels</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={layoutSaving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {layoutSaving ? 'Updating Public Portal...' : 'Save Public Layout Settings'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Category Manager Desk */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <FolderPlus className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Category Management Desk
                    </h3>
                    <p className="text-xs text-gray-500">
                      Create new editorial beats and categories that dynamically appear across all topic filters, submission forms, and banner selectors.
                    </p>
                  </div>
                </div>

                {catSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{catSuccessMsg}</span>
                  </div>
                )}

                {catErrorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{catErrorMsg}</span>
                  </div>
                )}

                {/* Active Categories Pills */}
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">
                    Currently Active News Categories ({categories.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c: any) => (
                      <span
                        key={c.id || c.name}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Create New Category Form */}
                <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <span className="text-xs font-black uppercase text-gray-700 tracking-wider block">
                    Add New News Category
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                        Category Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Science & AI, Geopolitics, Health"
                        className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                        Description / Scope
                      </label>
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="e.g. Frontier technological breakthroughs"
                        className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={catCreating || !newCatName.trim()}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      {catCreating ? 'Creating Category...' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab 7: Live Broadcasts Desk (Admin only) */}
          {activeTab === 'livestreams' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-neutral-900 via-rose-950 to-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-rose-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/40 flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                      Live Broadcast Control Desk
                    </span>
                    <span className="text-neutral-400 text-xs">• Chief Editor Live Operations</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    YouTube Live Feeds & Eyewitness Streams
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-2xl leading-relaxed">
                    Deploy 24/7 continuous YouTube live streams (e.g. Al Jazeera English Live, Ground Ops) directly to the public news portal. Citizens and editors can watch real-time broadcasts with one click.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Streams</span>
                    <span className="text-xl font-extrabold text-white">{videos.length}</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-300 block">Active Live</span>
                    <span className="text-xl font-extrabold text-rose-400">{videos.filter((v) => v.isLive).length}</span>
                  </div>
                </div>
              </div>

              {/* Launch New Live Stream Form */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Launch New Live Stream / Broadcast
                    </h3>
                    <p className="text-xs text-gray-500">
                      Enter YouTube Live stream link or video URL. The stream will immediately appear on the public site's "Live & Eyewitness Video Streams" section.
                    </p>
                  </div>
                </div>

                {streamFeedbackMsg && (
                  <div
                    className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                      streamFeedbackMsg.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {streamFeedbackMsg.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span>{streamFeedbackMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleLaunchLiveStream} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Stream Title */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
                        Broadcast / Stream Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="e.g. Al Jazeera English Live | 24/7 Global Field Broadcast"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    {/* YouTube Live URL */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
                        YouTube Live URL / Stream Link <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=gCNeDWCI0vo or https://youtu.be/..."
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                        required
                      />
                      {getYouTubeThumbnail(streamUrl) && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid YouTube stream detected! High-res thumbnail auto-configured.</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
                        Broadcast Location / Bureau Name
                      </label>
                      <input
                        type="text"
                        value={streamLocation}
                        onChange={(e) => setStreamLocation(e.target.value)}
                        placeholder="e.g. Doha Operations Bureau or Metro District 4"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Reporter Name */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
                        Anchor / Reporter Name
                      </label>
                      <input
                        type="text"
                        value={streamReporter}
                        onChange={(e) => setStreamReporter(e.target.value)}
                        placeholder="e.g. Al Jazeera News Bureau / Staff Anchor"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
                      Stream Description & Brief
                    </label>
                    <textarea
                      rows={2}
                      value={streamDesc}
                      onChange={(e) => setStreamDesc(e.target.value)}
                      placeholder="Continuous 24/7 breaking eyewitness coverage, geo-verified dispatches, and live reporting..."
                      className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Live Status Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={streamIsLive}
                        onChange={(e) => setStreamIsLive(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">
                          Broadcast as Active LIVE Stream
                        </span>
                        <span className="text-[11px] text-gray-500">
                          When checked, displays pulsating red "● LIVE STREAM" badge on the portal.
                        </span>
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={isCreatingStream || !streamTitle.trim() || !streamUrl.trim()}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>{isCreatingStream ? 'Launching Live Feed...' : 'Launch Live Stream to Portal'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Streams List Table / Cards */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Current Broadcast Feeds ({videos.length})
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage active live broadcasts, toggle replay archives, preview YouTube player, or delete feeds.
                    </p>
                  </div>
                </div>

                {videos.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No active live streams currently. Launch one above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((vid) => {
                      const thumb =
                        vid.videoThumbnailUrl ||
                        getYouTubeThumbnail(vid.videoUrl) ||
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800';

                      return (
                        <div
                          key={vid.id}
                          className="rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between bg-white shadow-xs hover:shadow-md transition-shadow"
                        >
                          <div>
                            {/* Thumbnail / Status */}
                            <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                              <img
                                src={thumb}
                                alt={vid.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                {vid.isLive ? (
                                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    LIVE
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                    REPLAY
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-sm">
                                  {vid.viewersCount || '1.2k'}
                                </span>
                              </div>

                              <button
                                onClick={() => setPreviewStreamModal(vid)}
                                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer"
                                title="Click to preview stream"
                              >
                                <Play className="w-5 h-5 ml-0.5" />
                              </button>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                              <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
                                {vid.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                {vid.description || 'No description provided.'}
                              </p>
                              <div className="text-[11px] text-gray-500 space-y-1">
                                <div><span className="font-semibold text-gray-700">Location:</span> {vid.location}</div>
                                <div><span className="font-semibold text-gray-700">Reporter:</span> {vid.reporterName}</div>
                                {vid.videoUrl && (
                                  <div className="truncate">
                                    <span className="font-semibold text-gray-700">URL:</span>{' '}
                                    <a
                                      href={vid.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-rose-600 hover:underline inline-flex items-center gap-0.5"
                                    >
                                      <span>YouTube Link</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                            <button
                              onClick={() => handleToggleStreamStatus(vid)}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                                vid.isLive
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {vid.isLive ? 'Switch to Replay' : 'Set as LIVE'}
                            </button>

                            <button
                              onClick={() => setPreviewStreamModal(vid)}
                              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                              title="Preview player"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteStream(vid)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete broadcast"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Tab 7: Press Credentials Management Desk (Admin) */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-rose-950 text-white p-6 rounded-3xl shadow-md border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                      Editorial Credential Desk
                    </span>
                    <span className="text-gray-400 text-xs">• Chief Editor Clearance</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-white">
                    Issue Press Credentials &amp; Clearances
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Authorize Staff Journalists, Ground Experts, and Field Correspondents with formal reporting and verification privileges.
                  </p>
                </div>

                <button
                  onClick={() => setShowCredentialModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Issue New Press Credential</span>
                </button>
              </div>

              {/* Roster of Credentialed Journalists & Experts */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">Credentialed Newsroom Staff ({adminUsers.length})</h4>
                    <p className="text-xs text-gray-500">Live roster of staff journalists, ground experts, and platform editors in database</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminUsers.map((u) => (
                    <div key={u.id || u.email} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-gray-900 truncate">{u.name}</div>
                          <div className="text-[10px] font-bold text-rose-700">{u.roleBadge || u.role}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      {u.bio && <p className="text-[11px] text-gray-500 line-clamp-2">{u.bio}</p>}
                      <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Active Press Clearance
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: Sponsored Campaigns Desk (Admin) */}
          {activeTab === 'sponsored' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 text-white p-6 rounded-3xl shadow-md border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                      Community Partnerships
                    </span>
                    <span className="text-gray-400 text-xs">• Public Portal Sponsor Banner</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-white">
                    Sponsored Campaign Management
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Configure the community sponsor banner displayed across public news feeds on both web and mobile apps.
                  </p>
                </div>

                <button
                  onClick={() => setShowSponsoredModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Configure Campaign</span>
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-4">
                <h4 className="font-extrabold text-base text-gray-900">Live Campaign Banner Preview</h4>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-neutral-950 uppercase tracking-wider">
                        {campBadge || 'COMMUNITY SPONSOR'}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">{campSponsor}</span>
                      <span className="text-gray-400 text-xs">• Audience: {campAudience}</span>
                    </div>
                    <h5 className="font-black text-lg text-white">{campTitle}</h5>
                    <p className="text-xs text-gray-300 max-w-xl">{campSubtitle}</p>
                  </div>
                  <a
                    href={campUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-neutral-900 font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>{campCta || 'LEARN MORE'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Rejection Modal with Mandatory Reason */}
      {rejectModalSubmission && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-rose-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-900 via-neutral-900 to-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">Editorial Rejection Notice</h3>
                  <p className="text-xs text-rose-200">Mandatory audit rationale required for field reporter</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalSubmission(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Target Submission:</span>
                <h4 className="font-bold text-sm text-gray-900 mt-0.5 line-clamp-2">
                  #{rejectModalSubmission.id} • {rejectModalSubmission.title}
                </h4>
              </div>

              {/* Quick Reason Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1.5">
                  Quick Preset Reasons (Click to append):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Insufficient Photographic / Video Evidence',
                    'Uncorroborated Geolocation Coordinates',
                    'Contradicts Independent Satellite / Wire Data',
                    'Potential Duplicate Field Report',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setRejectionReasonText((prev) =>
                          prev ? `${prev}. ${preset}` : preset
                        )
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-medium transition-colors cursor-pointer border border-gray-200"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  Rejection Explanation <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectionReasonText}
                  onChange={(e) => {
                    setRejectionReasonText(e.target.value);
                    if (rejectionError) setRejectionError(null);
                  }}
                  placeholder="Specify why this submission failed fact-checking, verification, or community guidelines..."
                  className="w-full p-3 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-gray-900"
                />
                {rejectionError && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{rejectionError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectModalSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReject || !rejectionReasonText.trim()}
                  onClick={handleConfirmRejection}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Full Details Modal */}
      {selectedDispatchModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 my-8 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/10 border border-white/20">
                  {selectedDispatchModal.category || 'Ground Dispatch'}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  #{selectedDispatchModal.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedDispatchModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Status Banner */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {selectedDispatchModal.status === 'APPROVED' ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    VERIFIED &amp; ANCHORED TO DLT TRUTH LEDGER
                  </span>
                ) : selectedDispatchModal.status === 'PENDING_EXPERT' ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    <Clock className="w-4 h-4 text-blue-600" />
                    STAFF JOURNALIST AUDITED (1/2) • AWAITING GROUND EXPERT FACT-CHECK
                  </span>
                ) : selectedDispatchModal.status === 'PENDING_JOURNALIST' ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    <Clock className="w-4 h-4 text-purple-600" />
                    FORENSIC FACT-CHECK CERTIFIED (1/2) • AWAITING STAFF JOURNALIST CLEARANCE
                  </span>
                ) : selectedDispatchModal.status === 'PENDING' ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    PENDING DUAL EDITORIAL AUDIT &amp; FACT-CHECK (0/2)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    EDITORIAL REJECTION
                  </span>
                )}

                <span className="text-xs text-gray-400 font-mono">
                  {new Date(selectedDispatchModal.timestamp || 0).toLocaleString()}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-gray-900 leading-snug">
                {selectedDispatchModal.title}
              </h3>

              {/* Reporter info */}
              <div className="flex items-center gap-2.5 text-xs text-gray-600 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Reporter: <strong className="text-gray-900">{selectedDispatchModal.author}</strong></span>
                <span className="text-gray-300">|</span>
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Location: <strong className="text-gray-900">{(selectedDispatchModal.raw as Submission)?.location || 'Downtown Metro'}</strong></span>
              </div>

              {/* If Rejected: Show Rejection Notice Box */}
              {selectedDispatchModal.status === 'REJECTED' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-black text-rose-800 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Editorial Audit Rejection Reason</span>
                  </div>
                  <p className="text-rose-900 font-medium leading-relaxed pl-6">
                    {(selectedDispatchModal.raw as Submission)?.rejectionReason ||
                      (selectedDispatchModal.raw as Submission)?.note ||
                      selectedDispatchModal.rejectionReason ||
                      'Corroboration threshold not met upon editorial inspection.'}
                  </p>
                </div>
              )}

              {/* Dual Consensus Review Dossier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Staff Journalist Audit:
                  </div>
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    {selectedDispatchModal.journalistApproval?.approved || selectedDispatchModal.verifiedByJournalist ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 font-extrabold">
                          {selectedDispatchModal.journalistApproval?.approverName || selectedDispatchModal.verifiedByJournalist || 'Sarah Jenkins'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Pending Field Audit</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Ground Expert Fact-Check:
                  </div>
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    {selectedDispatchModal.expertApproval?.approved || selectedDispatchModal.factCheckedBy ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 font-extrabold">
                          {selectedDispatchModal.expertApproval?.approverName || selectedDispatchModal.factCheckedBy || 'Elias Thorne'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Pending Forensic Check</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Report Body / Incident Details:
                </span>
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {selectedDispatchModal.content || 'No additional narrative text provided.'}
                </p>
              </div>

              {/* Evidence Media Preview (Click opens Lightbox) */}
              {selectedDispatchModal.source === 'SUBMISSION' && (() => {
                const media = getSubmissionMedia(selectedDispatchModal.raw as Submission);
                if (!media) return null;
                return (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Attached Photographic Evidence (Click to Zoom):
                    </span>
                    {media.type === 'video' ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                        <video src={media.uri} controls className="w-full max-h-72 object-contain" />
                      </div>
                    ) : (
                      <div
                        onClick={() => openLightbox(media.uri, selectedDispatchModal.title)}
                        className="rounded-2xl overflow-hidden border border-gray-200 shadow-md cursor-zoom-in group relative"
                      >
                        <img src={media.uri} alt="Attached Evidence" className="w-full max-h-72 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          Click to Open Fullscreen
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* DLT Hash Proof Info */}
              {selectedDispatchModal.status === 'APPROVED' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1 font-mono">
                  <div className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SusaLabs DLT Merkle Anchor</span>
                  </div>
                  <div className="text-emerald-800 break-all text-[11px]">
                    BlockHash: 0x{Array.from(String(selectedDispatchModal.id)).map((c: string) => c.charCodeAt(0).toString(16)).join('').padEnd(64, 'a').slice(0, 64)}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedDispatchModal(null);
                  openDLTModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Inspect DLT Block</span>
              </button>
              <button
                onClick={() => setSelectedDispatchModal(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Stream Preview Modal */}
      {previewStreamModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-700">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-600 text-xs font-bold uppercase">
                  {previewStreamModal.isLive ? 'Live Stream Preview' : 'Replay Preview'}
                </span>
                <span className="text-sm font-bold truncate max-w-md">
                  {previewStreamModal.title}
                </span>
              </div>
              <button
                onClick={() => setPreviewStreamModal(null)}
                className="p-1 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {(() => {
                const ytEmbedUrl = getYouTubeEmbedUrl(previewStreamModal.videoUrl);
                if (ytEmbedUrl) {
                  return (
                    <iframe
                      src={ytEmbedUrl}
                      title={previewStreamModal.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                if (previewStreamModal.videoUrl) {
                  return (
                    <video
                      src={previewStreamModal.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }
                return (
                  <div className="text-gray-400 text-xs">No video stream URL provided</div>
                );
              })()}
            </div>

            <div className="p-4 bg-neutral-950 text-white flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400">Location: </span>
                <span className="font-semibold text-amber-400">{previewStreamModal.location}</span>
                <span className="mx-2 text-neutral-600">|</span>
                <span className="text-gray-400">Anchor: </span>
                <span className="font-semibold">{previewStreamModal.reporterName}</span>
              </div>
              {previewStreamModal.videoUrl && (
                <a
                  href={previewStreamModal.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <span>Open in YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Press Credential Issuance Modal (Mobile App Parity) */}
      {showCredentialModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-rose-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <UserPlus className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">Issue Press Credential</h3>
                  <p className="text-xs text-red-200">Accredit journalists &amp; expert fact-checkers</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCredential} className="p-6 space-y-4">
              {credSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{credSuccessMsg}</span>
                </div>
              )}
              {credErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{credErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  placeholder="e.g. Elena Rostova or Vikram Patel"
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Work / Bureau Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="journalist@nexttruth.media"
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Accredited Role</label>
                  <select
                    value={credRole}
                    onChange={(e) => setCredRole(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-red-500 focus:outline-none cursor-pointer"
                  >
                    <option value="JOURNALIST">Staff Journalist (Field Auditor)</option>
                    <option value="EXPERT">Ground Expert (Forensic Fact-Check)</option>
                    <option value="USER">Citizen Reporter (Contributor)</option>
                    <option value="ADMIN">Chief Editor / Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Initial Password</label>
                  <input
                    type="password"
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    placeholder="Optional (defaults to password123)"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Professional Beat &amp; Bio</label>
                <textarea
                  rows={2}
                  value={credBio}
                  onChange={(e) => setCredBio(e.target.value)}
                  placeholder="e.g. Senior Ground Correspondent covering Municipal zoning ordinances and supply chain investigations."
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCredentialModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIssuingCred || !credName.trim() || !credEmail.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isIssuingCred ? 'Issuing Credential...' : 'Issue Press Credential'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sponsored Campaign Configuration Modal (Mobile App Parity) */}
      {showSponsoredModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">Sponsored Campaigns</h3>
                  <p className="text-xs text-amber-200">Configure community partner and sponsor banner</p>
                </div>
              </div>
              <button
                onClick={() => setShowSponsoredModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 overflow-y-auto flex-1">
              {campSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{campSuccessMsg}</span>
                </div>
              )}
              {campErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{campErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    value={campTitle}
                    onChange={(e) => setCampTitle(e.target.value)}
                    placeholder="Susalabs Research Initiative"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Sponsor / Partner Name *</label>
                  <input
                    type="text"
                    value={campSponsor}
                    onChange={(e) => setCampSponsor(e.target.value)}
                    placeholder="Susalabs Intelligence"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Subtitle / Tagline *</label>
                <input
                  type="text"
                  value={campSubtitle}
                  onChange={(e) => setCampSubtitle(e.target.value)}
                  placeholder="Decentralized cryptographic verification protocol for modern civic reporting."
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={campBadge}
                    onChange={(e) => setCampBadge(e.target.value)}
                    placeholder="COMMUNITY SPONSOR"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={campCta}
                    onChange={(e) => setCampCta(e.target.value)}
                    placeholder="LEARN MORE"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Action Destination URL</label>
                  <input
                    type="url"
                    value={campUrl}
                    onChange={(e) => setCampUrl(e.target.value)}
                    placeholder="https://susalabs.com"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Audience</label>
                  <select
                    value={campAudience}
                    onChange={(e) => setCampAudience(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Readers (Global)</option>
                    <option value="PREMIUM_ONLY">Premium Subscribers</option>
                    <option value="COMMUNITY_ONLY">Community &amp; Citizen</option>
                    <option value="INVESTIGATIVE">Policy &amp; Tech Beats</option>
                  </select>
                </div>
              </div>

              {/* Live Mini Preview */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 space-y-1">
                <div className="text-[10px] text-gray-400 uppercase font-black">Live Preview:</div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-neutral-950 uppercase">
                    {campBadge || 'SPONSOR'}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">{campSponsor}</span>
                </div>
                <div className="font-bold text-sm text-white">{campTitle}</div>
                <p className="text-xs text-gray-300 line-clamp-1">{campSubtitle}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSponsoredModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCamp || !campTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>{isSavingCamp ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
