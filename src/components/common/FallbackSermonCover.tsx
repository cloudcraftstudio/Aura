import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface FallbackSermonCoverProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackGradient?: string; // e.g. "from-slate-800 to-slate-950"
}

export function FallbackSermonCover({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackGradient = "from-amber-900/60 to-slate-950"
}: FallbackSermonCoverProps) {
  const [error, setError] = useState(false);

  // If no source is provided OR the source is empty/failing, show the fallback
  if (!src || src === "" || error) {
    return (
      <div className={`aspect-video w-full rounded-lg relative overflow-hidden bg-gradient-to-br ${fallbackGradient} flex flex-col items-center justify-center border border-white/5`}>
        {/* Abstract Scripture/Cross Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="crossPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M20 5 v30 M5 20 h30" stroke="currentColor" strokeWidth="1" className="text-white/40" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#crossPattern)" />
          </svg>
        </div>
        
        <BookOpen className="w-10 h-10 text-amber-400/60 mb-2 relative z-10" />
        <span className="text-[10px] font-bold text-amber-200/50 uppercase tracking-widest relative z-10 px-3 text-center line-clamp-2">
          {alt || 'Sermon'}
        </span>
      </div>
    );
  }

  // Normal image rendering, but with error detection
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}
