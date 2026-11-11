import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
  Share,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { getYouTubeVideoId, getYouTubeThumbnail } from '../utils/mediaUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LiveStreamPlayerModal: React.FC = () => {
  const { selectedVideo, closeVideo, likedVideoIds, toggleVideoLike, showToast } = useNews();
  const [likesCount, setLikesCount] = useState<number>(selectedVideo?.likesCount ?? 0);

  React.useEffect(() => {
    if (selectedVideo?.likesCount !== undefined) {
      setLikesCount(selectedVideo.likesCount);
    }
  }, [selectedVideo?.likesCount]);

  if (!selectedVideo) return null;

  const isLiked = likedVideoIds.has(selectedVideo.id);
  const streamUrl = selectedVideo.videoUrl || selectedVideo.videoThumbnailUrl;
  const ytId = getYouTubeVideoId(streamUrl);
  const displayThumb = ytId ? getYouTubeThumbnail(streamUrl) || selectedVideo.videoThumbnailUrl : selectedVideo.videoThumbnailUrl;

  const handleOpenYouTube = async () => {
    const targetUrl = ytId
      ? `https://www.youtube.com/watch?v=${ytId}`
      : streamUrl;
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch {
      showToast('Could not launch external stream URL');
    }
  };

  const handleLike = async () => {
    const count = await toggleVideoLike(selectedVideo.id);
    if (count !== undefined) {
      setLikesCount(count);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: selectedVideo.title,
        message: `${selectedVideo.title}\n\nWatch live broadcast on SusaLabs Truth Network: ${streamUrl}`,
      });
    } catch {
      // Ignored
    }
  };

  return (
    <Modal
      visible={Boolean(selectedVideo)}
      transparent={true}
      animationType="slide"
      onRequestClose={closeVideo}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Bar Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.liveIndicatorPill,
                  { backgroundColor: selectedVideo.isLive ? '#DC2626' : '#1E3A8A' },
                ]}
              >
                {selectedVideo.isLive ? <View style={styles.whitePulseDot} /> : null}
                <Text style={styles.liveIndicatorText}>
                  {selectedVideo.isLive ? 'LIVE BROADCAST' : 'VERIFIED REPLAY'}
                </Text>
              </View>
              <Text style={styles.viewersCountText}>{selectedVideo.viewersCount}</Text>
            </View>

            <TouchableOpacity
              onPress={closeVideo}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#1D1B20" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Video Player Display Frame */}
            <View style={styles.playerFrame}>
              {displayThumb ? (
                <Image
                  source={{ uri: displayThumb }}
                  style={styles.playerThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.playerThumbnail, { backgroundColor: '#000000' }]} />
              )}
              <View style={styles.darkGradient} />

              {/* Big Centered Play Trigger */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenYouTube}
                style={styles.centerPlayBtn}
              >
                <MaterialIcons name="play-arrow" size={38} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.bottomOverlayRow}>
                <View style={styles.locationTag}>
                  <MaterialIcons name="location-on" size={14} color="#FFFFFF" />
                  <Text style={styles.locationTagText}>{selectedVideo.location}</Text>
                </View>
                <Text style={styles.sourceTag}>SusaLabs Eyewitness Stream</Text>
              </View>
            </View>

            {/* Launch / Watch YouTube Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenYouTube}
              style={styles.ytActionBtn}
            >
              <MaterialIcons name="smart-display" size={22} color="#FFFFFF" />
              <Text style={styles.ytActionBtnText}>
                {ytId ? 'Watch Live on YouTube' : 'Play Live Stream'}
              </Text>
              <MaterialIcons name="open-in-new" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Metadata & Description */}
            <View style={styles.detailsBlock}>
              <Text style={styles.videoTitle}>{selectedVideo.title}</Text>

              <View style={styles.reporterRow}>
                <MaterialIcons name="verified-user" size={16} color="#059669" />
                <Text style={styles.reporterText}>
                  Ground Correspondent: {selectedVideo.reporterName}
                </Text>
              </View>

              {selectedVideo.description ? (
                <Text style={styles.descriptionText}>{selectedVideo.description}</Text>
              ) : null}

              {/* Actions Bar: Like + Share */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleLike}
                  style={[
                    styles.likeButton,
                    isLiked && { backgroundColor: '#E0E7FF', borderColor: '#6366F1' },
                  ]}
                >
                  <MaterialIcons
                    name={isLiked ? 'thumb-up' : 'thumb-up-off-alt'}
                    size={18}
                    color={isLiked ? '#4338CA' : '#4B5563'}
                  />
                  <Text
                    style={[
                      styles.likeButtonText,
                      isLiked && { color: '#4338CA', fontWeight: '700' },
                    ]}
                  >
                    {likesCount} {likesCount === 1 ? 'Endorsement' : 'Endorsements'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShare}
                  style={styles.shareButton}
                >
                  <MaterialIcons name="share" size={18} color="#374151" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  whitePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  viewersCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  playerFrame: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  playerThumbnail: {
    width: '100%',
    height: '100%',
  },
  darkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  centerPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomOverlayRow: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sourceTag: {
    fontSize: 10,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  ytActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  ytActionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsBlock: {
    gap: 12,
    paddingTop: 4,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reporterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    justifyContent: 'center',
  },
  likeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});

