import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { VideoReport } from '../types';
import { Colors } from '../theme/colors';

export const VideoScreen: React.FC = () => {
  const { liveVideos, openVideo, isRefreshing, refreshData } = useNews();

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

        {/* Video Feed Cards */}
        {liveVideos.map((video) => (
          <VideoFeedCard
            key={video.id}
            video={video}
            onClick={() => openVideo(video)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const VideoFeedCard: React.FC<{
  video: VideoReport;
  onClick: () => void;
}> = ({ video, onClick }) => {
  const { toggleVideoLike, likedVideoIds } = useNews();
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <View style={styles.card}>
      {/* Video Frame */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsPlaying(!isPlaying)}
        style={styles.videoFrame}
      >
        <Image
          source={{ uri: video.videoThumbnailUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />

        {/* Dark overlay */}
        <View style={styles.videoOverlay} />

        {/* Top-Left Badge (Live or Replay) */}
        <View
          style={[
            styles.badgeLeft,
            { backgroundColor: video.isLive ? '#B3261E' : '#21005D' },
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

        {/* Center Play / Pause Indicator */}
        <View style={styles.centerPlayCircle}>
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={32}
            color="#FFFFFF"
          />
        </View>

        {/* Bottom stats overlay */}
        <View style={styles.videoBottomStats}>
          <Text style={styles.viewersText}>{video.viewersCount}</Text>
          <MaterialIcons name="volume-up" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Metadata & Description */}
      <View style={styles.cardDetails}>
        <Text style={styles.videoTitle}>{video.title}</Text>

        {video.description ? (
          <Text style={styles.videoDescription}>{video.description}</Text>
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
                  backgroundColor: isLiked ? '#EADDFF' : '#FEF7FF',
                  borderColor: isLiked ? '#D0BCFF' : '#E7E0EC',
                },
              ]}
            >
              <MaterialIcons
                name={isLiked ? 'thumb-up' : 'thumb-up-off-alt'}
                size={15}
                color={isLiked ? '#21005D' : '#49454F'}
              />
              <Text
                style={[
                  styles.likeCountText,
                  { color: isLiked ? '#21005D' : '#49454F' },
                ]}
              >
                {likesCount}
              </Text>
            </TouchableOpacity>

            {/* Comment Button */}
            <TouchableOpacity activeOpacity={0.7} onPress={onClick} style={styles.commentBtn}>
              <MaterialIcons name="chat-bubble-outline" size={18} color="#79747E" />
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
    backgroundColor: 'rgba(33, 0, 93, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
  cardDetails: {
    padding: 16,
    gap: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 22,
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
  commentBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
