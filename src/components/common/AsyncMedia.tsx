import React, { useEffect, useState } from 'react';
import { mediaCache } from '../../services/mediaCache';

interface AsyncMediaProps extends React.MediaHTMLAttributes<HTMLMediaElement> {
  src: string;
  mediaType: 'video' | 'image';
  alt?: string;
}

export const AsyncMedia: React.FC<AsyncMediaProps> = ({ src, mediaType, className, alt, controls, playsInline, autoPlay, poster }) => {
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
    // Append #t=0.001 to coax browsers into extracting the first frame for the poster
    const videoSrc = resolvedSrc.includes('#') ? resolvedSrc : `${resolvedSrc}#t=0.001`;
    // Transparent 1x1 GIF to override the ugly default Android Webview play button poster
    const defaultPoster = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    return (
      <video
        src={videoSrc}
        className={className}
        controls={controls}
        playsInline={playsInline}
        autoPlay={autoPlay}
        preload="metadata"
        poster={poster || defaultPoster}
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
