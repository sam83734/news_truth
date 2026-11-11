import React from 'react';
import { useApp } from '../context';
import { Play, Pause, X, Volume2 } from 'lucide-react';

export const AudioPlayerBar: React.FC = () => {
  const { audioState, toggleAudioPlayback, setAudioSpeed, stopAudio, seekAudio } = useApp();

  if (!audioState.article) return null;

  const { article, isPlaying, progress, duration, speed } = audioState;

  const nextSpeed = speed === 1.0 ? 1.5 : speed === 1.5 ? 2.0 : 1.0;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
    seekAudio(pct);
  };

  return (
    <div className="fixed bottom-5 left-4 right-4 max-w-3xl mx-auto z-[120] bg-neutral-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-amber-500/40 p-3 sm:p-4 animate-slideUp ring-2 ring-amber-500/20">
      <div className="flex items-center justify-between gap-3.5">
        {/* Play/Pause Button */}
        <button
          onClick={toggleAudioPlayback}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 flex items-center justify-center shrink-0 shadow-lg transition-transform active:scale-95 cursor-pointer"
          title={isPlaying ? 'Pause Narration' : 'Resume Narration'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Info & Interactive Scrubber Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            <div className="truncate font-semibold text-gray-200 max-w-[240px] sm:max-w-md flex items-center gap-1.5">
              <span className="text-amber-400 font-extrabold uppercase text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 shrink-0">
                AI Voice Narration
              </span>
              <span className="truncate text-xs sm:text-sm font-medium text-gray-100">{article.title}</span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5 shrink-0">
              {isPlaying && (
                <span className="flex items-center gap-0.5 text-amber-400">
                  <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-150"></span>
                </span>
              )}
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-amber-300/90">{progress}%</span>
              <span className="text-gray-500">·</span>
              <span>{isPlaying ? 'Speaking' : duration}</span>
            </div>
          </div>

          {/* Interactive Seekable Progress Bar */}
          <div
            onClick={handleTrackClick}
            className="w-full bg-neutral-800 hover:bg-neutral-750 h-2 rounded-full cursor-pointer relative group transition-all"
            title="Click or drag to scrub narration position"
          >
            <div
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            ></div>
            {/* Scrubber Thumb */}
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow-md pointer-events-none"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Speed Toggle */}
        <button
          onClick={() => setAudioSpeed(nextSpeed)}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-bold text-amber-400 border border-neutral-700 transition-colors cursor-pointer shrink-0"
          title="Toggle Playback Speed (1.0x, 1.5x, 2.0x)"
        >
          {speed}x
        </button>

        {/* Close Audio */}
        <button
          onClick={stopAudio}
          className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Dismiss Audio Narration"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
