import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { Article, VideoReport } from '../types';
import { VerifiedGroundBadge } from '../components/VerifiedGroundBadge';
import { SponsoredBanner } from '../components/SponsoredBanner';
import { SubmitNewsFab } from '../components/SubmitNewsFab';
import { Colors } from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const {
    heroArticle,
    liveVideos,
    opinionArticle,
    standardNewsArticles,
    openArticle,
    openVideo,
    selectTab,
    activeCategoryFilter,
    setCategoryFilter,
    isLoading,
    isRefreshing,
    refreshData,
  } = useNews();

  const categories = ['All', 'Urgent', 'Ground Reports', 'Opinion', 'Economics', 'Infrastructure'];

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
        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((category) => {
            const isSelected = activeCategoryFilter === category;
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.7}
                onPress={() => setCategoryFilter(category)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? '#21005D' : '#FFFFFF',
                    borderColor: isSelected ? '#21005D' : '#CAC4D0',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? '#FFFFFF' : '#49454F',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading && !isRefreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6750A4" />
            <Text style={styles.loadingText}>Fetching ground reports...</Text>
          </View>
        )}

        {/* 1. Ground Reports Hero Section */}
        {heroArticle && (
          <View style={styles.section}>
            <HeroArticleCard
              article={heroArticle}
              onReadFullClick={() => openArticle(heroArticle)}
            />
          </View>
        )}

        {/* 2. Live on the Ground Carousel */}
        {liveVideos && liveVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Live on the Ground</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videosRow}
            >
              {liveVideos.map((video) => (
                <LiveVideoItem
                  key={video.id}
                  video={video}
                  onClick={() => openVideo(video)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 3. Sponsored Banner */}
        <SponsoredBanner />

        {/* 4. Opinion Block (with signature left violet accent bar) */}
        {opinionArticle && (
          <OpinionCard
            article={opinionArticle}
            onClick={() => openArticle(opinionArticle)}
          />
        )}

        {/* 5. Standard News Stream */}
        {standardNewsArticles.map((article) => (
          <StandardNewsCard
            key={article.id}
            article={article}
            onClick={() => openArticle(article)}
          />
        ))}
      </ScrollView>

      {/* Prominent Submit News FAB (Bottom Right) */}
      <SubmitNewsFab onPress={() => selectTab('POST')} />
    </View>
  );
};

const HeroArticleCard: React.FC<{
  article: Article;
  onReadFullClick: () => void;
}> = ({ article, onReadFullClick }) => {
  const { bookmarkedArticleIds, toggleBookmark } = useNews();
  const isBookmarked = bookmarkedArticleIds.has(article.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onReadFullClick}
      style={styles.heroCard}
    >
      {/* Image with Verified Ground Badge */}
      <View style={styles.heroImageContainer}>
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: '#EADDFF' }]} />
        )}
        {article.isVerifiedGround && (
          <View style={styles.heroVerifiedBadge}>
            <VerifiedGroundBadge />
          </View>
        )}
      </View>

      {/* Content Box */}
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{article.title}</Text>
        <Text style={styles.heroExcerpt} numberOfLines={2}>
          {article.excerpt}
        </Text>

        <View style={styles.heroFooter}>
          <Text style={styles.heroAuthor}>
            By {article.authorName} • {article.dateOrTimeAgo}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Bookmark / Saved Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleBookmark(article.id)}
              style={[
                styles.bookmarkIconBtn,
                isBookmarked && { backgroundColor: '#EADDFF', borderColor: '#6750A4' },
              ]}
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={18}
                color={isBookmarked ? '#21005D' : '#49454F'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReadFullClick}
              style={styles.readFullBtn}
            >
              <Text style={styles.readFullBtnText}>READ FULL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LiveVideoItem: React.FC<{
  video: VideoReport;
  onClick: () => void;
}> = ({ video, onClick }) => {
  const { likedVideoIds } = useNews();
  const isLiked = likedVideoIds.has(video.id);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onClick}
      style={styles.videoItem}
    >
      <View style={styles.videoThumbContainer}>
        <Image
          source={{ uri: video.videoThumbnailUrl }}
          style={styles.videoThumb}
          resizeMode="cover"
        />

        {/* Live / Replay Tag */}
        <View
          style={[
            styles.liveTag,
            { backgroundColor: video.isLive ? '#B3261E' : '#21005D' },
          ]}
        >
          {video.isLive ? (
            <View style={styles.liveDot} />
          ) : (
            <MaterialIcons name="replay" size={12} color="#FFFFFF" />
          )}
          <Text style={styles.liveTagText}>
            {video.isLive ? 'LIVE' : 'REPLAY'}
          </Text>
        </View>

        {/* Liked Indicator Badge Top-Right */}
        {isLiked && (
          <View style={styles.likedTagBadge}>
            <MaterialIcons name="thumb-up" size={11} color="#FFFFFF" />
            <Text style={styles.likedTagText}>LIKED</Text>
          </View>
        )}

        {/* Play Icon at Bottom Left */}
        <MaterialIcons
          name="play-circle-filled"
          size={32}
          color="#FFFFFF"
          style={styles.playIcon}
        />
      </View>

      <Text style={styles.videoTitle} numberOfLines={2}>
        {video.title}
      </Text>
    </TouchableOpacity>
  );
};

const OpinionCard: React.FC<{
  article: Article;
  onClick: () => void;
}> = ({ article, onClick }) => {
  const { bookmarkedArticleIds, toggleBookmark } = useNews();
  const isBookmarked = bookmarkedArticleIds.has(article.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onClick}
      style={styles.opinionCard}
    >
      {/* 5dp Opinion Violet Border */}
      <View style={styles.opinionAccentBar} />

      <View style={styles.opinionContent}>
        <View style={styles.opinionTopRow}>
          <View style={styles.opinionPill}>
            <Text style={styles.opinionPillText}>OPINION</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {article.readTime && <Text style={styles.readTimeText}>{article.readTime}</Text>}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleBookmark(article.id)}
              style={[
                styles.cardBookmarkBtn,
                isBookmarked && { backgroundColor: '#EADDFF' },
              ]}
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={16}
                color={isBookmarked ? '#21005D' : '#79747E'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.opinionTitle}>{article.title}</Text>
        <Text style={styles.opinionExcerpt} numberOfLines={2}>
          {article.excerpt}
        </Text>

        <View style={styles.opinionAuthorRow}>
          <Image
            source={{ uri: article.authorAvatarUrl }}
            style={styles.opinionAvatar}
          />
          <View>
            <Text style={styles.opinionAuthorName}>{article.authorName}</Text>
            <Text style={styles.opinionAuthorTitle}>{article.authorTitle}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const StandardNewsCard: React.FC<{
  article: Article;
  onClick: () => void;
}> = ({ article, onClick }) => {
  const { bookmarkedArticleIds, toggleBookmark } = useNews();
  const isBookmarked = bookmarkedArticleIds.has(article.id);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onClick}
      style={styles.standardCard}
    >
      <View style={styles.standardContent}>
        <View style={styles.standardMetaRow}>
          <Text style={styles.standardMeta}>{article.dateOrTimeAgo}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleBookmark(article.id)}
            style={[
              styles.cardBookmarkBtn,
              isBookmarked && { backgroundColor: '#EADDFF' },
            ]}
          >
            <MaterialIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={16}
              color={isBookmarked ? '#21005D' : '#79747E'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.standardTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.standardExcerpt} numberOfLines={2}>
          {article.excerpt}
        </Text>
        <Text style={styles.standardReadTime}>{article.readTime || '3 min read'}</Text>
      </View>

      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.standardImage}
          resizeMode="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FD',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6750A4',
    fontWeight: '500',
  },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1B20',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  heroCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E1E5',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroVerifiedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  heroContent: {
    padding: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1B20',
    lineHeight: 24,
    marginBottom: 8,
  },
  heroExcerpt: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
    marginBottom: 14,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4EFF4',
    paddingTop: 12,
  },
  heroAuthor: {
    fontSize: 12,
    color: '#79747E',
    flex: 1,
  },
  readFullBtn: {
    backgroundColor: '#21005D',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  readFullBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  videosRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  videoItem: {
    width: 220,
  },
  videoThumbContainer: {
    width: 220,
    height: 125,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1D1B20',
    marginBottom: 8,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  liveTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playIcon: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1B20',
    lineHeight: 18,
  },
  opinionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E1E5',
  },
  opinionAccentBar: {
    width: 5,
    backgroundColor: '#6750A4',
  },
  opinionContent: {
    flex: 1,
    padding: 16,
  },
  opinionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  opinionPill: {
    backgroundColor: '#EADDFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  opinionPillText: {
    color: '#21005D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  readTimeText: {
    fontSize: 12,
    color: '#79747E',
  },
  opinionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 22,
    marginBottom: 6,
  },
  opinionExcerpt: {
    fontSize: 13,
    color: '#49454F',
    lineHeight: 18,
    marginBottom: 12,
  },
  opinionAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  opinionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  opinionAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1B20',
  },
  opinionAuthorTitle: {
    fontSize: 11,
    color: '#79747E',
  },
  standardCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E6E1E5',
    gap: 12,
  },
  standardContent: {
    flex: 1,
  },
  standardMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6750A4',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  standardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 19,
    marginBottom: 4,
  },
  standardExcerpt: {
    fontSize: 12,
    color: '#49454F',
    lineHeight: 16,
    marginBottom: 6,
  },
  standardReadTime: {
    fontSize: 11,
    color: '#79747E',
  },
  standardImage: {
    width: 84,
    height: 84,
    borderRadius: 8,
  },
  bookmarkIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBookmarkBtn: {
    padding: 4,
    borderRadius: 12,
  },
  standardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  likedTagBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6750A4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
