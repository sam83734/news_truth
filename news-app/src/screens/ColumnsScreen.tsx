import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { Article } from '../types';
import { Colors } from '../theme/colors';

export const ColumnsScreen: React.FC = () => {
  const {
    premiumColumnArticle,
    moreAuthorArticles,
    bookmarkedArticleIds,
    toggleBookmark,
    isUserPremium,
    setShowPremiumDialog,
    openArticle,
    isRefreshing,
    refreshData,
    isLoading,
  } = useNews();

  const isBookmarked = premiumColumnArticle ? bookmarkedArticleIds.has(premiumColumnArticle.id) : false;

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
        {isLoading && !isRefreshing && !premiumColumnArticle && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#6750A4" />
          </View>
        )}

        {/* 1. Premium Column Main Article */}
        {premiumColumnArticle && (
          <View style={styles.mainColumnCard}>
            {/* Top Violet Highlight Bar */}
            <View style={styles.topGradientBar} />

            <View style={styles.cardInnerRow}>
              {/* Left Action Violet Line */}
              <View style={styles.leftAccentBar} />

              <View style={styles.columnCardContent}>
                {/* Tags Row */}
                <View style={styles.tagsRow}>
                  <View style={styles.premiumTag}>
                    <Text style={styles.premiumTagText}>PREMIUM COLUMN</Text>
                  </View>

                  <View style={styles.statusPill}>
                    <MaterialIcons name="lock" size={13} color="#6750A4" />
                    <Text style={styles.statusPillText}>
                      {isUserPremium ? 'UNLOCKED' : 'Subscriber Only'}
                    </Text>
                  </View>
                </View>

                {/* Column Headline */}
                <Text style={styles.headline}>{premiumColumnArticle.title}</Text>

                {/* Author Info */}
                <View style={styles.authorRow}>
                  <View style={styles.authorLeft}>
                    {premiumColumnArticle.authorAvatarUrl ? (
                      <Image
                        source={{ uri: premiumColumnArticle.authorAvatarUrl }}
                        style={styles.authorAvatar}
                      />
                    ) : null}
                    <View>
                      <Text style={styles.authorName}>
                        {premiumColumnArticle.authorName}
                      </Text>
                      <Text style={styles.authorTitle}>
                        {premiumColumnArticle.authorTitle}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleBookmark(premiumColumnArticle.id)}
                    style={styles.bookmarkBtn}
                  >
                    <MaterialIcons
                      name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                      size={22}
                      color={isBookmarked ? '#6750A4' : '#79747E'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Teaser */}
                <View style={styles.articleBodyBox}>
                  <Text style={styles.bodyText}>
                    {premiumColumnArticle.excerpt}
                  </Text>

                  {isUserPremium ? (
                    <Text style={styles.bodyText}>
                      {premiumColumnArticle.fullContent}
                    </Text>
                  ) : (
                    <Text style={styles.bodyText}>
                      {premiumColumnArticle.fullContent.substring(0, 220)}...
                    </Text>
                  )}

                  {/* Fade-out overlay if not premium */}
                  {!isUserPremium && <View style={styles.fadeOverlay} />}
                </View>

                {/* Paywall Box (Visible when not subscribed) */}
                {!isUserPremium && (
                  <View style={styles.paywallBox}>
                    <Text style={styles.paywallHeading}>Continue Reading</Text>
                    <Text style={styles.paywallSubtext}>
                      This column is exclusively for Premium members. Subscribe today for unfettered access to ground-level truths and expert analysis.
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setShowPremiumDialog(true)}
                      style={styles.subscribeBtn}
                    >
                      <MaterialIcons name="payment" size={18} color="#FFFFFF" />
                      <Text style={styles.subscribeBtnText}>Subscribe with PayPal</Text>
                    </TouchableOpacity>

                    <Text style={styles.cancelNote}>Cancel anytime. $4.99/month.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 2. More from Sarah Jenkins */}
        {moreAuthorArticles && moreAuthorArticles.length > 0 && (
          <View style={styles.moreSection}>
            <Text style={styles.sectionHeading}>More Columns & Investigations</Text>

            {moreAuthorArticles.map((article, index) => (
              <MoreAuthorArticleCard
                key={article.id}
                article={article}
                isLast={index === moreAuthorArticles.length - 1}
                onClick={() => openArticle(article)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const MoreAuthorArticleCard: React.FC<{
  article: Article;
  isLast: boolean;
  onClick: () => void;
}> = ({ article, isLast, onClick }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onClick}
      style={[styles.moreCard, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={styles.moreCardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{article.category}</Text>
        </View>
        <Text style={styles.moreDateText}>{article.dateOrTimeAgo}</Text>
      </View>

      <Text style={styles.moreTitle}>{article.title}</Text>
      <Text style={styles.moreExcerpt} numberOfLines={2}>
        {article.excerpt}
      </Text>

      <View style={styles.moreFooter}>
        <Text style={styles.moreReadTime}>{article.readTime || '4 min read'}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#6750A4" />
      </View>
    </TouchableOpacity>
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
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainColumnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1E5',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  topGradientBar: {
    height: 4,
    backgroundColor: '#6750A4',
  },
  cardInnerRow: {
    flexDirection: 'row',
  },
  leftAccentBar: {
    width: 6,
    backgroundColor: '#21005D',
  },
  columnCardContent: {
    flex: 1,
    padding: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  premiumTag: {
    backgroundColor: '#21005D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  premiumTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4EFF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 11,
    color: '#6750A4',
    fontWeight: '600',
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1B20',
    lineHeight: 26,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1B20',
  },
  authorTitle: {
    fontSize: 11,
    color: '#79747E',
  },
  bookmarkBtn: {
    padding: 4,
  },
  articleBodyBox: {
    position: 'relative',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    color: '#313033',
    lineHeight: 22,
    marginBottom: 12,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  paywallBox: {
    backgroundColor: '#F7F2FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDFF',
  },
  paywallHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#21005D',
    marginBottom: 6,
  },
  paywallSubtext: {
    fontSize: 12,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#003087',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelNote: {
    fontSize: 11,
    color: '#79747E',
  },
  moreSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E1E5',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1B20',
    marginBottom: 12,
  },
  moreCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
  },
  moreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#EADDFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#21005D',
    fontSize: 10,
    fontWeight: '700',
  },
  moreDateText: {
    fontSize: 11,
    color: '#79747E',
  },
  moreTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 20,
    marginBottom: 4,
  },
  moreExcerpt: {
    fontSize: 12,
    color: '#49454F',
    lineHeight: 17,
    marginBottom: 8,
  },
  moreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moreReadTime: {
    fontSize: 11,
    color: '#6750A4',
    fontWeight: '600',
  },
});
