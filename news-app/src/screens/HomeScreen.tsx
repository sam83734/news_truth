import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { Article, VideoReport } from '../types';
import { VerifiedGroundBadge } from '../components/VerifiedGroundBadge';
import { SponsoredBanner } from '../components/SponsoredBanner';
import { SubmitNewsFab } from '../components/SubmitNewsFab';
import { Colors } from '../theme/colors';
import { newsApi } from '../api/newsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const matchesActiveCategory = (article: Article, filter: string): boolean => {
  if (!filter || filter === 'All') return true;
  const cat = filter.toLowerCase().trim();
  const artCat = (article.category || '').toLowerCase().trim();

  if (cat === 'urgent' || cat.includes('urgent')) {
    return Boolean(article.isUrgent) || artCat.includes('urgent');
  }
  if (cat === 'ground reports' || cat === 'ground' || cat.includes('ground')) {
    return Boolean(article.isVerifiedGround) || artCat.includes('ground') || artCat.includes('investigative');
  }
  if (cat === 'opinion' || cat.includes('opinion')) {
    return Boolean(article.isOpinion) || artCat.includes('opinion') || artCat.includes('editorial');
  }
  if (cat === 'economics' || cat.includes('econom') || cat.includes('business')) {
    return artCat.includes('econom') || artCat.includes('trade') || artCat.includes('business') || artCat.includes('finance');
  }
  if (cat === 'infrastructure' || cat.includes('infrastruct') || cat.includes('urban') || cat.includes('municipal')) {
    return artCat.includes('infrastruct') || artCat.includes('municipal') || artCat.includes('urban');
  }
  return artCat.includes(cat);
};

export const HomeScreen: React.FC = () => {
  const {
    heroArticle,
    liveVideos,
    opinionArticle,
    standardNewsArticles,
    openArticle,
    openVideo,
    openLightbox,
    selectTab,
    activeCategoryFilter,
    setCategoryFilter,
    showServerModal,
    setShowServerModal,
    isLoading,
    isRefreshing,
    refreshData,
  } = useNews();

  const categories = ['All', 'Urgent', 'Ground Reports', 'Opinion', 'Economics', 'Infrastructure'];
  const isFiltered = activeCategoryFilter !== 'All';

  // Multi-candidate Urgent Breaking auto-slider (Slides every 60s if > 1 news)
  const urgentCandidates: Article[] = useMemo(() => {
    const list: Article[] = [];
    if (heroArticle) list.push(heroArticle);
    standardNewsArticles.forEach((a) => {
      if (a.isUrgent || (a.category && a.category.toLowerCase().includes('urgent'))) {
        if (!list.find((item) => item.id === a.id)) {
          list.push(a);
        }
      }
    });
    return list.length > 0 ? list : (heroArticle ? [heroArticle] : []);
  }, [heroArticle, standardNewsArticles]);

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (urgentCandidates.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % urgentCandidates.length);
    }, 60000); // 60 seconds (1 minute auto slide)
    return () => clearInterval(timer);
  }, [urgentCandidates.length]);

  const currentHero = urgentCandidates[activeSlide] || heroArticle;

  // Filtered Articles Stream strictly matching active category
  const filteredArticles = useMemo(() => {
    if (!isFiltered) return [];
    const pool: Article[] = [];
    const seen = new Set<string>();

    // Check standardNewsArticles first (which might be pre-filtered by API)
    standardNewsArticles.forEach((a) => {
      if (a && !seen.has(a.id) && matchesActiveCategory(a, activeCategoryFilter)) {
        seen.add(a.id);
        pool.push(a);
      }
    });

    // Also check hero & opinion in case they match the selected category
    if (heroArticle && !seen.has(heroArticle.id) && matchesActiveCategory(heroArticle, activeCategoryFilter)) {
      seen.add(heroArticle.id);
      pool.push(heroArticle);
    }
    if (opinionArticle && !seen.has(opinionArticle.id) && matchesActiveCategory(opinionArticle, activeCategoryFilter)) {
      seen.add(opinionArticle.id);
      pool.push(opinionArticle);
    }

    return pool;
  }, [isFiltered, activeCategoryFilter, standardNewsArticles, heroArticle, opinionArticle]);

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

        {isLoading && !isRefreshing ? (
          <HomeSkeletonLoader />
        ) : null}

        {/* --- WHEN FILTERED: SHOW ONLY RELEVANT NEWS --- */}
        {isFiltered ? (
          <View style={styles.filteredContainer}>
            {/* Filter Status Badge Bar */}
            <View style={styles.filterStatusRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="filter-list" size={16} color="#6750A4" />
                <Text style={styles.filterStatusText}>
                  {activeCategoryFilter} News ({filteredArticles.length})
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCategoryFilter('All')}
                style={styles.filterResetBtn}
              >
                <MaterialIcons name="close" size={13} color="#6750A4" />
                <Text style={styles.filterResetText}>Reset to All</Text>
              </TouchableOpacity>
            </View>

            {filteredArticles.length === 0 ? (
              <View style={styles.filterEmptyBox}>
                <MaterialIcons name="find-in-page" size={42} color="#CBD5E1" />
                <Text style={styles.filterEmptyTitle}>No {activeCategoryFilter} Dispatches Found</Text>
                <Text style={styles.filterEmptySub}>
                  There are currently no published reports under this topic. Check back soon or dispatch eyewitness evidence.
                </Text>
                <TouchableOpacity
                  onPress={() => setCategoryFilter('All')}
                  style={[styles.retryBtn, { marginTop: 8 }]}
                >
                  <Text style={styles.retryBtnText}>View All News</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Highlight top article of the category if hero card */}
                {filteredArticles[0] && (
                  <View style={styles.section}>
                    <HeroArticleCard
                      article={filteredArticles[0]}
                      onReadFullClick={() => openArticle(filteredArticles[0])}
                      totalSlides={1}
                      currentSlide={0}
                    />
                  </View>
                )}

                {/* If Ground Reports and Live Videos exist, show ground stream */}
                {activeCategoryFilter === 'Ground Reports' && liveVideos && liveVideos.length > 0 && (
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

                {/* Remaining articles in this category */}
                {filteredArticles.slice(1).map((article) => (
                  <StandardNewsCard
                    key={article.id}
                    article={article}
                    onClick={() => openArticle(article)}
                  />
                ))}
              </>
            )}
          </View>
        ) : (
          /* --- DEFAULT HOMEPAGE STREAM (WHEN ALL IS SELECTED) --- */
          <>
            {/* 1. Ground Reports Urgent / Hero Section */}
            {currentHero && (
              <View style={styles.section}>
                <HeroArticleCard
                  article={currentHero}
                  onReadFullClick={() => openArticle(currentHero)}
                  totalSlides={urgentCandidates.length}
                  currentSlide={activeSlide}
                  onPrevSlide={() =>
                    setActiveSlide((prev) => (prev - 1 + urgentCandidates.length) % urgentCandidates.length)
                  }
                  onNextSlide={() =>
                    setActiveSlide((prev) => (prev + 1) % urgentCandidates.length)
                  }
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
          </>
        )}

        {/* Server Connection Error Helper Card */}
        {!isLoading && !currentHero && standardNewsArticles.length === 0 && (
          <View style={styles.emptyConnectionBox}>
            <MaterialIcons name="cloud-off" size={40} color="#94A3B8" />
            <Text style={styles.emptyConnectionTitle}>Cannot reach backend server</Text>
            <Text style={styles.emptyConnectionSub}>
              Target: {newsApi.getHost()}
              {'\n'}Make sure the computer running the backend is on the same Wi-Fi.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => refreshData()}
                style={styles.retryBtn}
              >
                <MaterialIcons name="refresh" size={16} color="#334155" />
                <Text style={styles.retryBtnText}>Retry Ping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowServerModal(true)}
                style={styles.changeIpBtn}
              >
                <MaterialIcons name="settings" size={16} color="#FFFFFF" />
                <Text style={styles.changeIpBtnText}>Configure IP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Prominent Submit News FAB (Bottom Right) */}
      <SubmitNewsFab onPress={() => selectTab('POST')} />
    </View>
  );
};

const HeroArticleCard: React.FC<{
  article: Article;
  onReadFullClick: () => void;
  totalSlides?: number;
  currentSlide?: number;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
}> = ({
  article,
  onReadFullClick,
  totalSlides = 1,
  currentSlide = 0,
  onPrevSlide,
  onNextSlide,
}) => {
  const { bookmarkedArticleIds, toggleBookmark, openLightbox } = useNews();
  const isBookmarked = bookmarkedArticleIds.has(article.id);
  const isUrgent = article.isUrgent || (article.category && article.category.toLowerCase().includes('urgent'));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onReadFullClick}
      style={styles.heroCard}
    >
      {/* Top Slider Header if multiple urgent news */}
      {totalSlides > 1 && (
        <View style={styles.urgentSliderHeader}>
          <View style={styles.urgentSliderBadge}>
            <View style={styles.urgentPulsingDot} />
            <Text style={styles.urgentSliderBadgeText}>
              {isUrgent ? 'URGENT BREAKING' : 'FEATURED LEAD'} • {currentSlide + 1} OF {totalSlides}
            </Text>
          </View>

          <View style={styles.sliderArrowsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPrevSlide}
              style={styles.sliderArrowBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="chevron-left" size={20} color="#21005D" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNextSlide}
              style={styles.sliderArrowBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="chevron-right" size={20} color="#21005D" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Image with Verified Ground Badge - Tap opens in Lightbox */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (article.imageUrl) {
            openLightbox(article.imageUrl);
          }
        }}
        style={styles.heroImageContainer}
      >
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

        {/* Indicator Dots inside image */}
        {totalSlides > 1 && (
          <View style={styles.sliderDotsOverlay}>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.sliderDot,
                  idx === currentSlide && styles.sliderDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>

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
  const { bookmarkedArticleIds, toggleBookmark, openLightbox } = useNews();
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openLightbox(article.imageUrl!)}
        >
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.standardImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
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
  urgentSliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  urgentSliderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  urgentSliderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  sliderArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sliderArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotsOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  sliderDotActive: {
    width: 14,
    backgroundColor: '#F97316',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20,
  },
  skeletonHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E1E5',
  },
  skeletonHeroImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E7E0EC',
  },
  skeletonStandardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E6E1E5',
    gap: 12,
  },
  skeletonLine: {
    backgroundColor: '#E7E0EC',
    borderRadius: 4,
  },
  skeletonThumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#E7E0EC',
  },
  filteredContainer: {
    paddingBottom: 16,
  },
  filterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3E8FF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  filterStatusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#21005D',
  },
  filterResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  filterResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6750A4',
  },
  filterEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  filterEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  filterEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyConnectionBox: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  emptyConnectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  emptyConnectionSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  changeIpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#6750A4',
  },
  changeIpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

const HomeSkeletonLoader: React.FC = () => {
  const animatedOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedOpacity]);

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeroCard}>
        <Animated.View style={[styles.skeletonHeroImage, { opacity: animatedOpacity }]} />
        <View style={{ padding: 16, gap: 10 }}>
          <Animated.View style={[styles.skeletonLine, { width: '85%', height: 18, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.skeletonLine, { width: '60%', height: 18, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.skeletonLine, { width: '95%', height: 12, opacity: animatedOpacity }]} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Animated.View style={[styles.skeletonLine, { width: '40%', height: 12, opacity: animatedOpacity }]} />
            <Animated.View style={[styles.skeletonLine, { width: '25%', height: 26, borderRadius: 13, opacity: animatedOpacity }]} />
          </View>
        </View>
      </View>

      {[1, 2].map((k) => (
        <View key={k} style={styles.skeletonStandardCard}>
          <View style={{ flex: 1, gap: 8 }}>
            <Animated.View style={[styles.skeletonLine, { width: '30%', height: 10, opacity: animatedOpacity }]} />
            <Animated.View style={[styles.skeletonLine, { width: '90%', height: 14, opacity: animatedOpacity }]} />
            <Animated.View style={[styles.skeletonLine, { width: '70%', height: 12, opacity: animatedOpacity }]} />
          </View>
          <Animated.View style={[styles.skeletonThumb, { opacity: animatedOpacity }]} />
        </View>
      ))}
    </View>
  );
};
