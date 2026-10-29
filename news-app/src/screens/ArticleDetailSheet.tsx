import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Article } from '../types';
import { VerifiedGroundBadge } from '../components/VerifiedGroundBadge';
import { Colors } from '../theme/colors';

interface ArticleDetailSheetProps {
  article: Article | null;
  isBookmarked: boolean;
  isPremiumUser: boolean;
  onDismiss: () => void;
  onToggleBookmark: () => void;
  onGoPremium: () => void;
}

export const ArticleDetailSheet: React.FC<ArticleDetailSheetProps> = ({
  article,
  isBookmarked,
  isPremiumUser,
  onDismiss,
  onToggleBookmark,
  onGoPremium,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  // Cleanup audio player on unmount or article change
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.remove(); } catch (_) {}
        playerRef.current = null;
      }
      setIsAudioPlaying(false);
    };
  }, [article?.id]);

  const handleToggleVoice = () => {
    const voiceUri = (article as any)?.voiceNoteUri;
    if (!voiceUri) return;
    try {
      const { createAudioPlayer } = require('expo-audio');
      if (!playerRef.current) {
        playerRef.current = createAudioPlayer(voiceUri);
        playerRef.current.play();
        setIsAudioPlaying(true);
      } else {
        if (isAudioPlaying) {
          playerRef.current.pause();
          setIsAudioPlaying(false);
        } else {
          playerRef.current.play();
          setIsAudioPlaying(true);
        }
      }
    } catch (e) {
      console.warn('Article audio error:', e);
    }
  };

  if (!article) return null;

  return (
    <Modal
      visible={!!article}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header Drag handle */}
          <TouchableOpacity activeOpacity={0.8} onPress={onDismiss} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Toolbar in Sheet */}
            <View style={styles.topToolbar}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: article.isUrgent ? '#F9DEDC' : '#EADDFF',
                    borderColor: article.isUrgent ? 'rgba(179,38,30,0.3)' : '#D0BCFF',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: article.isUrgent ? '#B3261E' : '#21005D' },
                  ]}
                >
                  {article.category.toUpperCase()}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={onToggleBookmark} style={styles.iconBtn}>
                  <MaterialIcons
                    name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                    size={22}
                    color={isBookmarked ? '#6750A4' : '#79747E'}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn}>
                  <MaterialIcons name="share" size={20} color="#79747E" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onDismiss} style={styles.iconBtn}>
                  <MaterialIcons name="close" size={22} color="#49454F" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.articleTitle}>{article.title}</Text>

            {/* Author Byline */}
            <View style={styles.authorByline}>
              {article.authorAvatarUrl ? (
                <Image
                  source={{ uri: article.authorAvatarUrl }}
                  style={styles.authorAvatar}
                />
              ) : null}

              <View>
                <Text style={styles.authorName}>{article.authorName}</Text>
                <Text style={styles.authorMeta}>
                  {article.authorTitle} • {article.dateOrTimeAgo} • {article.readTime}
                </Text>
              </View>
            </View>

            {/* Voice Note Player — only shown when article has a real voice recording */}
            {(article as any).voiceNoteUri ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleToggleVoice}
                style={styles.audioPlayerCard}
              >
                <View style={styles.audioLeft}>
                  <View style={[styles.audioIconCircle, { backgroundColor: isAudioPlaying ? '#6750A4' : '#21005D' }]}>
                    <MaterialIcons
                      name={isAudioPlaying ? 'pause' : 'play-arrow'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>

                  <View>
                    <Text style={styles.audioHeading}>
                      {isAudioPlaying ? 'Playing Voice Dispatch...' : 'Play Eyewitness Voice Report'}
                    </Text>
                    <Text style={styles.audioSubheading}>
                      Recorded on-ground by {article.authorName}
                    </Text>
                  </View>
                </View>

                <View style={styles.durationBadge}>
                  <MaterialIcons name="graphic-eq" size={14} color={isAudioPlaying ? '#6750A4' : '#79747E'} />
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Cover Image (if available) */}
            {article.imageUrl ? (
              <View style={styles.coverImageContainer}>
                <Image
                  source={{ uri: article.imageUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />

                {article.isVerifiedGround && (
                  <View style={styles.verifiedBadgeContainer}>
                    <VerifiedGroundBadge />
                  </View>
                )}
              </View>
            ) : null}

            {/* Full Article Body */}
            <Text style={styles.bodyText}>
              {article.fullContent || article.excerpt}
            </Text>

            {/* Source Verification Dossier */}
            <View style={styles.auditCard}>
              <View style={styles.auditHeader}>
                <MaterialIcons name="verified-user" size={18} color="#6750A4" />
                <Text style={styles.auditHeaderText}>
                  GROUND VERIFICATION AUDIT
                </Text>
              </View>
              <Text style={styles.auditBody}>
                {`• Category: ${article.category}\n• Author: ${article.authorName} (${article.authorTitle})\n• Published: ${article.dateOrTimeAgo}\n• Verification Status: ${article.isVerifiedGround ? 'Verified Ground Report ✓' : 'Under Editorial Review'}`}
              </Text>
            </View>

            {/* Premium Upsell box if article is premium and user is not subscribed */}
            {article.isPremium && !isPremiumUser && (
              <View style={styles.premiumUpsellCard}>
                <MaterialIcons name="lock" size={24} color="#6750A4" />
                <Text style={styles.upsellTitle}>
                  Subscribe to Next Truth Premium to read full dossiers.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onGoPremium}
                  style={styles.unlockBtn}
                >
                  <Text style={styles.unlockBtnText}>Unlock for $4.99/mo</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FDF8FD',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '92%',
    paddingTop: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CAC4D0',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  articleTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#1C1B1F',
    letterSpacing: -0.2,
  },
  authorByline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  authorMeta: {
    fontSize: 11,
    color: '#79747E',
    marginTop: 1,
  },
  audioPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  audioIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#21005D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  audioSubheading: {
    fontSize: 10,
    color: '#79747E',
    marginTop: 1,
  },
  durationBadge: {
    backgroundColor: '#FEF7FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6750A4',
  },
  coverImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FEF7FF',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1C1B1F',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    padding: 16,
    gap: 8,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  auditHeaderText: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.6,
    color: '#21005D',
  },
  auditBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#49454F',
  },
  premiumUpsellCard: {
    backgroundColor: '#FEF7FF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  upsellTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#21005D',
    textAlign: 'center',
  },
  unlockBtn: {
    backgroundColor: '#21005D',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
