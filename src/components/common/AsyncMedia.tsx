import React, { useEffect, useState } from 'react';
import { mediaCache } from '../../services/mediaCache';

interface AsyncMediaProps extends React.MediaHTMLAttributes<HTMLMediaElement> {
  src: string;
  mediaType: 'video' | 'image';
  alt?: string;
}

export const AsyncMedia: React.FC<AsyncMediaProps> = ({ src, mediaType, className, alt, controls, playsInline, autoPlay }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    let isMounted = true;

    if (src.startsWith('localmedia://')) {
      const id = src.replace(/^localmedia:\/\/(video|image)\//, '');
      mediaCache.getMedia(id).then(blob => {
        if (!isMounted) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setResolvedSrc(objectUrl);
        } else {
          setError(true);
        }
      }).catch(() => {
        if (isMounted) setError(true);
      });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`}>
        <span className="text-zinc-500 text-xs">Media not found</span>
      </div>
    );
  }

  if (mediaType === 'video') {
    return (
      <video
        src={resolvedSrc}
        className={className}
        controls={controls}
        playsInline={playsInline}
        autoPlay={autoPlay}
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      className={className}
      alt={alt || "Media"}
      referrerPolicy="no-referrer"
    />
  );
};
