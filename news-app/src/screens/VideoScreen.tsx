import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { VideoReport } from '../types';
import { Colors } from '../theme/colors';
import { getYouTubeThumbnail, getYouTubeVideoId } from '../utils/mediaUtils';

export const VideoScreen: React.FC = () => {
  const {
    liveVideos,
    openVideo,
    isRefreshing,
    refreshData,
    userProfile,
    createLiveStreamVideo,
    deleteLiveStreamVideo,
    showToast,
  } = useNews();

  const isAdmin = userProfile.role === 'ADMIN';

  // Admin Launch Stream Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [reporterName, setReporterName] = useState(userProfile.name || 'Ground News Correspondent');
  const [location, setLocation] = useState('Ground Broadcast Bureau');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewThumbnail = getYouTubeThumbnail(streamUrl);

  const handleLaunchStream = async () => {
    if (!streamTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a broadcast title.');
      return;
    }
    if (!streamUrl.trim()) {
      Alert.alert('Required Field', 'Please enter a YouTube or live video URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLiveStreamVideo({
        title: streamTitle.trim(),
        videoUrl: streamUrl.trim(),
        videoThumbnailUrl: previewThumbnail || streamUrl.trim(),
        isLive,
        reporterName: reporterName.trim() || 'Chief Correspondent',
        location: location.trim() || 'Central Bureau',
        description: description.trim(),
      });

      setShowCreateModal(false);
      setStreamTitle('');
      setStreamUrl('');
      setDescription('');
      showToast('Live stream broadcast launched successfully!');
    } catch (err: any) {
      Alert.alert('Broadcast Error', err?.message || 'Failed to deploy live stream');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStream = (videoId: string, title: string) => {
    Alert.alert(
      'Remove Live Stream',
      `Are you sure you want to take down "${title}" from the public airwaves?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiveStreamVideo(videoId);
              showToast('Stream removed from public broadcast.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete stream');
            }
          },
        },
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground Video Dispatches</Text>
          <Text style={styles.headerSubtitle}>
            Raw, verified eyewitness camera feeds and replays
          </Text>
        </View>

        {/* Admin Broadcast Command Desk */}
        {isAdmin && (
          <View style={styles.adminBanner}>
            <View style={styles.adminBannerLeft}>
              <View style={styles.antennaIconBox}>
                <MaterialIcons name="settings-input-antenna" size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Broadcast Command Desk</Text>
                <Text style={styles.adminBannerSub}>
                  Deploy continuous 24/7 YouTube live streams & eyewitness video feeds
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowCreateModal(true)}
              style={styles.adminLaunchBtn}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.adminLaunchBtnText}>Launch Live</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video Feed Cards */}
        {liveVideos.map((video) => (
          <VideoFeedCard
            key={video.id}
            video={video}
            isAdmin={isAdmin}
            onClick={() => openVideo(video)}
            onDelete={() => handleDeleteStream(video.id, video.title)}
          />
        ))}
      </ScrollView>

      {/* Admin Launch Live Stream Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="live-tv" size={24} color="#DC2626" />
                <Text style={styles.modalTitle}>Deploy YouTube Live Feed</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Stream Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Stream Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Al Jazeera English Live 24/7"
                  placeholderTextColor="#9CA3AF"
                  value={streamTitle}
                  onChangeText={setStreamTitle}
                />
              </View>

              {/* YouTube / Video URL */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>YouTube Live URL / Stream Link *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  placeholderTextColor="#9CA3AF"
                  value={streamUrl}
                  onChangeText={setStreamUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                {previewThumbnail ? (
                  <View style={styles.previewThumbBox}>
                    <Image source={{ uri: previewThumbnail }} style={styles.previewThumbImage} />
                    <View style={styles.previewThumbTextRow}>
                      <MaterialIcons name="check-circle" size={16} color="#059669" />
                      <Text style={styles.previewThumbText}>Valid YouTube live stream detected</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ground Location / Bureau</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Doha Desk / New Delhi Bureau"
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {/* Correspondent Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Eyewitness Correspondent</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Chief International Desk"
                  placeholderTextColor="#9CA3AF"
                  value={reporterName}
                  onChangeText={setReporterName}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Context & Description</Text>
                <TextInput
                  style={[styles.formInput, { height: 72, textAlignVertical: 'top' }]}
                  placeholder="Brief summary of the live event..."
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              {/* Is Live Switch */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchTitle}>Broadcast Status</Text>
                  <Text style={styles.switchSubtitle}>
                    {isLive ? 'Mark as LIVE STREAM' : 'Mark as VERIFIED REPLAY'}
                  </Text>
                </View>
                <Switch
                  value={isLive}
                  onValueChange={setIsLive}
                  trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                  thumbColor={isLive ? '#DC2626' : '#9CA3AF'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLaunchStream}
                  style={styles.deployBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="settings-remote" size={18} color="#FFFFFF" />
                      <Text style={styles.deployBtnText}>Launch Live</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const VideoFeedCard: React.FC<{
  video: VideoReport;
  isAdmin: boolean;
  onClick: () => void;
  onDelete: () => void;
}> = ({ video, isAdmin, onClick, onDelete }) => {
  const { toggleVideoLike, likedVideoIds } = useNews();
  const isLiked = likedVideoIds.has(video.id);
  const [likesCount, setLikesCount] = useState(video.likesCount ?? 0);

  React.useEffect(() => {
    if (video.likesCount !== undefined) {
      setLikesCount(video.likesCount);
    }
  }, [video.likesCount]);

  const handleLike = async () => {
    const newCount = await toggleVideoLike(video.id);
    if (newCount !== undefined) {
      setLikesCount(newCount);
    }
  };

  const streamUrl = video.videoUrl || video.videoThumbnailUrl;
  const isYouTube = Boolean(getYouTubeVideoId(streamUrl));
  const thumbUrl = getYouTubeThumbnail(streamUrl) || video.videoThumbnailUrl;

  return (
    <View style={styles.card}>
      {/* Video Frame */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onClick}
        style={styles.videoFrame}
      >
        <Image
          source={{ uri: thumbUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />

        {/* Dark overlay */}
        <View style={styles.videoOverlay} />

        {/* Top-Left Badge (Live or Replay) */}
        <View
          style={[
            styles.badgeLeft,
            { backgroundColor: video.isLive ? '#DC2626' : '#1E3A8A' },
          ]}
        >
          {video.isLive ? (
            <View style={styles.whiteDot} />
          ) : (
            <MaterialIcons name="replay" size={12} color="#FFFFFF" />
          )}
          <Text style={styles.badgeLeftText}>
            {video.isLive ? 'LIVE STREAM' : 'VERIFIED REPLAY'}
          </Text>
        </View>

        {/* Location Badge Top-Right */}
        <View style={styles.locationBadge}>
          <MaterialIcons name="location-on" size={12} color="#FFFFFF" />
          <Text style={styles.locationText}>{video.location}</Text>
        </View>

        {/* Center Play Indicator */}
        <View style={styles.centerPlayCircle}>
          <MaterialIcons
            name={isYouTube ? 'play-arrow' : 'smart-display'}
            size={32}
            color="#FFFFFF"
          />
        </View>

        {/* Bottom stats overlay */}
        <View style={styles.videoBottomStats}>
          <Text style={styles.viewersText}>{video.viewersCount}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isYouTube && (
              <View style={styles.ytBadge}>
                <Text style={styles.ytBadgeText}>YouTube</Text>
              </View>
            )}
            <MaterialIcons name="volume-up" size={18} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Metadata & Description */}
      <View style={styles.cardDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteStreamBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {video.description ? (
          <Text style={styles.videoDescription} numberOfLines={2}>
            {video.description}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={styles.reporterText}>Reported by {video.reporterName}</Text>

          <View style={styles.actionsRow}>
            {/* Upvote Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLike}
              style={[
                styles.likePill,
                {
                  backgroundColor: isLiked ? '#E0E7FF' : '#F9FAFB',
                  borderColor: isLiked ? '#818CF8' : '#E5E7EB',
                },
              ]}
            >
              <MaterialIcons
                name={isLiked ? 'thumb-up' : 'thumb-up-off-alt'}
                size={15}
                color={isLiked ? '#4338CA' : '#4B5563'}
              />
              <Text
                style={[
                  styles.likeCountText,
                  { color: isLiked ? '#4338CA' : '#4B5563' },
                ]}
              >
                {likesCount}
              </Text>
            </TouchableOpacity>

            {/* Play Trigger Button */}
            <TouchableOpacity activeOpacity={0.7} onPress={onClick} style={styles.playNowBtn}>
              <MaterialIcons name="play-arrow" size={18} color="#21005D" />
              <Text style={styles.playNowBtnText}>Watch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#21005D',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#49454F',
  },
  adminBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  antennaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  adminBannerSub: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 16,
  },
  adminLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
  },
  adminLaunchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  videoFrame: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  badgeLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  badgeLeftText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  locationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  centerPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  videoBottomStats: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewersText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ytBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ytBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDetails: {
    padding: 16,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 22,
    flex: 1,
  },
  deleteStreamBtn: {
    padding: 4,
  },
  videoDescription: {
    fontSize: 13,
    color: '#49454F',
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4EFF4',
    paddingTop: 10,
  },
  reporterText: {
    fontSize: 12,
    color: '#79747E',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  likeCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  playNowBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#21005D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  previewThumbBox: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  previewThumbImage: {
    width: '100%',
    height: 120,
  },
  previewThumbTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  previewThumbText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  deployBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  deployBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
