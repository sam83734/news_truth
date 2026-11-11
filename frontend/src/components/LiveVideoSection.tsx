import React, { useState } from 'react';
import { useApp } from '../context';
import type { VideoReport } from '../types';
import { Video, Heart, MapPin, Radio, X, ExternalLink } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/mediaUtils';

export const LiveVideoSection: React.FC = () => {
  const { videos, likedVideoIds, toggleLikeVideo, layoutConfig } = useApp();
  const [activeModalVideo, setActiveModalVideo] = useState<VideoReport | null>(null);

  const videoCategory = layoutConfig?.videoSectionCategory || 'Live Streams';

  const handleLike = async (vid: VideoReport, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeVideo(vid.id);
  };

  return (
    <section id="live-video-section" className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {videoCategory === 'Live Streams' || videoCategory === 'All'
                  ? 'Live & Eyewitness Video Streams'
                  : `${videoCategory} — Live & Field Streams`}
              </h2>
              {videoCategory !== 'Live Streams' && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {videoCategory} Channel
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Unfiltered video feeds transmitted directly from citizen reporters on the ground (Strict 1-like limit)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => {
          const isLiked = likedVideoIds.includes(vid.id);
          return (
            <div
              key={vid.id}
              onClick={() => setActiveModalVideo(vid)}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-rose-200 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              {/* Video Thumbnail with Badges */}
              <div className="relative h-52 w-full overflow-hidden bg-neutral-900">
                <img
                  src={
                    vid.videoThumbnailUrl ||
                    getYouTubeThumbnail(vid.videoUrl) ||
                    'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  {vid.isLive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      LIVE STREAM
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      REPLAY DISPATCH
                    </span>
                  )}

                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md">
                    {vid.viewersCount}
                  </span>
                </div>

                {/* Center Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition-all">
                    <Video className="w-6 h-6 ml-0.5" />
                  </div>
                </div>

                {/* Bottom Location */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{vid.location}</span>
                </div>
              </div>

              {/* Video Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-600 line-clamp-2 leading-snug mb-2 transition-colors">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {vid.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">
                    Reporter: {vid.reporterName}
                  </span>

                  <button
                    onClick={(e) => handleLike(vid, e)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${isLiked
                        ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    title={isLiked ? 'Unlike video stream' : 'Like video stream (1 like per user)'}
                  >
                    <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                    <span>{vid.likesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-700">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-600 text-xs font-bold uppercase">
                  {activeModalVideo.isLive ? 'Live Coverage' : 'Replay'}
                </span>
                <span className="text-sm font-bold truncate max-w-md">
                  {activeModalVideo.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeModalVideo.videoUrl && (
                  <a
                    href={activeModalVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
                    title="Open stream in YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setActiveModalVideo(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {(() => {
                const ytEmbedUrl = getYouTubeEmbedUrl(activeModalVideo.videoUrl);
                if (ytEmbedUrl) {
                  return (
                    <iframe
                      src={ytEmbedUrl}
                      title={activeModalVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                if (activeModalVideo.videoUrl) {
                  return (
                    <video
                      src={activeModalVideo.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }
                return (
                  <div className="text-gray-400 text-xs font-mono">No video feed URL provided</div>
                );
              })()}
            </div>

            <div className="p-4 bg-neutral-950 text-white flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400">Location: </span>
                <span className="font-semibold text-amber-400">{activeModalVideo.location}</span>
                <span className="mx-2 text-neutral-600">|</span>
                <span className="text-gray-400">Reporter: </span>
                <span className="font-semibold">{activeModalVideo.reporterName}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{activeModalVideo.viewersCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
