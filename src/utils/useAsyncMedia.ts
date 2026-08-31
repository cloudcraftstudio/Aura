import { useState, useEffect } from 'react';
import { mediaCache } from '../services/mediaCache';

export function useAsyncMedia(src: string) {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src && src.startsWith('localmedia://') ? '' : src);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = '';
    let isMounted = true;

    if (src && src.startsWith('localmedia://')) {
      setLoading(true);
      const id = src.replace(/^localmedia:\/\/(video|image)\//, '');
      mediaCache.getMedia(id).then(blob => {
        if (!isMounted) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setResolvedSrc(objectUrl);
          setError(false);
        } else {
          setResolvedSrc('');
          setError(true);
        }
      }).catch(() => {
        if (isMounted) {
          setResolvedSrc('');
          setError(true);
        }
      }).finally(() => {
        if (isMounted) setLoading(false);
      });
    } else {
      setResolvedSrc(src || '');
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return { resolvedSrc, error, loading };
}
