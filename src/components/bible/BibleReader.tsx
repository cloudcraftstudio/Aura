import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Share2,
  Sparkles,
  SlidersHorizontal,
  History,
  Play,
  RotateCcw,
  Zap,
  BookMarked,
  ArrowRight,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { BIBLE_BOOKS, getBooksByTestament, getBookMetadata } from '../../data/bibleBooks';

interface BibleVerse {
  verse: number;
  text: string;
}

interface BibleChapterData {
  reference: string;
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

interface SearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleReaderProps {
  initialBook?: string;
  initialChapter?: string;
  initialVerse?: string;
  onOpenStudyBreakdown?: (book: string, chapter: string, verse: string) => void;
  onShareToFeed?: (verseRef: string, passageText: string) => void;
}

export function BibleReader({
  initialBook = 'John',
  initialChapter = '3',
  initialVerse = '16',
  onOpenStudyBreakdown,
  onShareToFeed
}: BibleReaderProps) {
  // Navigation State
  const [selectedTestament, setSelectedTestament] = useState<'Old Testament' | 'New Testament'>('New Testament');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBook, setSelectedBook] = useState<string>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<string>(initialVerse);

  // Chapter Content & Loading
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [loadingChapter, setLoadingChapter] = useState<boolean>(false);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);

  // View & Modals
  const [isBookPickerOpen, setIsBookPickerOpen] = useState<boolean>(false);
  const [pickerStep, setPickerStep] = useState<'book' | 'chapter' | 'verse'>('book');
  const [tempSelectedBook, setTempSelectedBook] = useState<string>(initialBook);
  const [tempSelectedChapter, setTempSelectedChapter] = useState<string>(initialChapter);

  // Search & Church Follow-Along
  const [quickJumpInput, setQuickJumpInput] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Sermon & Church History
  const [sermonHistory, setSermonHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_bible_sermon_history');
      return saved ? JSON.parse(saved) : ['John 3:16', 'Romans 8:28', 'Psalm 23:1', 'Philippians 4:13'];
    } catch {
      return ['John 3:16', 'Romans 8:28', 'Psalm 23:1'];
    }
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_bible_bookmarks');
      return saved ? JSON.parse(saved) : ['John 3:16', 'Psalm 23:1', 'Romans 8:28'];
    } catch {
      return [];
    }
  });

  // Reading Experience Preferences
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aura_bible_font_size');
      return saved ? parseInt(saved, 10) : 19;
    } catch {
      return 19;
    }
  });
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    try {
      const saved = localStorage.getItem('aura_bible_font_family');
      return saved === 'sans' ? 'sans' : 'serif';
    } catch {
      return 'serif';
    }
  });
  const [themeMode, setThemeMode] = useState<'dark' | 'navy' | 'parchment' | 'black'>(() => {
    try {
      const saved = localStorage.getItem('aura_bible_theme');
      return (saved as any) || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [activeVerseAction, setActiveVerseAction] = useState<number | null>(null);

  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState<boolean>(true);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioLoadingVerse, setAudioLoadingVerse] = useState<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Bible book lists
  const oldTestamentBooks = getBooksByTestament('Old Testament');
  const newTestamentBooks = getBooksByTestament('New Testament');
  const currentBooks = selectedTestament === 'Old Testament' ? oldTestamentBooks : newTestamentBooks;

  // Filter books by category
  const categories = selectedTestament === 'Old Testament'
    ? ['All', 'Law', 'History', 'Poetry', 'Wisdom', 'Prophecy']
    : ['All', 'Gospel', 'History', 'Epistle', 'Prophecy'];

  const filteredBooks = selectedCategory === 'All'
    ? currentBooks
    : currentBooks.filter(b => b.category === selectedCategory);

  const currentBookMeta = getBookMetadata(selectedBook);
  const totalChaptersInCurrentBook = currentBookMeta?.chapters || 1;

  // Save history on changes
  const addToHistory = (ref: string) => {
    setSermonHistory(prev => {
      const filtered = prev.filter(r => r !== ref);
      const next = [ref, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('aura_bible_sermon_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle Bookmark
  const toggleBookmark = (ref: string) => {
    setBookmarks(prev => {
      const exists = prev.includes(ref);
      const next = exists ? prev.filter(r => r !== ref) : [...prev, ref];
      try {
        localStorage.setItem('aura_bible_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Fetch chapter text from backend
  const fetchChapter = async (book: string, chapter: string) => {
    setLoadingChapter(true);
    try {
      const res = await fetch(`/api/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.verses)) {
          setChapterData(data);
          addToHistory(`${book} ${chapter}:${selectedVerse || '1'}`);
          return;
        }
      }
      // Fallback if network or error
      fallbackChapter(book, chapter);
    } catch (err) {
      console.warn('Error loading chapter:', err);
      fallbackChapter(book, chapter);
    } finally {
      setLoadingChapter(false);
    }
  };

  const fallbackChapter = (book: string, chapter: string) => {
    const meta = getBookMetadata(book);
    const verses: BibleVerse[] = [
      { verse: 1, text: `The sacred book of ${book}, chapter ${chapter}.` },
      { verse: 2, text: `Thy word is a lamp unto my feet, and a light unto my path.` },
      { verse: 3, text: `For the word of God is quick, and powerful, and sharper than any twoedged sword.` },
      { verse: 4, text: `All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:` },
      { verse: 5, text: `That the man of God may be perfect, throughly furnished unto all good works.` }
    ];
    setChapterData({
      reference: `${book} ${chapter}`,
      book,
      chapter: parseInt(chapter, 10),
      verses
    });
  };

  // Initial load
  useEffect(() => {
    fetchChapter(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter]);

  // Navigate to previous chapter
  const handlePrevChapter = () => {
    const ch = parseInt(selectedChapter, 10);
    if (ch > 1) {
      setSelectedChapter((ch - 1).toString());
      setSelectedVerse('1');
    }
  };

  // Navigate to next chapter
  const handleNextChapter = () => {
    const ch = parseInt(selectedChapter, 10);
    if (ch < totalChaptersInCurrentBook) {
      setSelectedChapter((ch + 1).toString());
      setSelectedVerse('1');
    }
  };

  // Smart scripture parser for sermon follow-along (e.g. "John 3:16", "Rom 8", "Psalm 23")
  const handleQuickJump = (input?: string) => {
    const text = (input || quickJumpInput).trim();
    if (!text) return;

    // Match book, chapter, and optional verse
    // Examples: "1 John 3:16", "John 3:16", "Genesis 1", "Rom 8", "1 Cor 13:4"
    const regex = /^([1-3]?\s?[A-Za-z]+)\s*(\d+)?(?::(\d+))?$/i;
    const match = text.match(regex);

    if (match) {
      const bookQuery = match[1].trim().toLowerCase();
      const chapterQuery = match[2] || '1';
      const verseQuery = match[3] || '1';

      // Find matching book in our 66 books
      const allBooks = Object.keys(BIBLE_BOOKS);
      const foundBook = allBooks.find(b => {
        const bLower = b.toLowerCase();
        return bLower === bookQuery || bLower.startsWith(bookQuery);
      });

      if (foundBook) {
        const meta = getBookMetadata(foundBook);
        const validChapter = Math.min(parseInt(chapterQuery, 10) || 1, meta.chapters).toString();
        setSelectedTestament(meta.testament as any);
        setSelectedBook(foundBook);
        setSelectedChapter(validChapter);
        setSelectedVerse(verseQuery);
        setQuickJumpInput('');
        setIsBookPickerOpen(false);
        setIsSearchActive(false);
        return;
      }
    }

    // If not a strict reference, trigger keyword search
    handleSearch(text);
  };

  // Full Text Search
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setIsSearchActive(true);
    try {
      const res = await fetch(`/api/bible/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Copy verse to clipboard
  const handleCopyVerse = (verseNum: number, verseText: string) => {
    const fullCitation = `"${verseText}" — ${selectedBook} ${selectedChapter}:${verseNum} (KJV)`;
    navigator.clipboard.writeText(fullCitation);
    setCopiedVerseNum(verseNum);
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  // King James TTS Audio Player
  const handlePlayVerseAudio = async (verseNum: number, verseText: string) => {
    if (isPlayingAudio && activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setIsPlayingAudio(false);
      setAudioLoadingVerse(null);
      return;
    }

    setAudioLoadingVerse(verseNum);
    try {
      const res = await fetch('/api/bible/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${selectedBook}, chapter ${selectedChapter}, verse ${verseNum}. ${verseText}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioData) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
          activeAudioRef.current = audio;
          audio.onended = () => {
            setIsPlayingAudio(false);
            setAudioLoadingVerse(null);
          };
          await audio.play();
          setIsPlayingAudio(true);
        }
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    } finally {
      setAudioLoadingVerse(null);
    }
  };

  // Theme styling configurations
  const themeClasses = {
    dark: 'bg-[#0b1022] text-slate-100 border-blue-500/20',
    navy: 'bg-[#07132a] text-blue-50 border-blue-400/30',
    parchment: 'bg-[#181512] text-[#e8ded1] border-amber-900/40',
    black: 'bg-black text-gray-100 border-neutral-800'
  }[themeMode];

  const readerFontClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <div className="w-full space-y-4">
      {/* Top Header & Church Quick-Jump Bar */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900/80 border border-blue-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Jump Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={quickJumpInput}
              onChange={e => setQuickJumpInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleQuickJump();
              }}
              placeholder='Follow sermon (e.g. "John 3:16", "Romans 8", "faith")...'
              className="w-full bg-black/50 border border-blue-500/40 focus:border-blue-400 rounded-xl pl-10 pr-24 py-2.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              onClick={() => handleQuickJump()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Jump</span>
            </button>
          </div>

          {/* Quick Book / Chapter Selector Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempSelectedBook(selectedBook);
                setTempSelectedChapter(selectedChapter);
                setPickerStep('book');
                setIsBookPickerOpen(true);
              }}
              className="flex-1 md:flex-none flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 rounded-xl text-white font-bold text-sm transition-all shadow"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="truncate">{selectedBook} {selectedChapter}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-300" />
            </button>

            {/* Reading Preferences Toggle */}
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              title="Reading Preferences"
              className={`p-2.5 rounded-xl border transition-all ${
                showPreferences
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-black/40 text-blue-300 border-blue-500/30 hover:bg-blue-900/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sermon Follow-Along Recent History Chips */}
        {sermonHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-500/20 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-blue-300/70 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px]">
              <History className="w-3 h-3" />
              <span>Sermon Trail:</span>
            </span>
            {sermonHistory.map((item, idx) => (
              <button
                key={`${item}-${idx}`}
                onClick={() => handleQuickJump(item)}
                className="px-2.5 py-1 bg-black/40 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-full text-blue-200 text-xs whitespace-nowrap transition-all flex-shrink-0"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reading Customizer Drawer (Font, Size, Contrast Theme) */}
      {showPreferences && (
        <div className="bg-black/70 border border-blue-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300">Size:</span>
              <div className="flex items-center gap-1 bg-blue-950/60 rounded-xl p-1 border border-blue-500/30">
                <button
                  onClick={() => {
                    const next = Math.max(14, fontSize - 2);
                    setFontSize(next);
                    try { localStorage.setItem('aura_bible_font_size', next.toString()); } catch {}
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-200 hover:bg-blue-800/50"
                >
                  A-
                </button>
                <span className="px-2 text-xs font-bold text-white">{fontSize}px</span>
                <button
                  onClick={() => {
                    const next = Math.min(32, fontSize + 2);
                    setFontSize(next);
                    try { localStorage.setItem('aura_bible_font_size', next.toString()); } catch {}
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-200 hover:bg-blue-800/50"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Font Family Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300">Font:</span>
              <div className="flex bg-blue-950/60 rounded-xl p-1 border border-blue-500/30">
                <button
                  onClick={() => {
                    setFontFamily('serif');
                    try { localStorage.setItem('aura_bible_font_family', 'serif'); } catch {}
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                    fontFamily === 'serif' ? 'bg-blue-600 text-white shadow' : 'text-blue-300 hover:text-white'
                  }`}
                >
                  Classical Serif
                </button>
                <button
                  onClick={() => {
                    setFontFamily('sans');
                    try { localStorage.setItem('aura_bible_font_family', 'sans'); } catch {}
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all ${
                    fontFamily === 'sans' ? 'bg-blue-600 text-white shadow' : 'text-blue-300 hover:text-white'
                  }`}
                >
                  Modern Clean
                </button>
              </div>
            </div>

            {/* Reading Contrast Theme */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300">Contrast:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'dark', label: 'Dark', bg: 'bg-[#0b1022]' },
                  { id: 'navy', label: 'Navy', bg: 'bg-[#07132a]' },
                  { id: 'parchment', label: 'Warm', bg: 'bg-[#181512]' },
                  { id: 'black', label: 'OLED', bg: 'bg-black' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setThemeMode(t.id as any);
                      try { localStorage.setItem('aura_bible_theme', t.id); } catch {}
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      themeMode === t.id
                        ? 'border-blue-400 ring-2 ring-blue-500/50 text-white ' + t.bg
                        : 'border-white/10 text-gray-400 hover:text-white ' + t.bg
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Testament & All 66 Books Toggle Navigation Card */}
      <div className="bg-gradient-to-br from-[#0c1432] via-[#091024] to-[#040817] border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Testament Toggle Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-blue-500/20">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-400" />
                <span>Holy Scriptures</span>
                <span className="text-xs font-normal text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                  KJV
                </span>
              </h3>
              <button
                onClick={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
                className="sm:hidden p-1.5 bg-blue-900/40 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-600/40"
              >
                {isLibraryCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            {!isLibraryCollapsed && (
              <p className="text-xs text-blue-300/80 mt-1">
                Browse all 66 canonical books or open any chapter instantly
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Old Testament / New Testament High-Contrast Toggle Switch */}
            {!isLibraryCollapsed && (
              <div className="flex bg-black/60 p-1 rounded-xl border border-blue-500/40 self-start sm:self-auto shadow-inner">
                <button
                  onClick={() => {
                    setSelectedTestament('Old Testament');
                    setSelectedCategory('All');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    selectedTestament === 'Old Testament'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg ring-1 ring-amber-400/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>Old</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">39</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTestament('New Testament');
                    setSelectedCategory('All');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    selectedTestament === 'New Testament'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-1 ring-blue-400/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>New</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">27</span>
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
              className="hidden sm:flex p-1.5 bg-blue-900/40 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-600/40"
            >
              {isLibraryCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!isLibraryCollapsed && (
          <>
            {/* Biblical Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3 text-blue-400" />
                <span>Section:</span>
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-black/40 text-blue-200/80 hover:bg-blue-900/40 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* All Books Display Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
              {filteredBooks.map(book => {
                const isCurrent = selectedBook === book.name;
                return (
                  <button
                    key={book.name}
                    onClick={() => {
                      setSelectedBook(book.name);
                      setSelectedChapter('1');
                      setSelectedVerse('1');
                      // Auto-collapse after selection on mobile
                      if (window.innerWidth < 768) {
                        setIsLibraryCollapsed(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                      isCurrent
                        ? 'bg-blue-600/40 border-blue-400 text-white shadow-lg ring-2 ring-blue-500/40'
                        : 'bg-black/30 hover:bg-blue-950/40 border-blue-500/20 hover:border-blue-400/60 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold truncate group-hover:text-blue-300 transition-colors">
                        {book.name}
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                        {book.chapters} ch
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="truncate">{book.category}</span>
                      <span className="text-blue-400/80 font-mono group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Search Results Overlay */}
      {isSearchActive && (
        <div className="bg-black/90 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              <span>Search Results for "{searchQuery || quickJumpInput}"</span>
              <span className="text-xs text-blue-300 font-mono">({searchResults.length} verses found)</span>
            </h4>
            <button
              onClick={() => setIsSearchActive(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSearching ? (
            <div className="py-8 text-center text-blue-300 text-sm animate-pulse">
              Searching the King James Scriptures...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-sm">
              No matching verses found. Try searching another keyword like "grace", "love", "salvation", or "peace".
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedBook(res.book);
                    setSelectedChapter(res.chapter.toString());
                    setSelectedVerse(res.verse.toString());
                    setIsSearchActive(false);
                  }}
                  className="p-3 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 hover:border-blue-400 rounded-xl cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                    <span>{res.reference}</span>
                    <span className="text-[10px] text-blue-400">Open Passage →</span>
                  </div>
                  <p className="text-xs text-gray-200 line-clamp-2">
                    {res.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chapter Reader Container */}
      <div className={`rounded-2xl border p-5 sm:p-7 shadow-2xl transition-colors ${themeClasses}`}>
        {/* Reader Navigation Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          {/* Previous Chapter Button */}
          <button
            onClick={handlePrevChapter}
            disabled={parseInt(selectedChapter, 10) <= 1}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-blue-600/30 disabled:opacity-30 disabled:hover:bg-black/40 border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Ch</span>
          </button>

          {/* Active Book & Chapter Heading */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>{selectedBook}</span>
              <span className="text-blue-400 font-serif">{selectedChapter}</span>
            </h2>
            <p className="text-xs text-blue-300/80 font-sans mt-0.5">
              {currentBookMeta?.author ? `Written by ${currentBookMeta.author}` : ''} • {selectedTestament}
            </p>
          </div>

          {/* Next Chapter Button */}
          <button
            onClick={handleNextChapter}
            disabled={parseInt(selectedChapter, 10) >= totalChaptersInCurrentBook}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-blue-600/30 disabled:opacity-30 disabled:hover:bg-black/40 border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next Ch</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Verses Quick Chips */}
        {currentBookMeta?.featured?.verses && currentBookMeta.featured.verses.length > 0 && (
          <div className="mb-4 p-2.5 bg-black/30 rounded-xl border border-white/5 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-amber-400/90 font-bold flex items-center gap-1 flex-shrink-0 text-[11px]">
              <Sparkles className="w-3 h-3" />
              <span>Key Passages:</span>
            </span>
            {currentBookMeta.featured.verses.map(v => (
              <button
                key={v}
                onClick={() => {
                  const [ch, vs] = v.split(':');
                  setSelectedChapter(ch);
                  setSelectedVerse(vs.split('-')[0]);
                }}
                className="px-2.5 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border border-blue-500/30 text-xs whitespace-nowrap transition-colors flex-shrink-0"
              >
                {selectedBook} {v}
              </button>
            ))}
          </div>
        )}

        {/* Verse by Verse Reader */}
        {loadingChapter ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-blue-300 animate-pulse font-sans">
              Loading {selectedBook} {selectedChapter} Scripture...
            </p>
          </div>
        ) : chapterData?.verses && chapterData.verses.length > 0 ? (
          <div className={`space-y-4 leading-relaxed ${readerFontClass}`} style={{ fontSize: `${fontSize}px` }}>
            {chapterData.verses.map(item => {
              const isSelected = selectedVerse === item.verse.toString();
              const isActionOpen = activeVerseAction === item.verse;
              const isBookmarked = bookmarks.includes(`${selectedBook} ${selectedChapter}:${item.verse}`);
              const isCopied = copiedVerseNum === item.verse;
              const isLoadingAudio = audioLoadingVerse === item.verse;

              return (
                <div
                  key={item.verse}
                  id={`verse-${item.verse}`}
                  className={`group relative rounded-xl p-3 sm:p-4 transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-400/60 shadow-lg ring-1 ring-blue-500/30'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Verse Number Indicator */}
                    <button
                      onClick={() => {
                        setSelectedVerse(item.verse.toString());
                        setActiveVerseAction(isActionOpen ? null : item.verse);
                      }}
                      className={`text-xs font-sans font-extrabold px-2 py-1 rounded-lg transition-all flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-black/40 text-blue-400/80 group-hover:bg-blue-500/20 group-hover:text-blue-300'
                      }`}
                    >
                      {item.verse}
                    </button>

                    {/* Verse Text */}
                    <div
                      onClick={() => {
                        setSelectedVerse(item.verse.toString());
                        setActiveVerseAction(isActionOpen ? null : item.verse);
                      }}
                      className="flex-1 cursor-pointer select-text"
                    >
                      <span className="text-inherit">
                        {item.text}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Action Toolbar on Tap or Selected */}
                  {(isSelected || isActionOpen) && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-sans text-xs animate-in fade-in duration-150">
                      <span className="font-bold text-blue-300">
                        {selectedBook} {selectedChapter}:{item.verse}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Audio TTS */}
                        <button
                          onClick={() => handlePlayVerseAudio(item.verse, item.text)}
                          title="Listen with King James Voice"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isLoadingAudio ? 'animate-bounce' : ''}`} />
                          <span className="hidden sm:inline">Listen</span>
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopyVerse(item.verse, item.text)}
                          title="Copy verse to clipboard"
                          className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-blue-600 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => toggleBookmark(`${selectedBook} ${selectedChapter}:${item.verse}`)}
                          title="Save Bookmark"
                          className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                            isBookmarked
                              ? 'bg-amber-600 text-white border-amber-400'
                              : 'bg-black/40 hover:bg-amber-600/40 text-gray-300 hover:text-white border-white/10'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Save</span>
                        </button>

                        {/* Deep Study Breakdown */}
                        {onOpenStudyBreakdown && (
                          <button
                            onClick={() => onOpenStudyBreakdown(selectedBook, selectedChapter, item.verse.toString())}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Study</span>
                          </button>
                        )}

                        {/* Share to Aura Social Feed */}
                        {onShareToFeed && (
                          <button
                            onClick={() => onShareToFeed(`${selectedBook} ${selectedChapter}:${item.verse}`, item.text)}
                            title="Share to Aura Feed"
                            className="p-1.5 rounded-lg bg-black/40 hover:bg-blue-600 text-gray-300 hover:text-white border border-white/10 transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 font-sans">
            No verses found for this chapter.
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handlePrevChapter}
            disabled={parseInt(selectedChapter, 10) <= 1}
            className="px-4 py-2.5 rounded-xl bg-black/40 hover:bg-blue-600/40 disabled:opacity-30 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1.5 text-xs text-blue-300/70 hover:text-blue-200 transition-colors"
          >
            ↑ Back to Top
          </button>

          <button
            onClick={handleNextChapter}
            disabled={parseInt(selectedChapter, 10) >= totalChaptersInCurrentBook}
            className="px-4 py-2.5 rounded-xl bg-black/40 hover:bg-blue-600/40 disabled:opacity-30 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Interactive Modal Book & Chapter Picker */}
      {isBookPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1022] border border-blue-500/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-blue-500/30 flex items-center justify-between bg-blue-950/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="font-extrabold text-white text-base">Select Scripture</span>
                <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                  {pickerStep === 'book' ? 'Step 1: Choose Book' : `Step 2: Choose Chapter (${tempSelectedBook})`}
                </span>
              </div>

              <button
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {pickerStep === 'book' ? (
                <>
                  {/* Testament Switch */}
                  <div className="flex bg-black/60 p-1 rounded-xl border border-blue-500/30">
                    <button
                      onClick={() => setSelectedTestament('Old Testament')}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                        selectedTestament === 'Old Testament'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Old Testament (39)
                    </button>
                    <button
                      onClick={() => setSelectedTestament('New Testament')}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                        selectedTestament === 'New Testament'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      New Testament (27)
                    </button>
                  </div>

                  {/* Book Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {currentBooks.map(b => (
                      <button
                        key={b.name}
                        onClick={() => {
                          setTempSelectedBook(b.name);
                          setPickerStep('chapter');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          tempSelectedBook === b.name
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-black/40 hover:bg-blue-950/60 border-blue-500/20 text-gray-200'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{b.name}</div>
                        <div className="text-[10px] text-blue-300/80">{b.chapters} chapters</div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Back to Books & Chapter Numbers Grid */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPickerStep('book')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>← Back to Books</span>
                    </button>
                    <span className="font-bold text-white text-sm">{tempSelectedBook}</span>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {Array.from({ length: getBookMetadata(tempSelectedBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                      <button
                        key={ch}
                        onClick={() => {
                          setSelectedBook(tempSelectedBook);
                          setSelectedChapter(ch.toString());
                          setSelectedVerse('1');
                          setIsBookPickerOpen(false);
                        }}
                        className="py-2.5 rounded-xl bg-black/40 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-400 text-white font-bold text-xs transition-all shadow text-center"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
