import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Radio,
  Video,
} from 'lucide-react';
import type { Article } from '../types';
import { getArticleMediaInfo } from '../utils/mediaUtils';

export const TechNewsSection: React.FC = () => {
  const {
    articles,
    selectArticle,
    setCategory,
    openLightbox,
    formatTimeAgo,
    layoutConfig,
  } = useApp();

  const targetCategory = layoutConfig?.secondaryBannerCategory || 'Tech & Media';
  const sectionTitle = layoutConfig?.secondaryBannerTitle || 'Tech & Media News';

  // Filter candidates matching the secondary banner category
  const techCandidates: Article[] = useMemo(() => {
    const target = targetCategory.toLowerCase();
    const matched = articles.filter(
      (a: Article) => a.category && a.category.toLowerCase().includes(target)
    );
    if (matched.length > 0) return matched;
    return articles.slice(0, 3);
  }, [articles, targetCategory]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide every 60 seconds (1 minute) if more than 1 article exists
  useEffect(() => {
    if (techCandidates.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % techCandidates.length);
    }, 60000); // 1 minute (60s)

    return () => clearInterval(timer);
  }, [techCandidates.length, isHovered]);

  const techLead: Article | undefined =
    techCandidates[activeSlide] || techCandidates[0] || articles[0];

  // Side cards: 2 articles excluding the current active slide lead
  const sideTech: Article[] = useMemo(() => {
    return articles
      .filter((a: Article) => a.id !== techLead?.id)
      .slice(0, 2);
  }, [articles, techLead?.id]);

  if (!techLead) return null;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + techCandidates.length) % techCandidates.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % techCandidates.length);
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {sectionTitle}
              </h2>
              {techCandidates.length > 1 && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  <Radio className="w-2.5 h-2.5 text-purple-600 animate-pulse" />
                  Auto-Slide (60s)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Channel: <span className="font-semibold text-gray-700">{targetCategory}</span> • Digital sovereignty, algorithmic governance & cybersecurity investigations
            </p>
          </div>
        </div>
        <button
          onClick={() => setCategory(targetCategory)}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
        >
          View all {targetCategory} dispatches →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Banner Slider Card (Span 7 cols) */}
        <div className="lg:col-span-7">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => selectArticle(techLead)}
            className="group relative rounded-3xl overflow-hidden bg-neutral-900 h-[440px] shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-end p-8"
          >
            {(() => {
              const leadMedia = getArticleMediaInfo(techLead);
              if (leadMedia.isVideo && !leadMedia.displayImage && leadMedia.videoSrc) {
                return (
                  <video
                    src={leadMedia.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                );
              }
              return (
                <img
                  src={
                    leadMedia.displayImage ||
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={techLead.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                />
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>

            {/* Slider Controls (if multiple candidates) */}
            {techCandidates.length > 1 && (
              <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {activeSlide + 1} / {techCandidates.length}
                </span>
                <button
                  onClick={handlePrevSlide}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold uppercase tracking-wider">
                  {techLead.categoryTag || targetCategory}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> DLT Audited
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white group-hover:text-amber-300 transition-colors mb-3">
                {techLead.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-xl mb-4 font-normal">
                {techLead.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/15">
                <div className="flex items-center gap-2">
                  <span>By {techLead.authorName}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(techLead.createdAt || techLead.dateOrTimeAgo)}</span>
                  <span>•</span>
                  <span>{techLead.readTime || '6 min read'}</span>
                </div>
                <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Investigation <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Slide Dots Indicator */}
              {techCandidates.length > 1 && (
                <div className="flex items-center gap-1.5 mt-3">
                  {techCandidates.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeSlide ? 'w-6 bg-purple-400' : 'w-2 bg-white/40'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 2 Stacked Horizontal Cards (Span 5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {sideTech.map((art) => {
            const mediaInfo = getArticleMediaInfo(art);
            return (
              <div
                key={art.id}
                onClick={() => selectArticle(art)}
                className="group flex-1 flex items-center gap-4 p-5 rounded-3xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-purple-200 transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(
                      mediaInfo.videoSrc || mediaInfo.displayImage,
                      art.title,
                      mediaInfo.isVideo ? 'video' : 'image'
                    );
                  }}
                  className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative cursor-zoom-in bg-neutral-900"
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
                        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {mediaInfo.isVideo && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-1 backdrop-blur-sm">
                      <Video className="w-2.5 h-2.5 text-rose-400" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeAgo(art.createdAt || art.dateOrTimeAgo)}</span>
                    <span>•</span>
                    <span>{art.readTime || '4 min'}</span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 leading-snug line-clamp-2 mb-2 transition-colors">
                    {art.title}
                  </h4>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {art.excerpt}
                  </p>

                  <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
