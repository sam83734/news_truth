import React from 'react';
import { useApp } from '../context';
import { Clock, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import type { Article } from '../types';

export const SportsGroundSection: React.FC = () => {
  const { articles, selectArticle, openLightbox, formatTimeAgo } = useApp();

  // 4 articles for 2x2 grid
  const items: Article[] = articles.slice(0, 4);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Ground & Eyewitness Dispatches
            </h2>
            <p className="text-xs text-gray-500">
              Direct verification reports from citizen delegates and accredited field correspondents
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((art) => {
          return (
            <div
              key={art.id}
              onClick={() => selectArticle(art)}
              className="group flex items-center gap-4 p-4 rounded-3xl bg-white hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Thumbnail */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(art.imageUrl, art.title);
                }}
                className="w-28 sm:w-36 h-28 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 relative cursor-zoom-in"
                title="Click to view full photo"
              >
                <img
                  src={art.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  {art.isVerifiedGround ? (
                    <span className="p-1 rounded bg-emerald-600 text-white flex items-center shadow">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-blue-600 text-white flex items-center shadow">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(art.createdAt || art.dateOrTimeAgo)}</span>
                  <span>•</span>
                  <span>{art.readTime || '3 min'}</span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-800 leading-snug line-clamp-2 mb-2 transition-colors">
                  {art.title}
                </h4>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]">
                    {art.authorName}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                    Read Dispatch →
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
