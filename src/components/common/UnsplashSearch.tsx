import React, { useState, useEffect, useRef } from 'react';
import { Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';

interface UnsplashSearchProps {
  onSelect: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export const UnsplashSearch: React.FC<UnsplashSearchProps> = ({ 
  onSelect, 
  placeholder = 'Search high-res Christian & worship images...',
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; url: string; thumb: string; author: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSearch = (searchTerm: string) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return ALL_CHRISTIAN_PRESET_IMAGES.map(p => ({
        id: p.id,
        url: p.url,
        thumb: p.url,
        author: 'Curated Preset'
      }));
    }
    
    const matched = ALL_CHRISTIAN_PRESET_IMAGES.filter(
      p => p.name.toLowerCase().includes(term) || p.subtitle.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    ).map(p => ({
      id: p.id,
      url: p.url,
      thumb: p.url,
      author: 'Curated Preset'
    }));

    return matched.length > 0 ? matched : ALL_CHRISTIAN_PRESET_IMAGES.map(p => ({
      id: p.id,
      url: p.url,
      thumb: p.url,
      author: 'Curated Preset'
    }));
  };

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    
    try {
      // 1. Try server-side proxy endpoint first (safe, doesn't expose key)
      try {
        const proxyRes = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchTerm)}`);
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData.results && proxyData.results.length > 0) {
            setResults(proxyData.results);
            setIsLoading(false);
            return;
          }
        }
      } catch (proxyErr) {
        // Fall through to direct key check
      }

      // 2. Direct client-side key fallback
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      if (accessKey) {
        const endpoint = searchTerm.trim() 
          ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=24&orientation=landscape`
          : `https://api.unsplash.com/photos/random?count=24&orientation=landscape`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Client-ID ${accessKey}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const photos = searchTerm.trim() ? data.results : data;
          if (Array.isArray(photos) && photos.length > 0) {
            setResults(photos.map((p: any) => ({
              id: p.id,
              url: p.urls.regular,
              thumb: p.urls.small,
              author: p.user?.name || 'Unsplash Creator'
            })));
            setIsLoading(false);
            return;
          }
        }
      }

      // 3. Fallback smoothly to curated preset library
      setResults(fallbackSearch(searchTerm));
    } catch (err) {
      console.warn('Unsplash search fallback to presets:', err);
      setResults(fallbackSearch(searchTerm));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen && results.length === 0) {
      performSearch('');
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {results.length} Available Images
            </span>
            <span className="text-[11px] text-indigo-400">
              High Resolution
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {results.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  onSelect(img.url);
                  setIsOpen(false);
                }}
                className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <img
                  src={img.thumb}
                  alt={`By ${img.author}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[9px] text-white/90 truncate w-full text-left font-medium">
                    {img.author}
                  </p>
                </div>
              </button>
            ))}
            {results.length === 0 && !isLoading && (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <ImageIcon className="w-6 h-6 opacity-50" />
                No images found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
