import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { newsApi } from '../api/newsApi';
import { Article, Submission, UserProfile, SubmissionStatus } from '../types';
import { SusalabsBrandBanner } from '../components/SusalabsBrandBanner';

export const ProfileScreen: React.FC = () => {
  const {
    userProfile,
    isUserPremium,
    setShowPremiumDialog,
    publishedBentoArticles,
    submissions,
    openArticle,
    selectTab,
    setShowAuthModal,
    setShowAdminUserModal,
    setShowSponsoredModal,
    setShowDLTModal,
    setShowServerModal,
    logout,
    updateUserProfilePhoto,
    changePassword,
    updateSubmissionStatus,
    openLightbox,
    showToast,
    isRefreshing,
    refreshData,
    bookmarkedArticleIds,
    bookmarkedArticles,
    toggleBookmark,
    heroArticle,
    opinionArticle,
    standardNewsArticles,
  } = useNews();

  const role = userProfile.role || 'USER';
  const isAdmin = role === 'ADMIN';
  const isJournalist = role === 'JOURNALIST';
  const isExpert = role === 'EXPERT';
  const isApprover = isAdmin || isJournalist || isExpert;
  const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';

  // Submissions Filter State
  const [submissionTab, setSubmissionTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Saved Articles Modal State
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);

  // Rejection Modal State
  const [rejectModalSub, setRejectModalSub] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const featuredBento = publishedBentoArticles[0];
  const subBento1 = publishedBentoArticles[1];
  const subBento2 = publishedBentoArticles[2];

  // Submissions displayed based on role
  const relevantSubmissions = isApprover
    ? submissions
    : submissions.filter((sub) => sub.userId === userProfile.id || !sub.userId);

  // Unified list of saved/bookmarked news
  const savedArticlesList = React.useMemo(() => {
    const map = new Map<string, Article>();
    (bookmarkedArticles || []).forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });
    [heroArticle, opinionArticle, ...(standardNewsArticles || []), ...(publishedBentoArticles || [])].forEach((a) => {
      if (a && a.id && bookmarkedArticleIds.has(a.id)) {
        map.set(a.id, a);
      }
    });
    return Array.from(map.values());
  }, [bookmarkedArticles, bookmarkedArticleIds, heroArticle, opinionArticle, standardNewsArticles, publishedBentoArticles]);

  const filteredSubmissions = relevantSubmissions.filter((sub) => {
    if (submissionTab === 'PENDING') {
      return (
        sub.status === 'PENDING' ||
        sub.status === 'PENDING_JOURNALIST' ||
        sub.status === 'PENDING_EXPERT' ||
        sub.status === 'REVISE'
      );
    }
    if (submissionTab === 'APPROVED') return sub.status === 'APPROVED';
    if (submissionTab === 'REJECTED') return sub.status === 'REJECTED';
    return true;
  });

  const pendingApprovalsCount = submissions.filter(
    (s) =>
      s.status === 'PENDING' ||
      s.status === 'PENDING_JOURNALIST' ||
      s.status === 'PENDING_EXPERT'
  ).length;

  const handlePickAvatar = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Select source to update your profile photo:',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              showToast('Camera permission is required');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              await updateUserProfilePhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              showToast('Gallery permission is required');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              await updateUserProfilePhoto(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleConfirmReject = async () => {
    if (!rejectModalSub) return;
    if (!rejectionReason.trim()) {
      setRejectionError('A mandatory rejection reason is required to reject this dispatch.');
      return;
    }

    setIsSubmittingReject(true);
    setRejectionError(null);
    try {
      await updateSubmissionStatus(
        rejectModalSub.id,
        'REJECTED',
        `Rejected by ${userProfile.name}: ${rejectionReason.trim()}`,
        rejectionReason.trim()
      );
      setRejectModalSub(null);
      setRejectionReason('');
      showToast('Dispatch rejected. Rejection reason logged.');
    } catch (err: any) {
      setRejectionError(err?.message || 'Failed to reject dispatch');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!newPassword.trim()) {
      showToast('New password cannot be empty');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await changePassword(newPassword.trim(), oldPassword.trim());
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      // Handled in context toast
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#6750A4']}
            tintColor="#6750A4"
          />
        }
      >
        {/* 1. Profile Header & Active Identity */}
        <View style={styles.profileHeader}>
          {isGuest ? (
            <View style={styles.avatarTouchable}>
              <View style={[styles.profileAvatar, { backgroundColor: '#ECE6F0', alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialIcons name="person" size={44} color="#79747E" />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickAvatar}
              style={styles.avatarTouchable}
            >
              <View style={styles.avatarContainer}>
                {userProfile.avatarUrl ? (
                  <Image
                    source={{ uri: userProfile.avatarUrl }}
                    style={styles.profileAvatar}
                  />
                ) : (
                  <View style={[styles.profileAvatar, { backgroundColor: '#6750A4', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialIcons name="person" size={40} color="#FFFFFF" />
                  </View>
                )}
                {isApprover && (
                  <View style={styles.adminCrownBadge}>
                    <MaterialIcons name="verified-user" size={14} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.cameraEditOverlayBadge}>
                  <MaterialIcons name="photo-camera" size={13} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          <Text style={styles.profileName}>{isGuest ? 'Guest User' : userProfile.name}</Text>
          {!isGuest && userProfile.email ? (
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          ) : null}

          {/* Role Badge */}
          {!isGuest && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isAdmin ? '#FEE2E2' : isJournalist ? '#ECFDF5' : isExpert ? '#FEF3C7' : '#EADDFF',
                  borderColor: isAdmin ? '#F87171' : isJournalist ? '#6EE7B7' : isExpert ? '#FCD34D' : '#D0BCFF',
                },
              ]}
            >
              <MaterialIcons
                name={isAdmin ? 'admin-panel-settings' : isJournalist ? 'article' : isExpert ? 'biotech' : 'verified'}
                size={15}
                color={isAdmin ? '#B91C1C' : isJournalist ? '#047857' : isExpert ? '#B45309' : '#21005D'}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isAdmin ? '#B91C1C' : isJournalist ? '#047857' : isExpert ? '#B45309' : '#21005D' },
                ]}
              >
                {userProfile.roleBadge || (isAdmin ? 'CHIEF EDITOR' : isJournalist ? 'STAFF CORRESPONDENT' : isExpert ? 'GROUND EXPERT' : 'CITIZEN REPORTER')}
              </Text>
            </View>
          )}

          {!isGuest && userProfile.bio ? (
            <Text style={styles.profileBio}>{userProfile.bio}</Text>
          ) : null}

          {/* Action Row: Sign In / Change Password / Logout */}
          <View style={styles.accountButtonsRow}>
            {isGuest ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAuthModal(true)}
                style={styles.signInBtn}
              >
                <MaterialIcons name="login" size={18} color="#FFFFFF" />
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.userActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowPasswordModal(true)}
                  style={styles.securityBtn}
                >
                  <MaterialIcons name="lock-outline" size={15} color="#475569" />
                  <Text style={styles.securityBtnText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={logout}
                  style={styles.logoutBtn}
                >
                  <MaterialIcons name="logout" size={15} color="#B3261E" />
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 2. SusaLabs DLT Blockchain Truth Banner Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setShowDLTModal(true)}
          style={styles.dltCardBanner}
        >
          <View style={styles.dltCardLeft}>
            <View style={styles.dltIconCircle}>
              <MaterialIcons name="layers" size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.dltHeaderRow}>
                <Text style={styles.dltCardTitle}>SusaLabs DLT Public Truth Ledger</Text>
                <View style={styles.dltConsensusPill}>
                  <Text style={styles.dltConsensusText}>100% BFT</Text>
                </View>
              </View>
              <Text style={styles.dltCardSub}>
                Explore cryptographic blocks, verify SHA-256 hashes, IPFS snapshots, and 3 validator node signatures.
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#D97706" />
        </TouchableOpacity>

        {/* Backend API Server Connection Configuration Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setShowServerModal(true)}
          style={styles.serverCardBanner}
        >
          <View style={styles.serverCardLeft}>
            <View style={styles.serverIconCircle}>
              <MaterialIcons name="dns" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.serverHeaderRow}>
                <Text style={styles.serverCardTitle}>Backend Server Connection</Text>
                <View style={styles.serverStatusPill}>
                  <Text style={styles.serverStatusText}>Port 5000</Text>
                </View>
              </View>
              <Text style={styles.serverCardSub}>
                Connected: {newsApi.getHost()} • Tap to change IP or Wi-Fi host
              </Text>
            </View>
          </View>
          <MaterialIcons name="edit" size={18} color="#2563EB" />
        </TouchableOpacity>

        {/* 3. EDITORIAL APPROVALS & VERIFICATION HUB (For Approvers: Admin, Journalist, Expert) */}
        {isApprover && (
          <View style={styles.approverDeskCard}>
            <View style={styles.approverHeader}>
              <View style={styles.approverTitleGroup}>
                <MaterialIcons
                  name="fact-check"
                  size={20}
                  color={isAdmin ? '#B91C1C' : isJournalist ? '#047857' : '#B45309'}
                />
                <Text style={styles.approverHeading}>
                  {isAdmin ? 'Chief Editorial Approvals Desk' : isJournalist ? 'Journalist Field Audit Desk' : 'Forensic Fact-Check Desk'}
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingApprovalsCount} PENDING</Text>
              </View>
            </View>

            <Text style={styles.approverSubtext}>
              {isAdmin
                ? 'Full editorial clearance authority. Validate ground investigations, issue credentials, and anchor verified reports to DLT.'
                : isJournalist
                  ? 'Staff Correspondent desk. Review citizen dispatches, audit photographic/video evidence, and grant Journalist Verification.'
                  : 'Policy & Fact-Check desk. Audit municipal claims, verify source veracity, and certify forensic corroboration.'}
            </Text>

            {/* Quick Admin Actions if Admin */}
            {isAdmin && (
              <View style={styles.adminToolsRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowAdminUserModal(true)}
                  style={styles.adminToolBtn}
                >
                  <MaterialIcons name="person-add" size={15} color="#FFFFFF" />
                  <Text style={styles.adminToolBtnText}>+ Issue Press Credential</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowSponsoredModal(true)}
                  style={styles.adminSponsoredBtn}
                >
                  <MaterialIcons name="campaign" size={15} color="#21005D" />
                  <Text style={styles.adminSponsoredBtnText}>Sponsored Campaigns</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Saved Articles Reading List Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setShowSavedModal(true)}
          style={styles.savedCardBanner}
        >
          <View style={styles.savedCardLeft}>
            <View style={styles.savedIconCircle}>
              <MaterialIcons name="bookmark" size={20} color="#6750A4" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.savedHeaderRow}>
                <Text style={styles.savedCardTitle}>SAVED ARTICLES LIST</Text>
                <View style={styles.savedCountPill}>
                  <Text style={styles.savedCountText}>{savedArticlesList.length} SAVED</Text>
                </View>
              </View>
              <Text style={styles.savedCardSub}>
                {savedArticlesList.length > 0
                  ? `Access ${savedArticlesList.length} saved dispatches • Tap to view`
                  : 'Bookmark news reports from Home to read them here.'}
              </Text>
            </View>
          </View>
          <View style={styles.savedViewBtn}>
            <Text style={styles.savedViewBtnText}>View List</Text>
            <MaterialIcons name="chevron-right" size={16} color="#6750A4" />
          </View>
        </TouchableOpacity>

        {/* 4. Submissions & Verification Desk Section */}
        {!isGuest && (
          <View style={styles.submissionSection}>
            <View style={styles.submissionHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.sectionHeader}>
                  {isApprover ? 'VERIFICATION QUEUE & DISPATCHES' : 'MY EYEWITNESS DISPATCHES'}
                </Text>
                <Text style={styles.adminQueueSubtitle} numberOfLines={2}>
                  {isApprover
                    ? 'Audit field submissions against multi-stake editorial gates'
                    : 'Track live corroboration status of your submitted dispatches'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => selectTab('POST')}
                style={styles.newReportBtn}
              >
                <MaterialIcons name="add" size={14} color="#6750A4" />
                <Text style={styles.newReportBtnText}>+ NEW REPORT</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabsRow}>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSubmissionTab(tab)}
                  style={[
                    styles.filterTabPill,
                    submissionTab === tab && styles.filterTabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabPillText,
                      submissionTab === tab && styles.filterTabPillTextActive,
                    ]}
                  >
                    {tab === 'PENDING' ? `PENDING (${pendingApprovalsCount})` : tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredSubmissions.length === 0 ? (
              <View style={styles.emptySubmissionsBox}>
                <MaterialIcons name="assignment" size={32} color="#CBD5E1" />
                <Text style={styles.emptySubmissionsText}>
                  No submissions in this filter. Tap '+ NEW REPORT' to dispatch eyewitness news.
                </Text>
              </View>
            ) : (
              filteredSubmissions.map((sub) => (
                <SubmissionDeskItem
                  key={sub.id}
                  submission={sub}
                  userRole={role}
                  userName={userProfile.name}
                  onOpenLightbox={openLightbox}
                  onApproveStage={async (stage, note) => {
                    await updateSubmissionStatus(sub.id, 'APPROVED', note, undefined, stage);
                  }}
                  onOpenRejectModal={() => {
                    setRejectModalSub(sub);
                    setRejectionReason('');
                    setRejectionError(null);
                  }}
                />
              ))
            )}
          </View>
        )}

        {/* 5. Published Bento Reports Section */}
        {publishedBentoArticles.length > 0 && (
          <View style={styles.bentoSection}>
            <Text style={styles.sectionHeader}>EDITORIAL DOSSIERS &amp; BENCHMARKS</Text>

            {featuredBento && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openArticle(featuredBento)}
                style={styles.featuredCard}
              >
                <View style={styles.featuredImageWrapper}>
                  {featuredBento.imageUrl ? (
                    <Image
                      source={{ uri: featuredBento.imageUrl }}
                      style={styles.featuredImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.featuredImage, { backgroundColor: '#EADDFF' }]} />
                  )}
                  <View style={styles.opEdBadge}>
                    <Text style={styles.opEdBadgeText}>VERIFIED DISPATCH</Text>
                  </View>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{featuredBento.title}</Text>
                  <Text style={styles.featuredExcerpt} numberOfLines={2}>
                    {featuredBento.excerpt}
                  </Text>
                  <Text style={styles.dateText}>{featuredBento.dateOrTimeAgo}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 6. Susalabs Organization Branding */}
        <SusalabsBrandBanner />
      </ScrollView>

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalSub && (
        <Modal
          visible={Boolean(rejectModalSub)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRejectModalSub(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <View style={styles.rejectHeaderGroup}>
                  <MaterialIcons name="cancel" size={22} color="#DC2626" />
                  <Text style={styles.dialogTitle}>Reject Eyewitness Dispatch</Text>
                </View>
                <TouchableOpacity onPress={() => setRejectModalSub(null)}>
                  <MaterialIcons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.dialogSubtitle}>
                Target: "{rejectModalSub.title}"
              </Text>

              <Text style={styles.dialogInstructions}>
                Please state the specific reason why this report cannot be verified (e.g., conflicting timestamps, insufficient corroborating ground footage, unverified claims). This will be shown to the citizen reporter.
              </Text>

              {rejectionError && (
                <View style={styles.dialogErrorBox}>
                  <MaterialIcons name="error-outline" size={16} color="#DC2626" />
                  <Text style={styles.dialogErrorText}>{rejectionError}</Text>
                </View>
              )}

              <TextInput
                value={rejectionReason}
                onChangeText={(t) => {
                  setRejectionReason(t);
                  setRejectionError(null);
                }}
                placeholder="Enter mandatory rejection reason..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                style={styles.rejectionTextInput}
              />

              <View style={styles.dialogActionsRow}>
                <TouchableOpacity
                  onPress={() => setRejectModalSub(null)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmReject}
                  disabled={isSubmittingReject || !rejectionReason.trim()}
                  style={[
                    styles.confirmRejectBtn,
                    { opacity: isSubmittingReject || !rejectionReason.trim() ? 0.5 : 1 },
                  ]}
                >
                  {isSubmittingReject ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmRejectBtnText}>Confirm Rejection</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Saved Articles Reading List Modal */}
      {showSavedModal && (
        <Modal
          visible={showSavedModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSavedModal(false)}
        >
          <View style={styles.savedModalBackdrop}>
            <View style={styles.savedModalCard}>
              <View style={styles.savedModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.savedModalIconCircle}>
                    <MaterialIcons name="bookmark" size={20} color="#6750A4" />
                  </View>
                  <View>
                    <Text style={styles.savedModalTitle}>Saved Reading List</Text>
                    <Text style={styles.savedModalSubtitle}>
                      {savedArticlesList.length} bookmarked report{savedArticlesList.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSavedModal(false)}
                  style={styles.savedModalCloseBtn}
                >
                  <MaterialIcons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {savedArticlesList.length === 0 ? (
                <View style={styles.savedEmptyBox}>
                  <MaterialIcons name="bookmark-border" size={48} color="#CBD5E1" />
                  <Text style={styles.savedEmptyTitle}>No Saved Articles Yet</Text>
                  <Text style={styles.savedEmptySub}>
                    Tap the bookmark icon on any dispatch from the Home feed to save it for reading later.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowSavedModal(false);
                      selectTab('HOME');
                    }}
                    style={styles.savedExploreBtn}
                  >
                    <Text style={styles.savedExploreBtnText}>Explore Dispatches</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 8 }}
                >
                  {savedArticlesList.map((art) => (
                    <View key={art.id} style={styles.savedItemCard}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          if (art.imageUrl) openLightbox(art.imageUrl);
                        }}
                      >
                        {art.imageUrl ? (
                          <Image
                            source={{ uri: art.imageUrl }}
                            style={styles.savedItemThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.savedItemThumb, { backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }]}>
                            <MaterialIcons name="article" size={24} color="#6750A4" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <View style={styles.savedItemCategoryRow}>
                          <Text style={styles.savedItemCategory}>
                            {(art.category || 'NEWS').toUpperCase()}
                          </Text>
                          {art.dateOrTimeAgo ? (
                            <Text style={styles.savedItemTime}>• {art.dateOrTimeAgo}</Text>
                          ) : null}
                        </View>

                        <Text style={styles.savedItemTitle} numberOfLines={2}>
                          {art.title}
                        </Text>

                        <Text style={styles.savedItemAuthor} numberOfLines={1}>
                          By {art.authorName || 'Correspondent'}
                        </Text>

                        <View style={styles.savedItemActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setShowSavedModal(false);
                              openArticle(art);
                            }}
                            style={styles.savedReadBtn}
                          >
                            <Text style={styles.savedReadBtnText}>Read Article</Text>
                            <MaterialIcons name="arrow-forward" size={13} color="#FFFFFF" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={async () => {
                              await toggleBookmark(art.id);
                            }}
                            style={styles.savedRemoveIconBtn}
                            accessibilityLabel="Remove from saved"
                          >
                            <MaterialIcons name="bookmark-remove" size={18} color="#94A3B8" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <View style={styles.rejectHeaderGroup}>
                  <MaterialIcons name="lock" size={20} color="#21005D" />
                  <Text style={styles.dialogTitle}>Update Security Password</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <MaterialIcons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.dialogSubtitle}>
                Update password for {userProfile.email}
              </Text>

              <Text style={styles.inputFieldLabel}>CURRENT PASSWORD (OPTIONAL)</Text>
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.passwordInput}
              />

              <Text style={styles.inputFieldLabel}>NEW SECURE PASSWORD *</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter at least 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.passwordInput}
              />

              <View style={styles.dialogActionsRow}>
                <TouchableOpacity
                  onPress={() => setShowPasswordModal(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleChangePasswordSubmit}
                  disabled={isUpdatingPassword || !newPassword.trim()}
                  style={[
                    styles.confirmSaveBtn,
                    { opacity: isUpdatingPassword || !newPassword.trim() ? 0.5 : 1 },
                  ]}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmSaveBtnText}>Save Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Item Component for Submissions with Full Multi-Stake Review Status
const SubmissionDeskItem: React.FC<{
  submission: Submission;
  userRole: string;
  userName: string;
  onOpenLightbox: (uri: string) => void;
  onApproveStage: (stage: 'JOURNALIST' | 'EXPERT' | 'MASTER', note?: string) => Promise<void>;
  onOpenRejectModal: () => void;
}> = ({
  submission,
  userRole,
  userName,
  onOpenLightbox,
  onApproveStage,
  onOpenRejectModal,
}) => {
    const [approving, setApproving] = useState(false);

    const isAdmin = userRole === 'ADMIN';
    const isJournalist = userRole === 'JOURNALIST';
    const isExpert = userRole === 'EXPERT';
    const isApprover = isAdmin || isJournalist || isExpert;

    let parsedAttachments: { id: string; uri: string; type: string }[] = [];
    if (submission.attachments) {
      try {
        const parsed = JSON.parse(submission.attachments);
        if (Array.isArray(parsed)) parsedAttachments = parsed;
      } catch (_) { }
    }
    const imageAttachments = parsedAttachments.filter((a) => a.type === 'image' || !a.type);

    const getStatusConfig = () => {
      switch (submission.status) {
        case 'PENDING_JOURNALIST':
          return {
            icon: 'hourglass-empty' as const,
            color: '#B45309',
            bg: '#FEF3C7',
            border: '#FCD34D',
            label: 'PENDING JOURNALIST AUDIT',
          };
        case 'PENDING_EXPERT':
          return {
            icon: 'biotech' as const,
            color: '#2563EB',
            bg: '#EFF6FF',
            border: '#BFDBFE',
            label: 'PENDING EXPERT FACT-CHECK',
          };
        case 'PENDING':
          return {
            icon: 'hourglass-empty' as const,
            color: '#B45309',
            bg: '#FEF3C7',
            border: '#FCD34D',
            label: 'PENDING VERIFICATION',
          };
        case 'REVISE':
          return {
            icon: 'edit' as const,
            color: '#B91C1C',
            bg: '#FEE2E2',
            border: '#FCA5A5',
            label: 'REVISE REQUESTED',
          };
        case 'APPROVED':
          return {
            icon: 'check-circle' as const,
            color: '#15803D',
            bg: '#DCFCE7',
            border: '#86EFAC',
            label: 'VERIFIED & DLT SEALED ✓',
          };
        case 'REJECTED':
        default:
          return {
            icon: 'cancel' as const,
            color: '#DC2626',
            bg: '#FEE2E2',
            border: '#FCA5A5',
            label: 'REJECTED',
          };
      }
    };

    const statusCfg = getStatusConfig();

    const handleAction = async (stage: 'JOURNALIST' | 'EXPERT' | 'MASTER') => {
      setApproving(true);
      try {
        await onApproveStage(stage);
      } finally {
        setApproving(false);
      }
    };

    return (
      <View style={styles.subItemCard}>
        {/* Top Author and Status Row */}
        <View style={styles.subItemAuthorRow}>
          {submission.authorAvatarUrl ? (
            <Image source={{ uri: submission.authorAvatarUrl }} style={styles.subItemAuthorAvatar} />
          ) : (
            <View style={[styles.subItemAuthorAvatar, { backgroundColor: '#6750A4', alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialIcons name="person" size={14} color="#FFFFFF" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.subItemAuthorName}>{submission.authorName || 'Citizen Reporter'}</Text>
            <Text style={styles.subItemTime}>
              {submission.location ? `📍 ${submission.location}  ·  ` : ''}
              {submission.submittedTimeAgo || 'Recently'}
              {submission.category ? `  ·  ${submission.category}` : ''}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusCfg.bg, borderColor: statusCfg.border },
            ]}
          >
            <MaterialIcons name={statusCfg.icon} size={11} color={statusCfg.color} />
            <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.subItemTitle}>{submission.title}</Text>

        {/* Description */}
        {submission.description ? (
          <Text style={styles.subItemDescription} numberOfLines={3}>
            {submission.description}
          </Text>
        ) : null}

        {/* Evidence Thumbnails (Clickable to Lightbox) */}
        {imageAttachments.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachedImagesRow}>
            {imageAttachments.map((img, idx) => (
              <TouchableOpacity
                key={img.id || idx}
                onPress={() => onOpenLightbox(img.uri)}
                activeOpacity={0.85}
                style={styles.attachedImageTouch}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={styles.attachedImageThumb}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Multi-Stake Audit Progress Stages */}
        <View style={styles.auditGatesBox}>
          {/* Gate 1: Journalist */}
          <View style={styles.auditGateRow}>
            <MaterialIcons
              name={submission.journalistApproval?.approved ? 'check-circle' : 'pending'}
              size={14}
              color={submission.journalistApproval?.approved ? '#15803D' : '#94A3B8'}
            />
            <Text style={styles.auditGateText}>
              Staff Journalist Field Audit:{' '}
              <Text style={{ fontWeight: '800', color: submission.journalistApproval?.approved ? '#15803D' : '#B45309' }}>
                {submission.journalistApproval?.approved
                  ? `✓ Verified by ${submission.journalistApproval.approverName}`
                  : 'Pending'}
              </Text>
            </Text>
          </View>

          {/* Gate 2: Expert */}
          <View style={styles.auditGateRow}>
            <MaterialIcons
              name={submission.expertApproval?.approved ? 'check-circle' : 'pending'}
              size={14}
              color={submission.expertApproval?.approved ? '#15803D' : '#94A3B8'}
            />
            <Text style={styles.auditGateText}>
              Forensic Fact-Check:{' '}
              <Text style={{ fontWeight: '800', color: submission.expertApproval?.approved ? '#15803D' : '#2563EB' }}>
                {submission.expertApproval?.approved
                  ? `✓ Certified by ${submission.expertApproval.approverName}`
                  : 'Pending'}
              </Text>
            </Text>
          </View>

          {/* Chief Editor Master Clearance */}
          {submission.finalApprovedBy ? (
            <View style={styles.auditGateRow}>
              <MaterialIcons name="verified" size={14} color="#1D4ED8" />
              <Text style={styles.auditGateText}>
                Chief Editorial Master Clearance:{' '}
                <Text style={{ fontWeight: '800', color: '#1D4ED8' }}>
                  ✓ Cleared by {submission.finalApprovedBy}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* Rejection Reason Notice (Visible when rejected) */}
        {submission.status === 'REJECTED' && (submission.rejectionReason || submission.note) && (
          <View style={styles.rejectionNoticeCard}>
            <View style={styles.rejectionNoticeHeader}>
              <MaterialIcons name="error" size={14} color="#DC2626" />
              <Text style={styles.rejectionNoticeTitle}>EDITORIAL REJECTION REASON:</Text>
            </View>
            <Text style={styles.rejectionNoticeText}>
              {submission.rejectionReason || submission.note}
            </Text>
          </View>
        )}

        {/* Approver Action Buttons (When reviewing in Approver Desk) */}
        {isApprover && submission.status !== 'APPROVED' && submission.status !== 'REJECTED' && (
          <View style={styles.approverActionsBar}>
            {/* Journalist Action */}
            {(isJournalist || isAdmin) && !submission.journalistApproval?.approved && (
              <TouchableOpacity
                onPress={() => handleAction('JOURNALIST')}
                disabled={approving}
                style={styles.journalistApproveBtn}
              >
                <MaterialIcons name="check" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>
                  {approving ? 'Verifying...' : 'Journalist Verify'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Expert Action */}
            {(isExpert || isAdmin) && !submission.expertApproval?.approved && (
              <TouchableOpacity
                onPress={() => handleAction('EXPERT')}
                disabled={approving}
                style={styles.expertApproveBtn}
              >
                <MaterialIcons name="biotech" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>
                  {approving ? 'Certifying...' : 'Expert Certify'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Master Admin Publish */}
            {isAdmin && (
              <TouchableOpacity
                onPress={() => handleAction('MASTER')}
                disabled={approving}
                style={styles.masterPublishBtn}
              >
                <MaterialIcons name="publish" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Master Publish</Text>
              </TouchableOpacity>
            )}

            {/* Reject Button (Always Available to Approvers with Mandatory Reason) */}
            <TouchableOpacity
              onPress={onOpenRejectModal}
              disabled={approving}
              style={styles.rejectDispatchBtn}
            >
              <MaterialIcons name="close" size={14} color="#DC2626" />
              <Text style={styles.rejectDispatchBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FD',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  adminCrownBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#B91C1C',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraEditOverlayBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    backgroundColor: '#0F172A',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileBio: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  accountButtonsRow: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#21005D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  dltCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dltCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 6,
  },
  dltIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dltHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dltCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400E',
  },
  dltConsensusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dltConsensusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
  },
  dltCardSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  serverCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  serverCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 6,
  },
  serverIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serverCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E40AF',
  },
  serverStatusPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  serverStatusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#3730A3',
  },
  serverCardSub: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 2,
    lineHeight: 15,
  },
  approverDeskCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  approverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  approverTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approverHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  approverSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },
  adminToolsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adminToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingVertical: 9,
    borderRadius: 10,
  },
  adminToolBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  adminSponsoredBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#E2E8F0',
    paddingVertical: 9,
    borderRadius: 10,
  },
  adminSponsoredBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  savedCardBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  savedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  savedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  savedCountPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savedCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6750A4',
  },
  savedCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  savedViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  savedViewBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6750A4',
  },
  savedModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  savedModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  savedModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  savedModalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  savedModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  savedModalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  savedEmptyBox: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  savedEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  savedEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  savedExploreBtn: {
    marginTop: 12,
    backgroundColor: '#6750A4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  savedExploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savedItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  savedItemThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  savedItemCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  savedItemCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6750A4',
  },
  savedItemTime: {
    fontSize: 9,
    color: '#94A3B8',
  },
  savedItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
  },
  savedItemAuthor: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  savedItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  savedReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6750A4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  savedReadBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savedRemoveIconBtn: {
    padding: 4,
    borderRadius: 6,
  },
  submissionSection: {
    marginBottom: 20,
  },
  submissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  adminQueueSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  newReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  newReportBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6750A4',
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterTabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterTabPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  filterTabPillTextActive: {
    color: '#FFFFFF',
  },
  emptySubmissionsBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptySubmissionsText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  subItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  subItemAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subItemAuthorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  subItemAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  subItemTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  subItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 18,
  },
  subItemDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  attachedImagesRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  attachedImageTouch: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachedImageThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  auditGatesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    marginTop: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  auditGateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditGateText: {
    fontSize: 10,
    color: '#475569',
  },
  rejectionNoticeCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 8,
  },
  rejectionNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  rejectionNoticeTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  rejectionNoticeText: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 15,
  },
  approverActionsBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  journalistApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expertApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  masterPublishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  rejectDispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectDispatchBtnText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  bentoSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  featuredImageWrapper: {
    position: 'relative',
    height: 160,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  opEdBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  opEdBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  featuredContent: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  featuredExcerpt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rejectHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dialogSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  dialogInstructions: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
  },
  dialogErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  dialogErrorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  rejectionTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontSize: 12,
    color: '#0F172A',
    height: 90,
    marginBottom: 14,
  },
  inputFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    marginTop: 6,
  },
  passwordInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 10,
  },
  dialogActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  confirmRejectBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  confirmRejectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmSaveBtn: {
    backgroundColor: '#21005D',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  confirmSaveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
