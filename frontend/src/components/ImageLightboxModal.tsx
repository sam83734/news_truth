import React, { useEffect } from 'react';
import { useApp } from '../context';
import { X, ExternalLink } from 'lucide-react';
import { isVideoSource, getYouTubeEmbedUrl } from '../utils/mediaUtils';

export const ImageLightboxModal: React.FC = () => {
  const { lightboxMedia, closeLightbox } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (lightboxMedia) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxMedia, closeLightbox]);

  if (!lightboxMedia) return null;

  const isVideo = lightboxMedia.type === 'video' || isVideoSource(lightboxMedia.url);
  const ytEmbedUrl = isVideo ? getYouTubeEmbedUrl(lightboxMedia.url) : null;

  return (
    <div
      onClick={closeLightbox}
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn select-none"
    >
      {/* Top Controls Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl flex items-center justify-between pb-3 text-white px-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {isVideo ? (ytEmbedUrl ? 'YouTube Live Feed' : 'Video Evidence') : 'Photo Evidence'}
          </span>
          {lightboxMedia.title && (
            <span className="text-xs sm:text-sm font-bold text-gray-200 truncate">
              {lightboxMedia.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lightboxMedia.url.startsWith('http') && (
            <a
              href={lightboxMedia.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Open full resolution in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={closeLightbox}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Media Preview */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[82vh] max-w-[92vw] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-neutral-950"
      >
        {ytEmbedUrl ? (
          <div className="w-[85vw] max-w-4xl aspect-video">
            <iframe
              src={ytEmbedUrl}
              title={lightboxMedia.title || 'Live video preview'}
              className="w-full h-full rounded-2xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : isVideo ? (
          <video
            src={lightboxMedia.url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl"
          />
        ) : (
          <img
            src={lightboxMedia.url}
            alt={lightboxMedia.title || 'Evidence preview'}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl"
          />
        )}
      </div>

      <div className="pt-3 text-[11px] text-gray-400 font-mono">
        Click anywhere outside or press Escape to close
      </div>
    </div>
  );
};
