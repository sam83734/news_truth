import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
const MIcon = MaterialIcons;
import { useNews } from '../context/NewsContext';
import { Article, Submission, UserProfile, SubmissionStatus } from '../types';
import { SusalabsBrandBanner } from '../components/SusalabsBrandBanner';
import { Colors } from '../theme/colors';

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
    logout,
    updateUserProfilePhoto,
    updateSubmissionStatus,
    showToast,
    isRefreshing,
    refreshData,
  } = useNews();

  const featuredBento = publishedBentoArticles[0];
  const subBento1 = publishedBentoArticles[1];
  const subBento2 = publishedBentoArticles[2];

  const isAdmin = userProfile.role === 'ADMIN';
  const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';
  const userSubmissions = isAdmin
    ? submissions
    : submissions.filter((sub) => sub.userId === userProfile.id);

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
                {isAdmin && (
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

          <Text style={styles.profileName}>{isGuest ? 'Guest' : userProfile.name}</Text>
          {!isGuest && userProfile.email ? (
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          ) : null}

          {/* Role Badge */}
          {!isGuest && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isAdmin ? '#F9DEDC' : '#EADDFF',
                  borderColor: isAdmin ? '#B3261E' : '#D0BCFF',
                },
              ]}
            >
              <MaterialIcons
                name={isAdmin ? 'admin-panel-settings' : 'verified'}
                size={15}
                color={isAdmin ? '#B3261E' : '#21005D'}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isAdmin ? '#B3261E' : '#21005D' },
                ]}
              >
                {userProfile.roleBadge || 'CITIZEN READER'}
              </Text>
            </View>
          )}

          {!isGuest && userProfile.bio ? (
            <Text style={styles.profileBio}>{userProfile.bio}</Text>
          ) : null}

          {/* Account Action Buttons (Real Sign In / Logout) */}
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={logout}
                style={styles.logoutBtn}
              >
                <MaterialIcons name="logout" size={16} color="#B3261E" />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. ADMIN OPERATIONS HUB (Visible Only When Logged in as ADMIN) */}
        {isAdmin && (
          <View style={styles.adminHubCard}>
            <View style={styles.adminTopAccent} />
            <View style={styles.adminHubInner}>
              <View style={styles.adminHubHeader}>
                <View style={styles.adminHubTitleGroup}>
                  <MaterialIcons name="security" size={20} color="#B3261E" />
                  <Text style={styles.adminHubHeading}>Chief Editor Control Desk</Text>
                </View>
              </View>

              <Text style={styles.adminHubSubtext}>
                You have administrative authority to onboard staff journalists, verify ground dispatches, and manage sponsored campaigns with audience targeting.
              </Text>

              {/* Admin Action Buttons */}
              <View style={styles.adminToolsRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowAdminUserModal(true)}
                  style={styles.adminToolBtn}
                >
                  <MaterialIcons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.adminToolBtnText}>+ Issue Press Credential</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowSponsoredModal(true)}
                  style={styles.adminSponsoredBtn}
                >
                  <MaterialIcons name="campaign" size={16} color="#21005D" />
                  <Text style={styles.adminSponsoredBtnText}>Sponsored Campaigns</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 3. Support the Truth (Premium Banner) */}
        <View style={styles.premiumBannerCard}>
          <View style={styles.topAccentBar} />

          <View style={styles.premiumBannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportHeading}>Support the Truth</Text>
              <Text style={styles.supportSubtext}>
                {isUserPremium
                  ? 'Premium Member: Full Ground Access Active'
                  : 'Unlock unfiltered ground reports & expert columns.'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowPremiumDialog(true)}
              style={styles.goPremiumBtn}
            >
              <Text style={styles.goPremiumBtnText}>
                {isUserPremium ? 'PREMIUM' : 'GO PREMIUM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Published Reports Section (Bento Grid) */}
        {publishedBentoArticles.length > 0 && (
          <View style={styles.bentoSection}>
            <Text style={styles.sectionHeader}>PUBLISHED REPORTS</Text>

            {/* Large Featured Bento Item */}
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
                    <Text style={styles.opEdBadgeText}>OP-ED</Text>
                  </View>
                </View>

                <View style={styles.featuredDetails}>
                  <Text style={styles.featuredTitle}>{featuredBento.title}</Text>

                  <View style={styles.featuredFooter}>
                    <Text style={styles.dateText}>{featuredBento.dateOrTimeAgo}</Text>
                    <View style={styles.viewsRow}>
                      <MaterialIcons name="visibility" size={14} color="#49454F" />
                      <Text style={styles.viewsText}>{featuredBento.views || '12k'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* 2-Column Split Row */}
            <View style={styles.splitRow}>
              {/* Left Sub Card */}
              {subBento1 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openArticle(subBento1)}
                  style={styles.subCard}
                >
                  <View style={styles.subCardInner}>
                    <View>
                      <MaterialIcons name="videocam" size={20} color="#6750A4" />
                      <Text style={styles.subCardTitle} numberOfLines={3}>
                        {subBento1.title}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{subBento1.dateOrTimeAgo}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Right Sub Card */}
              {subBento2 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openArticle(subBento2)}
                  style={styles.subCard}
                >
                  <View style={styles.opinionSubCardRow}>
                    <View style={styles.subCardAccentLine} />
                    <View style={styles.subCardInner}>
                      <View>
                        <MaterialIcons name="edit-note" size={20} color="#49454F" />
                        <Text style={styles.subCardTitle} numberOfLines={3}>
                          {subBento2.title}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>{subBento2.dateOrTimeAgo}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 5. Submission Desk Section (Visible Only When User is Logged In) */}
        {!isGuest && (
          <View style={styles.submissionSection}>
            <View style={styles.submissionHeaderRow}>
              <View>
                <Text style={styles.sectionHeader}>
                  {isAdmin ? 'VERIFICATION DESK QUEUE' : 'SUBMISSION DESK'}
                </Text>
                {isAdmin && (
                  <Text style={styles.adminQueueSubtitle}>
                    Admin verification moderation active
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => selectTab('POST')}>
                <Text style={styles.newReportBtnText}>+ NEW REPORT</Text>
              </TouchableOpacity>
            </View>

            {userSubmissions.length === 0 ? (
              <View style={styles.emptySubmissionsBox}>
                <MaterialIcons name="assignment" size={32} color="#CAC4D0" />
                <Text style={styles.emptySubmissionsText}>
                  No submissions in review. Tap '+ NEW REPORT' to dispatch eyewitness news.
                </Text>
              </View>
            ) : (
              userSubmissions.map((sub) => (
                <SubmissionDeskItem
                  key={sub.id}
                  submission={sub}
                  isAdmin={isAdmin}
                  onUpdateStatus={(status) => updateSubmissionStatus(sub.id, status)}
                />
              ))
            )}
          </View>
        )}

        {/* 6. Susalabs Organization & Tech Labs Branding */}
        <SusalabsBrandBanner />
      </ScrollView>
    </View>
  );
};

const SubmissionDeskItem: React.FC<{
  submission: Submission;
  isAdmin: boolean;
  onUpdateStatus: (status: SubmissionStatus) => void;
}> = ({ submission, isAdmin, onUpdateStatus }) => {

  // Parse attached images/videos from JSON
  let parsedAttachments: { id: string; uri: string; type: string }[] = [];
  if (submission.attachments) {
    try {
      const parsed = JSON.parse(submission.attachments);
      if (Array.isArray(parsed)) parsedAttachments = parsed;
    } catch (_) {}
  }
  const imageAttachments = parsedAttachments.filter((a) => a.type === 'image');

  // Compute relative time from createdAt
  const getRelativeTime = (iso?: string): string => {
    if (!iso) return submission.submittedTimeAgo || 'Just now';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };


  const getStatusConfig = () => {
    switch (submission.status) {
      case 'PENDING':
        return {
          icon: 'hourglass-empty' as const,
          iconColor: '#79747E',
          badgeBg: '#FEF7FF',
          badgeBorder: '#E7E0EC',
          badgeColor: '#79747E',
          label: 'PENDING',
        };
      case 'REVISE':
        return {
          icon: 'error' as const,
          iconColor: '#B3261E',
          badgeBg: '#F9DEDC',
          badgeBorder: 'rgba(179,38,30,0.3)',
          badgeColor: '#B3261E',
          label: 'REVISE',
        };
      case 'APPROVED':
        return {
          icon: 'check-circle' as const,
          iconColor: '#6750A4',
          badgeBg: '#EADDFF',
          badgeBorder: '#D0BCFF',
          badgeColor: '#21005D',
          label: 'APPROVED ✓ PUBLISHED',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.subItemCard}>
      {/* Author Row */}
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
            {getRelativeTime(submission.createdAt)}
            {submission.category ? `  ·  ${submission.category}` : ''}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: config.badgeBg,
              borderColor: config.badgeBorder,
            },
          ]}
        >
          <MIcon name={config.icon} size={11} color={config.iconColor} />
          <Text style={[styles.statusBadgeText, { color: config.badgeColor }]}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.subItemTitle}>{submission.title}</Text>

      {/* Description */}
      {submission.description ? (
        <Text style={styles.subItemDescription} numberOfLines={3}>{submission.description}</Text>
      ) : null}

      {/* Attached Images */}
      {imageAttachments.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachedImagesRow}>
          {imageAttachments.map((img, idx) => (
            <Image
              key={img.id || idx}
              source={{ uri: img.uri }}
              style={styles.attachedImageThumb}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Verification Note */}
      {submission.note ? (
        <View style={styles.noteRow}>
          <MaterialIcons name="info-outline" size={13} color="#79747E" />
          <Text style={styles.subItemNote}>{submission.note}</Text>
        </View>
      ) : null}

      {/* Admin Action Buttons on Submissions */}
      {isAdmin && (
        <View style={styles.adminActionRow}>
          {submission.status !== 'APPROVED' && (
            <TouchableOpacity
              onPress={() => onUpdateStatus('APPROVED')}
              style={styles.adminApproveBtn}
            >
              <MaterialIcons name="check" size={14} color="#FFFFFF" />
              <Text style={styles.adminApproveBtnText}>Approve & Publish</Text>
            </TouchableOpacity>
          )}

          {submission.status !== 'REVISE' && (
            <TouchableOpacity
              onPress={() => onUpdateStatus('REVISE')}
              style={styles.adminReviseBtn}
            >
              <MaterialIcons name="edit" size={14} color="#B3261E" />
              <Text style={styles.adminReviseBtnText}>Request Revise</Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 20,
  },
  avatarTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#6750A4',
  },
  adminCrownBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B3261E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraEditOverlayBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#21005D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D1B20',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#79747E',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileBio: {
    fontSize: 13,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  accountButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#21005D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signInBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#F9DEDC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B3261E',
  },
  adminHubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2B8B5',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  adminTopAccent: {
    height: 4,
    backgroundColor: '#B3261E',
  },
  adminHubInner: {
    padding: 16,
    gap: 8,
  },
  adminHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminHubTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminHubHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B3261E',
  },
  adminHubSubtext: {
    fontSize: 12,
    color: '#49454F',
    lineHeight: 17,
  },
  adminToolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  adminToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#B3261E',
    paddingVertical: 8,
    borderRadius: 10,
  },
  adminToolBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adminSponsoredBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EADDFF',
    paddingVertical: 8,
    borderRadius: 10,
  },
  adminSponsoredBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#21005D',
  },
  premiumBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1E5',
    overflow: 'hidden',
    marginBottom: 24,
  },
  topAccentBar: {
    height: 4,
    backgroundColor: '#6750A4',
  },
  premiumBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  supportHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1B20',
    marginBottom: 2,
  },
  supportSubtext: {
    fontSize: 12,
    color: '#49454F',
  },
  goPremiumBtn: {
    backgroundColor: '#21005D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goPremiumBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bentoSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#79747E',
    letterSpacing: 1,
    marginBottom: 4,
  },
  adminQueueSubtitle: {
    fontSize: 11,
    color: '#B3261E',
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1E5',
    overflow: 'hidden',
    marginBottom: 12,
  },
  featuredImageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  opEdBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#21005D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  opEdBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredDetails: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 22,
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#79747E',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
    color: '#49454F',
    fontWeight: '500',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1E5',
    overflow: 'hidden',
    minHeight: 120,
  },
  subCardInner: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 18,
    marginTop: 6,
  },
  opinionSubCardRow: {
    flexDirection: 'row',
    flex: 1,
  },
  subCardAccentLine: {
    width: 4,
    backgroundColor: '#6750A4',
  },
  submissionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E1E5',
    marginBottom: 24,
  },
  submissionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newReportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6750A4',
  },
  emptySubmissionsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptySubmissionsText: {
    fontSize: 12,
    color: '#79747E',
    textAlign: 'center',
  },
  subItemCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
    gap: 8,
  },
  subItemAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subItemAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#6750A4',
  },
  subItemAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1B20',
  },
  subItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  subItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  subItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1B20',
    lineHeight: 20,
  },
  subItemDescription: {
    fontSize: 12,
    color: '#49454F',
    lineHeight: 17,
  },
  subItemTime: {
    fontSize: 11,
    color: '#79747E',
    marginTop: 1,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  subItemNote: {
    fontSize: 11,
    color: '#B3261E',
    fontStyle: 'italic',
    flex: 1,
  },
  subItemAttachments: {
    fontSize: 11,
    color: '#6750A4',
    fontWeight: '500',
  },
  attachedImagesRow: {
    marginTop: 4,
  },
  attachedImageThumb: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
  },
  audioPlaybackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3EDF7',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    marginTop: 4,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#21005D',
  },
  audioSublabel: {
    fontSize: 10,
    color: '#79747E',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  adminApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#21005D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminApproveBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminReviseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9DEDC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminReviseBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B3261E',
  },
});
