import React, { useState } from 'react';
import { ExternalLink, Play, Video as VideoIcon, Youtube, RotateCcw } from 'lucide-react';
import { ExtractedVideo } from '../../utils/mediaUtils';
import { soundEffects } from '../../services/audio';

interface VideoEmbedProps {
  video: ExtractedVideo;
  className?: string;
  autoPlayOnClick?: boolean;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  video,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getYoutubeEmbedUrl = () => {
    const separator = video.embedUrl.includes('?') ? '&' : '?';
    return isPlaying ? `${video.embedUrl}${separator}autoplay=1` : video.embedUrl;
  };

  const handleStartPlay = () => {
    soundEffects.playTap();
    setIsPlaying(true);
    setHasError(false);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl transition-all ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {video.type === 'youtube' ? (
          !isPlaying && video.thumbnailUrl && !hasError ? (
            /* Fast-loading custom poster thumbnail with live play button */
            <div
              className="relative w-full h-full cursor-pointer group select-none"
              onClick={handleStartPlay}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartPlay();
                }
              }}
            >
              <img
                src={video.thumbnailUrl}
                alt="Video thumbnail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 group-hover:scale-110 group-hover:bg-red-500 transition-all border border-red-400/40">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-md">
                <Youtube className="w-4 h-4 text-red-500 fill-red-500/20" />
                <span>YouTube Video</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white/90">
                Click to Play Live
              </div>
            </div>
          ) : (
            /* Live YouTube iFrame */
            <iframe
              src={getYoutubeEmbedUrl()}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onError={() => setHasError(true)}
              className="w-full h-full border-0 absolute inset-0"
            />
          )
        ) : video.type === 'vimeo' ? (
          <iframe
            src={`${video.embedUrl}${isPlaying ? '&autoplay=1' : ''}`}
            title="Vimeo video player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />
        ) : (
          /* HTML5 Video */
          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Video Footer bar with direct link and replay controls */}
      <div className="px-4 py-2.5 bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-2 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2 truncate">
          {video.type === 'youtube' ? (
            <Youtube className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <VideoIcon className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="truncate font-medium text-slate-200">
            {video.type === 'youtube'
              ? 'YouTube Player'
              : video.type === 'vimeo'
              ? 'Vimeo Player'
              : 'Direct Video Player'}
          </span>
          {isPlaying && (
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              title="Reset player preview"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white transition-colors text-xs font-semibold shrink-0 border border-blue-500/20 shadow-sm"
        >
          <span>Watch on YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
