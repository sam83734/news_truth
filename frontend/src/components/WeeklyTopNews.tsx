import React from 'react';
import { useApp } from '../context';
import { ArrowRight, Clock, ShieldCheck, CheckCircle2, Video } from 'lucide-react';
import type { Article } from '../types';
import { getArticleMediaInfo } from '../utils/mediaUtils';

export const WeeklyTopNews: React.FC = () => {
  const { articles, selectArticle, setCategory, openLightbox, formatTimeAgo } = useApp();

  // Pick 6 articles (2 lines of 3 news boxes)
  const weeklyItems: Article[] = articles.slice(0, 6);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header with "View all top news →" on the right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-gray-100 gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full inline-block mb-2">
            Curated Ground Insights
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Weekly Top News
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with our Weekly Top News, bringing you the latest trends, insights, and developments from around the world.
          </p>
        </div>

        <button
          onClick={() => setCategory('All')}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 self-start sm:self-end"
        >
          <span>View all top news</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2 Rows of 3 Boxes (6 cards total) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {weeklyItems.map((article) => {
          const mediaInfo = getArticleMediaInfo(article);
          return (
            <div
              key={article.id}
              onClick={() => selectArticle(article)}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-amber-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Card Image Container */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(
                    mediaInfo.videoSrc || mediaInfo.displayImage,
                    article.title,
                    mediaInfo.isVideo ? 'video' : 'image'
                  );
                }}
                className="relative h-52 w-full overflow-hidden bg-neutral-900 cursor-zoom-in group/img"
                title="Click to view full photo/video"
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
                      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {mediaInfo.isVideo && (
                  <span className="absolute top-4 right-4 px-2 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                    <Video className="w-3 h-3 text-rose-400" />
                    Video
                  </span>
                )}

                {/* Verification Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  {article.isVerifiedGround ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Ground
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      DLT Sealed
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    {article.categoryTag || article.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  {/* Date & Read Time */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeAgo(article.createdAt || article.dateOrTimeAgo)}</span>
                    <span>•</span>
                    <span>{article.readTime || '4 min Read'}</span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-700 leading-snug mb-3 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-6 font-normal">
                    {article.excerpt}
                  </p>
                </div>

                {/* Footer with Author & Read more */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        article.authorAvatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                      }
                      alt={article.authorName}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-600 font-semibold truncate max-w-[120px]">
                      {article.authorName}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700 group-hover:translate-x-1 transition-all">
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
