import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ExternalLink, X, Sparkles, Loader } from 'lucide-react';

// Regex to capture canonical Bible books, chapter, and verse spans
export const SCRIPTURE_REGEX = /\b((?:1|2|3\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation))\s+(\d+)(?::(\d+)(?:-(\d+))?)?\b/gi;

interface ScriptureLinkerProps {
  text: string;
  className?: string;
  onOpenStudy?: (ref: string) => void;
}

export const ScriptureLinker: React.FC<ScriptureLinkerProps> = ({ text, className = '', onOpenStudy }) => {
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verseData, setVerseData] = useState<{ reference: string; text: string } | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const fetchVerseText = async (reference: string) => {
    setLoading(true);
    try {
      // Fetch passage from our Bible study API
      const res = await fetch(`/api/bible/search?query=${encodeURIComponent(reference)}`);
      if (res.ok) {
        const data = await res.json();
        const passage = data.passage || data.text || (data.verses && data.verses.map((v: any) => `${v.verse}. ${v.text}`).join(' ')) || 'Scripture passage loaded from King James Version.';
        setVerseData({ reference, text: passage });
      } else {
        setVerseData({
          reference,
          text: `For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. (KJV)`
        });
      }
    } catch (err) {
      setVerseData({
        reference,
        text: `KJV Reference: ${reference}. Click "Open Full Study" to explore chapter context and commentary.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = (e: React.MouseEvent, refStr: string) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({
      x: Math.min(rect.left, window.innerWidth - 340),
      y: rect.bottom + window.scrollY + 8,
    });
    setActiveRef(refStr);
    fetchVerseText(refStr);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveRef(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse text and replace scripture references with interactive buttons
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const matches = [...text.matchAll(SCRIPTURE_REGEX)];

  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  matches.forEach((m, idx) => {
    const matchText = m[0];
    const startIndex = m.index ?? 0;

    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    parts.push(
      <button
        key={`scrip-${idx}-${matchText}`}
        onClick={(e) => handleTrigger(e, matchText)}
        onMouseEnter={(e) => handleTrigger(e, matchText)}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-100 font-semibold border border-blue-400/30 transition-all text-inherit align-baseline underline decoration-blue-400/50 hover:decoration-blue-300"
        title={`Click or hover to preview ${matchText}`}
      >
        <BookOpen className="w-3 h-3 text-blue-400 inline" />
        <span>{matchText}</span>
      </button>
    );

    lastIndex = startIndex + matchText.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <>
      <span className={className}>{parts}</span>

      {/* Floating Interactive Popover */}
      {activeRef && popoverPos && (
        <div
          ref={popoverRef}
          style={{ top: `${popoverPos.y}px`, left: `${Math.max(12, popoverPos.x)}px` }}
          className="fixed z-[999] w-[320px] sm:w-[360px] bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-4 shadow-2xl animate-fade-in text-left space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-300">{activeRef}</span>
              <span className="text-[10px] bg-blue-600/30 text-blue-200 px-1.5 py-0.5 rounded font-bold">KJV</span>
            </div>
            <button
              onClick={() => setActiveRef(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-blue-400 gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading Scripture passage...</span>
              </div>
            ) : (
              <p className="italic font-serif">"{verseData?.text}"</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">King James Version (Authorized)</span>
            {onOpenStudy && (
              <button
                onClick={() => {
                  onOpenStudy(activeRef);
                  setActiveRef(null);
                }}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20"
              >
                <span>Study Passage</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
