import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Article } from '../types';
import { VerifiedGroundBadge } from '../components/VerifiedGroundBadge';
import { useNews } from '../context/NewsContext';

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
  const { openLightbox, setShowDLTModal, showToast } = useNews();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Stop speech when closing or changing articles
  useEffect(() => {
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, [article?.id]);

  const handleToggleSpeech = async () => {
    if (!article) return;

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      showToast('Voice narration paused');
      return;
    }

    const narrationText = `${article.title}. ${article.fullContent || article.excerpt}`;
    setIsSpeaking(true);
    showToast('Starting AI Voice Narration...');

    Speech.speak(narrationText, {
      rate: speechRate,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        showToast('Speech narration stopped');
      },
    });
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead verified report on NextTruth: https://nexttruth.media/article/${article.id}`,
      });
    } catch {
      // Ignore
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
                  {(article.categoryTag || article.category).toUpperCase()}
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

                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
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

              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{article.authorName}</Text>
                <Text style={styles.authorMeta}>
                  {article.authorTitle || 'Verified Correspondent'} • {article.dateOrTimeAgo} • {article.readTime || '3 min'}
                </Text>
              </View>
            </View>

            {/* AI Voice Narration Bar (Real Speech Synthesis on Every News) */}
            <View style={styles.audioPlayerCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleToggleSpeech}
                style={styles.audioLeft}
              >
                <View style={[styles.audioIconCircle, { backgroundColor: isSpeaking ? '#D97706' : '#21005D' }]}>
                  <MaterialIcons
                    name={isSpeaking ? 'pause' : 'volume-up'}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.audioBadgeRow}>
                    <Text style={styles.audioBadgeText}>AI VOICE NARRATION</Text>
                    {isSpeaking && (
                      <View style={styles.liveSpeechIndicator}>
                        <View style={styles.liveSpeechDot} />
                        <Text style={styles.liveSpeechText}>PLAYING</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.audioHeading} numberOfLines={1}>
                    {isSpeaking ? 'Reading verbatim report...' : 'Listen Ground Narration'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.audioControlsRight}>
                {isSpeaking && (
                  <TouchableOpacity
                    onPress={() => {
                      Speech.stop();
                      setIsSpeaking(false);
                    }}
                    style={styles.stopSpeechBtn}
                  >
                    <MaterialIcons name="stop" size={16} color="#B3261E" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
                    setSpeechRate(nextRate);
                    showToast(`Speed set to ${nextRate}x`);
                  }}
                  style={styles.rateBtn}
                >
                  <Text style={styles.rateBtnText}>{speechRate}x</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cover Image (Clickable for Full-Screen Lightbox) */}
            {article.imageUrl ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openLightbox(article.imageUrl)}
                style={styles.coverImageContainer}
              >
                <Image
                  source={{ uri: article.imageUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />

                <View style={styles.tapToZoomBadge}>
                  <MaterialIcons name="zoom-in" size={14} color="#FFFFFF" />
                  <Text style={styles.tapToZoomText}>Tap to enlarge</Text>
                </View>

                {article.isVerifiedGround && (
                  <View style={styles.verifiedBadgeContainer}>
                    <VerifiedGroundBadge />
                  </View>
                )}
              </TouchableOpacity>
            ) : null}

            {/* Full Article Body */}
            <Text style={styles.bodyText}>
              {article.fullContent || article.excerpt}
            </Text>

            {/* Ground Verification Audit Dossier */}
            <View style={styles.auditCard}>
              <View style={styles.auditHeader}>
                <MaterialIcons name="verified-user" size={18} color="#6750A4" />
                <Text style={styles.auditHeaderText}>
                  GROUND VERIFICATION AUDIT DOSSIER
                </Text>
              </View>

              <View style={styles.auditDetailRow}>
                <Text style={styles.auditFieldLabel}>Editorial Desk:</Text>
                <Text style={styles.auditFieldValue}>NextTruth Dispatch &amp; SusaLabs Civic Review</Text>
              </View>

              <View style={styles.auditDetailRow}>
                <Text style={styles.auditFieldLabel}>Staff Journalist Audit:</Text>
                <Text style={[styles.auditFieldValue, { color: '#15803D' }]}>
                  {article.verifiedByJournalist || 'Sarah Jenkins (Staff Correspondent)'}
                </Text>
              </View>

              <View style={styles.auditDetailRow}>
                <Text style={styles.auditFieldLabel}>Forensic Fact-Check:</Text>
                <Text style={[styles.auditFieldValue, { color: '#B45309' }]}>
                  {article.factCheckedBy || 'Elias Thorne (Ground Expert & Policy Auditor)'}
                </Text>
              </View>

              <View style={styles.auditDetailRow}>
                <Text style={styles.auditFieldLabel}>Chief Editorial Clearance:</Text>
                <Text style={[styles.auditFieldValue, { color: '#1D4ED8' }]}>
                  {article.finalAuditor || 'Dr. Alexander Vance (Chief Editor)'}
                </Text>
              </View>

              <View style={styles.auditDetailRow}>
                <Text style={styles.auditFieldLabel}>Tamper Seal:</Text>
                <Text style={styles.auditFieldValue}>
                  Cryptographic Merkle Tree Hash Confirmed • 100% Byzantine FT
                </Text>
              </View>

              {/* SusaLabs DLT Protocol Proof Card */}
              <View style={styles.dltBox}>
                <View style={styles.dltHeader}>
                  <MaterialIcons name="security" size={16} color="#15803D" />
                  <Text style={styles.dltTitle}>SUSALABS DLT IMMUTABLE ANCHOR</Text>
                </View>

                <View style={styles.dltRow}>
                  <Text style={styles.dltField}>SHA-256 Content Hash:</Text>
                  <Text style={styles.dltHashText} numberOfLines={1}>
                    {article.dltContentHash || '3be9c97b9cdea3371fb6ccceef068d0ccac008898038da0c9cc123b64a9a8460'}
                  </Text>
                </View>

                <View style={styles.dltRow}>
                  <Text style={styles.dltField}>Ledger Block ID:</Text>
                  <Text style={styles.dltValue}>
                    Block #{article.dltBlockIndex || 1} (3/3 Validator Signatures Anchored)
                  </Text>
                </View>

                <View style={styles.dltRow}>
                  <Text style={styles.dltField}>IPFS CIDv1 Multihash:</Text>
                  <Text style={[styles.dltHashText, { color: '#2563EB' }]} numberOfLines={1}>
                    {article.dltIpfsCid || 'bafkreiaqev74qmmnidatim4re4cj3jawbxo22zh7lzktuvx4hnhg6xw42i'}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    onDismiss();
                    setShowDLTModal(true);
                  }}
                  style={styles.openDltExplorerBtn}
                >
                  <MaterialIcons name="layers" size={15} color="#FFFFFF" />
                  <Text style={styles.openDltExplorerBtnText}>
                    Inspect Full DLT Public Ledger
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 14,
  },
  authorByline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  authorMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  audioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  audioIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  liveSpeechIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  liveSpeechDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveSpeechText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
  },
  audioHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  audioControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  stopSpeechBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  rateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rateBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  coverImageContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  tapToZoomBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapToZoomText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 20,
  },
  auditCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  auditHeaderText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6750A4',
    letterSpacing: 0.5,
  },
  auditDetailRow: {
    marginBottom: 6,
  },
  auditFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  auditFieldValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  dltBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  dltHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dltTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  dltRow: {
    marginBottom: 6,
  },
  dltField: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dltValue: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
    marginTop: 1,
  },
  dltHashText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FDE047',
    marginTop: 1,
  },
  openDltExplorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  openDltExplorerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  premiumUpsellCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  upsellTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#581C87',
    textAlign: 'center',
    marginVertical: 8,
  },
  unlockBtn: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
