import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context';
import type { Article } from '../types';
import {
  ShieldCheck,
  Headphones,
  ArrowRight,
  Clock,
  Eye,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Video,
} from 'lucide-react';
import { getArticleMediaInfo } from '../utils/mediaUtils';

export const HeroSection: React.FC = () => {
  const {
    articles,
    heroArticle,
    selectArticle,
    playArticleAudio,
    bookmarkedIds,
    toggleBookmarkItem,
    openDLTModal,
    openLightbox,
    formatTimeAgo,
    layoutConfig,
  } = useApp();

  // Find candidate urgent or configured hero banner articles
  const heroCandidates: Article[] = useMemo(() => {
    const targetCat = (layoutConfig?.heroBannerCategory || 'Urgent Breaking').toLowerCase();
    const isUrgentMode = targetCat.includes('urgent');

    const matched = articles.filter((a) => {
      if (isUrgentMode) {
        return a.isUrgent || (a.category && a.category.toLowerCase().includes('urgent'));
      }
      return a.category && a.category.toLowerCase().includes(targetCat);
    });

    if (matched.length > 0) return matched;
    if (heroArticle) return [heroArticle];
    return articles.slice(0, 3);
  }, [articles, heroArticle, layoutConfig?.heroBannerCategory]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide every 60 seconds (1 minute) if more than 1 urgent/banner article exists
  useEffect(() => {
    if (heroCandidates.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroCandidates.length);
    }, 60000); // 1 minute (60s)

    return () => clearInterval(timer);
  }, [heroCandidates.length, isHovered]);

  // Safe lead article
  const lead: Article | undefined = heroCandidates[activeSlide] || heroCandidates[0] || articles[0];

  // Side articles: 4 articles excluding current active lead
  const sideArticles: Article[] = useMemo(() => {
    return articles.filter((a) => a.id !== lead?.id).slice(0, 4);
  }, [articles, lead?.id]);

  if (!lead) return null;

  const isBookmarked = bookmarkedIds.includes(lead.id);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + heroCandidates.length) % heroCandidates.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % heroCandidates.length);
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Big Featured Hero Card (Span 7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative rounded-3xl overflow-hidden bg-neutral-900 shadow-xl transition-all duration-300 hover:shadow-2xl"
          >
            {/* Image / Video Container with Ambient Scrim */}
            <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden">
              {(() => {
                const leadMedia = getArticleMediaInfo(lead);
                if (leadMedia.isVideo && !leadMedia.displayImage && leadMedia.videoSrc) {
                  return (
                    <video
                      src={leadMedia.videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  );
                }
                return (
                  <img
                    src={
                      leadMedia.displayImage ||
                      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200'
                    }
                    alt={lead.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                );
              })()}

              {/* Gradient Scrims: Darken bottom for high-contrast white text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

              {/* Top Badges */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {lead.isUrgent ? 'Urgent Breaking' : 'Featured Post'}
                  </span>
                  {lead.isVerifiedGround && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-bold backdrop-blur-sm shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Ground
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-bold backdrop-blur-sm shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    DLT Immutable Seal
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Slider Counter if multiple urgent news */}
                  {heroCandidates.length > 1 && (
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-mono font-bold backdrop-blur-md">
                      {activeSlide + 1} / {heroCandidates.length}
                    </span>
                  )}

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkItem(lead.id);
                    }}
                    className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer"
                    title="Bookmark Dispatch"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Prev / Next Slide Arrows (Visible if multiple banner news) */}
              {heroCandidates.length > 1 && (
                <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                  <button
                    onClick={handlePrevSlide}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md pointer-events-auto opacity-80 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                    title="Previous Urgent News"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md pointer-events-auto opacity-80 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                    title="Next Urgent News (Slides automatically every 1 min)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 text-white flex flex-col justify-end">
                {/* Category & Time */}
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-300 mb-2.5 flex-wrap">
                  <span className="text-amber-400 uppercase tracking-widest font-bold">
                    {lead.categoryTag || lead.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(lead.createdAt || lead.dateOrTimeAgo)}
                  </span>
                  <span>•</span>
                  <span>{lead.readTime || '4 min read'}</span>
                  {lead.views && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {lead.views} views
                      </span>
                    </>
                  )}
                </div>

                {/* Big Headline */}
                <h1
                  onClick={() => selectArticle(lead)}
                  className="text-2xl sm:text-3xl xl:text-4xl font-extrabold leading-tight text-white mb-3 cursor-pointer hover:text-amber-300 transition-colors"
                >
                  {lead.title}
                </h1>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-gray-200 line-clamp-2 max-w-2xl mb-6 font-normal">
                  {lead.excerpt}
                </p>

                {/* Bottom Bar: Author info & Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img
                      src={lead.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'}
                      alt={lead.authorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{lead.authorName}</div>
                      <div className="text-xs text-amber-300/90">{lead.authorTitle || 'Senior Political Correspondent'}</div>
                    </div>
                  </div>

                  {/* Actions & Slide Dots */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Audio Narration Trigger */}
                    <button
                      onClick={() => playArticleAudio(lead)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5 text-amber-400" />
                      <span>Listen Narration</span>
                    </button>

                    {/* DLT Verify Modal Trigger */}
                    <button
                      onClick={() => openDLTModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>DLT Ledger Proof</span>
                    </button>

                    {/* Read Full Dispatch */}
                    <button
                      onClick={() => selectArticle(lead)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-neutral-900 bg-white hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multiple Slide Dots */}
                {heroCandidates.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-4 pt-2">
                    {heroCandidates.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlide(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activeSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Stacked Compact News Cards (Direct Match to Dribbble Layout) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
          {sideArticles.map((article) => {
            const mediaInfo = getArticleMediaInfo(article);
            return (
              <div
                key={article.id}
                onClick={() => selectArticle(article)}
                className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                {/* Thumbnail Image / Video (Rounded 12px) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(
                      mediaInfo.videoSrc || mediaInfo.displayImage,
                      article.title,
                      mediaInfo.isVideo ? 'video' : 'image'
                    );
                  }}
                  className="w-24 sm:w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 relative cursor-zoom-in bg-neutral-900"
                  title="Click to view full media"
                >
                  {mediaInfo.isVideo && !mediaInfo.displayImage && mediaInfo.videoSrc ? (
                    <video
                      src={mediaInfo.videoSrc}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={
                        mediaInfo.displayImage ||
                        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {mediaInfo.isVideo && (
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5 text-rose-400" />
                    </span>
                  )}

                  {article.isVerifiedGround && (
                    <span className="absolute bottom-1 right-1 p-0.5 rounded bg-emerald-600 text-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-1">
                    <span className="text-amber-600 uppercase font-bold tracking-wider">
                      {article.categoryTag || article.category}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(article.createdAt || article.dateOrTimeAgo)}</span>
                    <span>•</span>
                    <span>{article.readTime || '3 min'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 leading-snug line-clamp-2 transition-colors">
                    {article.title}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
                      By {article.authorName}
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
