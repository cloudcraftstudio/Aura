import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Image as ImageIcon, Loader2, Check, RefreshCw } from 'lucide-react';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';

export interface UniversalUnsplashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  title?: string;
  initialQuery?: string;
}

interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  author: string;
  description?: string;
}

const POPULAR_THEMES = [
  { label: 'Worship', query: 'worship praise church' },
  { label: 'The Cross', query: 'cross calvary jesus' },
  { label: 'Holy Bible', query: 'open bible scripture' },
  { label: 'Majestic Nature', query: 'mountains sunrise creation' },
  { label: 'Stained Glass', query: 'stained glass cathedral church' },
  { label: 'Prayer & Faith', query: 'prayer hands light' },
  { label: 'Preacher & Pulpit', query: 'pastor preaching pulpit sermon' },
  { label: 'Portraits', query: 'portrait kind face peaceful' },
];

export const UniversalUnsplashModal: React.FC<UniversalUnsplashModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Unsplash Image',
  initialQuery = 'worship cross bible',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTheme, setActiveTheme] = useState('');
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to rich curated presets when offline or if API key is exhausted
  const getPresetFallback = (searchTerm: string): UnsplashPhoto[] => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return ALL_CHRISTIAN_PRESET_IMAGES.map((p) => ({
        id: p.id,
        url: p.url,
        thumb: p.url,
        author: 'Curated Preset',
        description: p.name,
      }));
    }

    const matched = ALL_CHRISTIAN_PRESET_IMAGES.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.subtitle.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    ).map((p) => ({
      id: p.id,
      url: p.url,
      thumb: p.url,
      author: 'Curated Preset',
      description: p.name,
    }));

    return matched.length > 0
      ? matched
      : ALL_CHRISTIAN_PRESET_IMAGES.map((p) => ({
          id: p.id,
          url: p.url,
          thumb: p.url,
          author: 'Curated Preset',
          description: p.name,
        }));
  };

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      // 1. Try server-side proxy
      const proxyRes = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchTerm)}`);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.results && data.results.length > 0) {
          setResults(data.results);
          setIsLoading(false);
          return;
        }
      }

      // 2. Direct client fallback with access key
      const clientKey =
        import.meta.env.VITE_UNSPLASH_ACCESS_KEY ||
        '6Zm1K6Y5nxJekPjGCydKDtCqh7m5PteXt9yHSeWS6q0';

      if (clientKey) {
        const endpoint = searchTerm.trim()
          ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              searchTerm
            )}&per_page=28&orientation=landscape&client_id=${clientKey}`
          : `https://api.unsplash.com/photos/random?count=28&orientation=landscape&client_id=${clientKey}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const photos = searchTerm.trim() ? data.results : data;
          if (Array.isArray(photos) && photos.length > 0) {
            setResults(
              photos.map((p: any) => ({
                id: p.id,
                url: p.urls?.regular || p.urls?.full || p.urls?.small,
                thumb: p.urls?.small || p.urls?.thumb,
                author: p.user?.name || 'Unsplash Creator',
                description: p.alt_description || p.description,
              }))
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // 3. Fallback to curated preset photos
      setResults(getPresetFallback(searchTerm));
    } catch (err) {
      console.warn('Unsplash search fallback to presets:', err);
      setResults(getPresetFallback(searchTerm));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      performSearch(query);
    }
  }, [isOpen]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveTheme('');

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 450);
  };

  const handleSelectTheme = (themeQuery: string, themeLabel: string) => {
    setActiveTheme(themeLabel);
    setQuery(themeQuery);
    performSearch(themeQuery);
  };

  const handleChoosePhoto = (photoUrl: string) => {
    setSelectedUrl(photoUrl);
    onSelect(photoUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-950/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-slate-400">Powered by Unsplash High-Resolution Creative Commons</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-3 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                placeholder="Search high-res images (e.g. cross, open bible, mountain sunrise)..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {isLoading && (
                <div className="absolute right-3.5 top-3">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => performSearch(query)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Preset Theme Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_THEMES.map((theme) => (
              <button
                key={theme.label}
                type="button"
                onClick={() => handleSelectTheme(theme.query, theme.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTheme === theme.label
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-white/10">
          {isLoading && results.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs font-medium">Fetching high-res images from Unsplash...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
              <ImageIcon className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold text-white">No images found for "{query}"</p>
              <p className="text-xs text-slate-400">Try one of the preset theme chips above for instant high-res imagery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handleChoosePhoto(photo.url)}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-blue-500/20 text-left bg-slate-900"
                >
                  <img
                    src={photo.thumb}
                    alt={photo.description || 'Unsplash photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <span className="self-end px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold shadow flex items-center gap-1">
                      <Check className="w-3 h-3" /> Select
                    </span>
                    <p className="text-[10px] text-white/90 truncate font-medium">
                      📷 {photo.author}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any image to attach instantly</span>
          <span>{results.length} images available</span>
        </div>
      </div>
    </div>
  );
};
