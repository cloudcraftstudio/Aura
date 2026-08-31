import React, { useState, useEffect, useRef } from 'react';
import { Search, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';

interface UnsplashSearchProps {
  onSelect: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export const UnsplashSearch: React.FC<UnsplashSearchProps> = ({ 
  onSelect, 
  placeholder = 'Search Unsplash for images...',
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; url: string; thumb: string; author: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSearch = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    const fallbackResults = ALL_CHRISTIAN_PRESET_IMAGES.filter(
      p => p.name.toLowerCase().includes(term) || p.subtitle.toLowerCase().includes(term) || p.category.includes(term)
    ).map(p => ({
      id: p.id,
      url: p.url,
      thumb: p.url,
      author: 'Curated Preset'
    }));
    
    // If empty search, return all presets
    if (!term.trim()) {
      return ALL_CHRISTIAN_PRESET_IMAGES.map(p => ({
        id: p.id,
        url: p.url,
        thumb: p.url,
        author: 'Curated Preset'
      }));
    }
    
    return fallbackResults;
  };

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      
      if (!accessKey) {
        // Fallback to presets if no API key is provided
        setTimeout(() => {
          setResults(fallbackSearch(searchTerm));
          setIsLoading(false);
        }, 400);
        return;
      }

      const endpoint = searchTerm.trim() 
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=20&orientation=landscape`
        : `https://api.unsplash.com/photos/random?count=20&orientation=landscape`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      });

      if (!res.ok) {
        throw new Error('Unsplash API error');
      }

      const data = await res.json();
      const photos = searchTerm.trim() ? data.results : data;
      
      setResults(photos.map((p: any) => ({
        id: p.id,
        url: p.urls.regular,
        thumb: p.urls.small,
        author: p.user.name
      })));
    } catch (err) {
      console.warn('Unsplash search failed:', err);
      // Fallback on error
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
    }, 500);
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
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="bg-slate-900/40 border border-white/10 rounded-xl p-3">
          {!import.meta.env.VITE_UNSPLASH_ACCESS_KEY && (
            <div className="mb-3 flex items-start gap-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p>
                Showing curated presets. Add <code className="bg-black/30 px-1 rounded">VITE_UNSPLASH_ACCESS_KEY</code> in your environment variables to unlock full Unsplash search!
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {results.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  onSelect(img.url);
                  setIsOpen(false);
                }}
                className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={img.thumb}
                  alt={`By ${img.author}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[9px] text-white/80 truncate w-full text-left">
                    By {img.author}
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
