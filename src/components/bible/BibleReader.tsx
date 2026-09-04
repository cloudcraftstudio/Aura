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
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  BookMarked,
  ArrowRight,
  Filter,
  Layers,
  X,
  Loader2
} from 'lucide-react';
import { BIBLE_BOOKS, getBooksByTestament, getBookMetadata } from '../../data/bibleBooks';
import {
  createPlayableAudioBlob,
  base64ToUint8Array,
  unlockAudioForMobile,
  fetchBibleTtsAudio,
  playSpeechSynthesisFallback
} from '../../utils/audioUtils';

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
  initialBook = 'Genesis',
  initialChapter = '1',
  initialVerse = '1',
  onOpenStudyBreakdown,
  onShareToFeed
}: BibleReaderProps) {
  // Navigation State
  const [selectedTestament, setSelectedTestament] = useState<'Old Testament' | 'New Testament'>('New Testament');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBook, setSelectedBook] = useState<string>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<string>(initialVerse);
  const [readerMode, setReaderMode] = useState<'read' | 'listen'>('read');

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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLoadingVerse, setAudioLoadingVerse] = useState<number | null>(null);
  const [currentPlayingVerseIndex, setCurrentPlayingVerseIndex] = useState<number>(0);
  const [autoAdvanceAudio, setAutoAdvanceAudio] = useState<boolean>(true);
  const [audioStatusMessage, setAudioStatusMessage] = useState<string>('Ready to Play');

  // Audio refs for HTML5 Audio element and Web Audio API fallback
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const preloadedAudioRef = useRef<Map<number, { url: string; bytes: Uint8Array; mimeType?: string }>>(new Map());
  const activeFetchPromiseRef = useRef<Map<number, Promise<{ url: string; bytes: Uint8Array; mimeType?: string } | null>>>(new Map());

  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      } catch (e) {
        console.warn('AudioContext creation error:', e);
      }
    }
    return audioContextRef.current;
  };

  const stopPlayback = () => {
    isPlayingRef.current = false;

    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.onended = null;
        htmlAudioRef.current.onerror = null;
        htmlAudioRef.current.pause();
        htmlAudioRef.current.currentTime = 0;
        htmlAudioRef.current.removeAttribute('src');
      } catch (e) {}
    }

    if (currentObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      } catch (e) {}
      currentObjectUrlRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch (e) {}
      try {
        sourceNodeRef.current.disconnect();
      } catch (e) {}
      sourceNodeRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    setIsSpeaking(false);
    setAudioLoadingVerse(null);
    setAudioStatusMessage('Ready to Play');
  };

  const playAudioWithWebAudio = async (bytes: Uint8Array, onEnded?: () => void): Promise<boolean> => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {}
      }

      const rawBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      let audioBuffer: AudioBuffer | null = null;
      try {
        // Slice copy so rawBuffer is never neutered/detached if decodeAudioData fails
        audioBuffer = await ctx.decodeAudioData(rawBuffer.slice(0));
      } catch (decodeErr) {
        // Fallback for raw PCM data
        try {
          const int16Array = new Int16Array(rawBuffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }
          audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
          audioBuffer.getChannelData(0).set(float32Array);
        } catch {}
      }

      if (!audioBuffer) return false;

      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.onended = null;
          sourceNodeRef.current.stop();
        } catch (e) {}
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {}
        sourceNodeRef.current = null;
      }

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      sourceNode.onended = () => {
        sourceNodeRef.current = null;
        if (onEnded && isPlayingRef.current) onEnded();
      };

      sourceNodeRef.current = sourceNode;
      sourceNode.start(0);
      return true;
    } catch (e) {
      console.warn('WebAudio playback error:', e);
      return false;
    }
  };

  // Pre-load upcoming verses in background so transitions are gapless and immune to autoplay restrictions
  const preloadVerseAudio = (verseIndex: number) => {
    if (!chapterData?.verses || verseIndex < 0 || verseIndex >= chapterData.verses.length) return;
    if (preloadedAudioRef.current.has(verseIndex)) return;
    if (activeFetchPromiseRef.current.has(verseIndex)) return;

    const targetVerse = chapterData.verses[verseIndex];
    if (!targetVerse) return;

    const passageText = `${selectedBook} chapter ${selectedChapter}, verse ${targetVerse.verse}: ${targetVerse.text}`;

    const fetchPromise = (async () => {
      try {
        const ttsResult = await fetchBibleTtsAudio(passageText);
        if (ttsResult && ttsResult.audio) {
          const bytes = base64ToUint8Array(ttsResult.audio);
          const playableBlob = createPlayableAudioBlob(bytes, ttsResult.mimeType);
          const url = URL.createObjectURL(playableBlob);
          const record = { url, bytes, mimeType: ttsResult.mimeType };
          preloadedAudioRef.current.set(verseIndex, record);
          return record;
        }
      } catch (e) {
        console.warn(`Failed to preload audio for verse ${targetVerse.verse}:`, e);
      } finally {
        activeFetchPromiseRef.current.delete(verseIndex);
      }
      return null;
    })();

    activeFetchPromiseRef.current.set(verseIndex, fetchPromise);
  };

  const playVerseAtIndex = async (verseIndex: number, shouldAutoAdvance: boolean = true) => {
    if (!chapterData || !chapterData.verses || chapterData.verses.length === 0) return;

    const safeIndex = Math.max(0, Math.min(verseIndex, chapterData.verses.length - 1));
    const targetVerse = chapterData.verses[safeIndex];
    if (!targetVerse) return;

    isPlayingRef.current = true;
    setCurrentPlayingVerseIndex(safeIndex);
    setIsSpeaking(true);

    const isAlreadyPreloaded = preloadedAudioRef.current.has(safeIndex);
    if (!isAlreadyPreloaded) {
      setAudioLoadingVerse(targetVerse.verse);
      setAudioStatusMessage(`Loading Verse ${targetVerse.verse} of ${chapterData.verses.length}...`);
    } else {
      setAudioLoadingVerse(null);
      setAudioStatusMessage(`Reading Verse ${targetVerse.verse} of ${chapterData.verses.length}`);
    }

    const passageText = `${selectedBook} chapter ${selectedChapter}, verse ${targetVerse.verse}: ${targetVerse.text}`;

    // Auto-scroll in "Read" mode to keep current verse visible without violent jumps
    if (readerMode === 'read') {
      setTimeout(() => {
        const el = document.getElementById(`verse-${targetVerse.verse}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }

    // Immediately trigger pre-loading for the NEXT verse so it's already in memory when this verse ends!
    if (shouldAutoAdvance && autoAdvanceAudio && safeIndex + 1 < chapterData.verses.length) {
      preloadVerseAudio(safeIndex + 1);
    }

    const handleNextVerse = () => {
      if (!isPlayingRef.current) return;
      if (shouldAutoAdvance && autoAdvanceAudio && safeIndex + 1 < chapterData.verses.length) {
        playVerseAtIndex(safeIndex + 1, true);
      } else {
        isPlayingRef.current = false;
        setIsSpeaking(false);
        setAudioLoadingVerse(null);
        setAudioStatusMessage(`Finished ${selectedBook} Chapter ${selectedChapter}`);
      }
    };

    try {
      // 1. Check preloaded cache first
      let preloaded = preloadedAudioRef.current.get(safeIndex);

      // 2. If in-flight, await the ongoing preload promise
      if (!preloaded && activeFetchPromiseRef.current.has(safeIndex)) {
        preloaded = (await activeFetchPromiseRef.current.get(safeIndex)) || undefined;
      }

      // 3. Fallback: fetch directly
      if (!preloaded) {
        const ttsResult = await fetchBibleTtsAudio(passageText);
        if (ttsResult && ttsResult.audio) {
          const bytes = base64ToUint8Array(ttsResult.audio);
          const playableBlob = createPlayableAudioBlob(bytes, ttsResult.mimeType);
          const url = URL.createObjectURL(playableBlob);
          preloaded = { url, bytes, mimeType: ttsResult.mimeType };
          preloadedAudioRef.current.set(safeIndex, preloaded);
        }
      }

      if (!isPlayingRef.current) return;

      if (preloaded && preloaded.url) {
        setAudioLoadingVerse(null);
        setAudioStatusMessage(`Reading Verse ${targetVerse.verse} of ${chapterData.verses.length}`);

        const { url: audioUrl, bytes } = preloaded;

        // Primary: HTML5 Audio
        try {
          const audioEl = htmlAudioRef.current;
          if (audioEl) {
            // Detach listeners before changing src to prevent spurious error callbacks
            audioEl.onended = null;
            audioEl.onerror = null;

            const previousUrl = currentObjectUrlRef.current;
            currentObjectUrlRef.current = audioUrl;
            audioEl.src = audioUrl;
            audioEl.volume = 1.0;

            audioEl.onended = () => {
              if (!isPlayingRef.current) return;
              handleNextVerse();
            };

            audioEl.onerror = async (err) => {
              console.warn('HTML5 audio error on verse', targetVerse.verse, err);
              if (!isPlayingRef.current) return;
              const played = await playAudioWithWebAudio(bytes, handleNextVerse);
              if (!played && isPlayingRef.current) {
                const spoke = playSpeechSynthesisFallback(passageText, handleNextVerse);
                if (!spoke && isPlayingRef.current) {
                  handleNextVerse();
                }
              }
            };

            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
              await playPromise;
            }

            // Cleanup previous URL if it was different and not currently cached for preloading
            if (previousUrl && previousUrl !== audioUrl) {
              let isCached = false;
              preloadedAudioRef.current.forEach(item => {
                if (item.url === previousUrl) isCached = true;
              });
              if (!isCached) {
                try {
                  URL.revokeObjectURL(previousUrl);
                } catch {}
              }
            }

            return;
          }
        } catch (htmlAudioErr) {
          console.warn('HTML5 audio play exception, falling back to WebAudio:', htmlAudioErr);
        }

        // Secondary fallback: Web Audio API
        if (isPlayingRef.current) {
          const webAudioSuccess = await playAudioWithWebAudio(bytes, handleNextVerse);
          if (webAudioSuccess) return;
        }
      }
    } catch (e) {
      console.warn('TTS fetch/play error:', e);
    }

    if (!isPlayingRef.current) return;

    // Tertiary Fallback: Native Device Speech Synthesis (ensures voice continues)
    setAudioLoadingVerse(null);
    setAudioStatusMessage(`Voice stream: Verse ${targetVerse.verse} of ${chapterData.verses.length}`);
    const spoke = playSpeechSynthesisFallback(passageText, handleNextVerse, () => {
      if (isPlayingRef.current) {
        handleNextVerse();
      }
    });

    if (!spoke && isPlayingRef.current) {
      if (shouldAutoAdvance && autoAdvanceAudio && safeIndex + 1 < chapterData.verses.length) {
        handleNextVerse();
      } else {
        isPlayingRef.current = false;
        setIsSpeaking(false);
        setAudioLoadingVerse(null);
        setAudioStatusMessage('Audio playback complete');
      }
    }
  };

  const toggleSpeechPlayback = async () => {
    // Synchronously unlock audio session in touch handler for mobile Chrome, Safari, and WebView
    unlockAudioForMobile(htmlAudioRef.current, audioContextRef.current);

    if (isSpeaking) {
      stopPlayback();
      return;
    }

    if (!chapterData || !chapterData.verses.length) return;

    // Start playback from current index (or selected verse if clicked)
    let startIndex = currentPlayingVerseIndex;
    if (selectedVerse) {
      const idx = chapterData.verses.findIndex(v => v.verse.toString() === selectedVerse);
      if (idx !== -1) startIndex = idx;
    }

    playVerseAtIndex(startIndex, true);
  };

  const playSingleVerse = async (verseNum: number, _verseText: string) => {
    unlockAudioForMobile(htmlAudioRef.current, audioContextRef.current);
    if (!chapterData || !chapterData.verses.length) return;
    const verseIdx = chapterData.verses.findIndex(v => v.verse === verseNum);
    if (verseIdx !== -1) {
      playVerseAtIndex(verseIdx, autoAdvanceAudio);
    }
  };

  const skipNextVerse = () => {
    unlockAudioForMobile(htmlAudioRef.current, audioContextRef.current);
    if (!chapterData || !chapterData.verses.length) return;
    if (currentPlayingVerseIndex + 1 < chapterData.verses.length) {
      playVerseAtIndex(currentPlayingVerseIndex + 1, true);
    }
  };

  const skipPrevVerse = () => {
    unlockAudioForMobile(htmlAudioRef.current, audioContextRef.current);
    if (!chapterData || !chapterData.verses.length) return;
    if (currentPlayingVerseIndex > 0) {
      playVerseAtIndex(currentPlayingVerseIndex - 1, true);
    }
  };

  useEffect(() => {
    return () => {
      stopPlayback();
      // Revoke any preloaded blob URLs
      preloadedAudioRef.current.forEach((item) => {
        try {
          URL.revokeObjectURL(item.url);
        } catch {}
      });
      preloadedAudioRef.current.clear();
      activeFetchPromiseRef.current.clear();
    };
  }, [selectedBook, selectedChapter]);

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
      fallbackChapter(book, chapter);
    } catch (err) {
      console.warn('Error loading chapter:', err);
      fallbackChapter(book, chapter);
    } finally {
      setLoadingChapter(false);
    }
  };

  const fallbackChapter = (book: string, chapter: string) => {
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

  // Listen for navigation events
  useEffect(() => {
    const handleNavigateBible = (e: Event) => {
      const customEvent = e as CustomEvent<{ reference: string }>;
      const reference = customEvent.detail?.reference;
      if (reference) {
        const match = reference.match(/^(\d?\s*[A-Za-z\s]+?)\s+(\d+):(\d+)/);
        if (match) {
          const book = match[1].trim();
          const chapter = match[2];
          const verse = match[3];
          setSelectedBook(book);
          setSelectedChapter(chapter);
          setSelectedVerse(verse);
        }
      }
    };
    window.addEventListener('navigate_bible_study', handleNavigateBible);
    return () => window.removeEventListener('navigate_bible_study', handleNavigateBible);
  }, []);

  // Auto-scroll to selected verse when chapter loads or verse changes
  useEffect(() => {
    if (chapterData && selectedVerse) {
      setTimeout(() => {
        const el = document.getElementById(`verse-${selectedVerse}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [chapterData, selectedVerse]);

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

  // Smart scripture parser for sermon follow-along
  const handleQuickJump = (input?: string) => {
    const text = (input || quickJumpInput).trim();
    if (!text) return;

    const regex = /^([1-3]?\s?[A-Za-z]+)\s*(\d+)?(?::(\d+))?$/i;
    const match = text.match(regex);

    if (match) {
      const bookQuery = match[1].trim().toLowerCase();
      const chapterQuery = match[2] || '1';
      const verseQuery = match[3] || '1';

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
      {/* Hidden audio element for mobile WebView / Safari audio unlock */}
      <audio ref={htmlAudioRef} playsInline preload="auto" className="hidden" />

      {/* Immersive Dwell-Style [ Listen | Read ] Switcher Pill */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center bg-slate-900/90 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-2xl">
          <button
            onClick={() => setReaderMode('listen')}
            className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
              readerMode === 'listen'
                ? 'bg-white text-slate-950 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Listen
          </button>
          <button
            onClick={() => setReaderMode('read')}
            className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
              readerMode === 'read'
                ? 'bg-white text-slate-950 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Read
          </button>
        </div>
      </div>
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
          <button
            onClick={handlePrevChapter}
            disabled={parseInt(selectedChapter, 10) <= 1}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-blue-600/30 disabled:opacity-30 disabled:hover:bg-black/40 border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Ch</span>
          </button>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>{selectedBook}</span>
              <span className="text-blue-400 font-serif">{selectedChapter}</span>
            </h2>
            <p className="text-xs text-blue-300/80 font-sans mt-0.5">
              {currentBookMeta?.author ? `Written by ${currentBookMeta.author}` : ''} • {selectedTestament}
            </p>
          </div>

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
          readerMode === 'listen' ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 sm:px-8 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 rounded-3xl border border-white/10 shadow-2xl space-y-6 my-4 max-w-2xl mx-auto w-full">
              {/* Album Art / Ambient Visualizer */}
              <div className="relative group w-full max-w-sm">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-full aspect-square bg-slate-900/95 rounded-3xl border border-white/15 flex flex-col items-center justify-center p-6 text-center shadow-2xl overflow-hidden backdrop-blur-xl">
                  {/* Subtle animated background circles when playing */}
                  {isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-48 h-48 rounded-full border border-blue-400 animate-ping" />
                    </div>
                  )}

                  <span className="text-[11px] uppercase tracking-widest text-blue-400 font-bold mb-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Aura Audio • Majestic Voice
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-1 tracking-tight">
                    {selectedBook}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">
                    Chapter {selectedChapter} • King James Stream
                  </p>

                  {/* Equalizer / Status indicator */}
                  <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10">
                    {isSpeaking ? (
                      <div className="flex items-end gap-1 h-3.5 px-0.5">
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3" />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3.5" />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2.5" />
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    <span className="text-xs text-slate-300 font-medium">
                      {audioStatusMessage}
                    </span>
                  </div>

                  {/* Currently Reading Verse Display */}
                  {chapterData.verses[currentPlayingVerseIndex] && (
                    <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 max-h-24 overflow-y-auto w-full text-center scrollbar-none">
                      <span className="text-[11px] font-bold text-blue-300 block mb-0.5">
                        Verse {chapterData.verses[currentPlayingVerseIndex].verse}
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-3 italic font-serif leading-relaxed">
                        "{chapterData.verses[currentPlayingVerseIndex].text}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-6 w-full pt-1">
                <button
                  onClick={skipPrevVerse}
                  disabled={currentPlayingVerseIndex <= 0}
                  title="Previous Verse"
                  className="w-12 h-12 rounded-full bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all border border-white/10 shadow-lg active:scale-95"
                >
                  <SkipBack className="w-5 h-5 text-slate-200" />
                </button>

                <button
                  onClick={toggleSpeechPlayback}
                  title={isSpeaking ? "Pause Playback" : "Start Listening"}
                  className="w-20 h-20 rounded-full bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  {audioLoadingVerse !== null ? (
                    <Loader2 className="w-8 h-8 animate-spin text-slate-950" />
                  ) : isSpeaking ? (
                    <Pause className="w-8 h-8 fill-current text-slate-950" />
                  ) : (
                    <Play className="w-8 h-8 fill-current text-slate-950 ml-1" />
                  )}
                </button>

                <button
                  onClick={skipNextVerse}
                  disabled={currentPlayingVerseIndex >= chapterData.verses.length - 1}
                  title="Next Verse"
                  className="w-12 h-12 rounded-full bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all border border-white/10 shadow-lg active:scale-95"
                >
                  <SkipForward className="w-5 h-5 text-slate-200" />
                </button>
              </div>

              {/* Progress & Chapter Verse Navigation */}
              <div className="w-full max-w-sm flex items-center justify-between text-xs text-slate-400 px-2">
                <span>Verse {currentPlayingVerseIndex + 1} of {chapterData.verses.length}</span>
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={autoAdvanceAudio}
                    onChange={(e) => setAutoAdvanceAudio(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800 cursor-pointer"
                  />
                  <span>Auto-advance verses</span>
                </label>
              </div>

              {/* Quick Verse Jump Pills in Listen Mode */}
              <div className="w-full max-w-md pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Jump to Verse
                  </span>
                  <span className="text-[11px] text-blue-400 font-mono">
                    {selectedBook} {selectedChapter}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                  {chapterData.verses.map((v, idx) => {
                    const isCurrent = currentPlayingVerseIndex === idx;
                    const isPlaying = isCurrent && isSpeaking;
                    return (
                      <button
                        key={v.verse}
                        onClick={() => {
                          unlockAudioForMobile(htmlAudioRef.current, audioContextRef.current);
                          stopPlayback();
                          playVerseAtIndex(idx, true);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          isPlaying
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md scale-105 ring-2 ring-emerald-400'
                            : isCurrent
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/5'
                        }`}
                      >
                        {v.verse}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
                Optimized for mobile web & Android app background streaming with zero lag.
              </p>
            </div>
          ) : (
            <div className={`space-y-4 leading-relaxed ${readerFontClass}`} style={{ fontSize: `${fontSize}px` }}>
            {chapterData.verses.map(item => {
              const isSelected = selectedVerse === item.verse.toString();
              const isActionOpen = activeVerseAction === item.verse;
              const isBookmarked = bookmarks.includes(`${selectedBook} ${selectedChapter}:${item.verse}`);
              const isCopied = copiedVerseNum === item.verse;
              const isLoadingAudio = audioLoadingVerse === item.verse;
              const isCurrentPlayingAudio = isSpeaking && currentPlayingVerseIndex === item.verse - 1;

              return (
                <div
                  key={item.verse}
                  id={`verse-${item.verse}`}
                  className={`group relative rounded-xl p-3 sm:p-4 transition-all duration-300 ${
                    isCurrentPlayingAudio
                      ? 'bg-blue-600/25 border border-blue-400/80 shadow-xl ring-2 ring-blue-500/40'
                      : isSelected
                        ? 'bg-blue-600/20 border border-blue-400/60 shadow-lg ring-1 ring-blue-500/30'
                        : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        setSelectedVerse(item.verse.toString());
                        setActiveVerseAction(isActionOpen ? null : item.verse);
                      }}
                      className={`text-xs font-sans font-extrabold px-2 py-1 rounded-lg transition-all flex-shrink-0 mt-0.5 ${
                        isCurrentPlayingAudio
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg animate-pulse ring-2 ring-blue-300/40'
                          : isSelected
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-black/40 text-blue-400/80 group-hover:bg-blue-500/20 group-hover:text-blue-300'
                      }`}
                    >
                      {item.verse}
                    </button>

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

                  {(isSelected || isActionOpen) && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-sans text-xs animate-in fade-in duration-150">
                      <span className="font-bold text-blue-300">
                        {selectedBook} {selectedChapter}:{item.verse}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (isCurrentPlayingAudio) {
                              stopPlayback();
                            } else {
                              playSingleVerse(item.verse, item.text);
                            }
                          }}
                          title={isCurrentPlayingAudio ? "Pause Audio" : "Listen with Audio Stream"}
                          className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                            isCurrentPlayingAudio
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md animate-pulse'
                              : 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border-blue-500/30'
                          }`}
                        >
                          {isCurrentPlayingAudio ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className={`w-3.5 h-3.5 ${isLoadingAudio ? 'animate-bounce' : ''}`} />
                          )}
                          <span className="hidden sm:inline">{isCurrentPlayingAudio ? 'Playing' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyVerse(item.verse, item.text)}
                          title="Copy verse to clipboard"
                          className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-blue-600 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

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

                        {onOpenStudyBreakdown && (
                          <button
                            onClick={() => onOpenStudyBreakdown(selectedBook, selectedChapter, item.verse.toString())}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all flex items-center gap-1 shadow"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Study</span>
                          </button>
                        )}

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
          )
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

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {pickerStep === 'book' ? (
                <>
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
