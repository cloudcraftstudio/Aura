import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';

interface BiblePopoverProps {
  reference: string;
  children: React.ReactNode;
}

export const BiblePopover: React.FC<BiblePopoverProps> = ({ reference, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [excerpt, setExcerpt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  let timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateRect = () => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateRect();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateRect();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch excerpt when opened
  useEffect(() => {
    if (isOpen && !excerpt && !loading) {
      const fetchVerse = async () => {
        setLoading(true);
        try {
          const match = reference.match(/^(\d?\s*[A-Za-z\s]+?)\s+(\d+):(\d+)/);
          if (match) {
            const book = match[1].trim();
            const chapter = match[2];
            const verse = match[3];
            
            const res = await fetch(`/api/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`);
            if (res.ok) {
              const data = await res.json();
              const verseData = data.verses?.find((v: any) => v.verse === parseInt(verse));
              if (verseData) {
                setExcerpt(`"${verseData.text}"`);
              } else {
                setExcerpt('Open Scripture study module to read this and related passages in depth.');
              }
            }
          }
        } catch (e) {
          setExcerpt('Open Scripture study module to read this and related passages in depth.');
        } finally {
          setLoading(false);
        }
      };
      fetchVerse();
    }
  }, [isOpen, reference, excerpt, loading]);

  const navigateToBible = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'bible' } }));
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('switch_study_tab', { detail: { tab: 'study' } }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate_bible_study', { detail: { reference } }));
      }, 50);
    }, 50);
    
    setIsOpen(false);
  };

  return (
    <>
      <span 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        ref={triggerRef}
      >
        <span className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400 transition-all">
          {children}
        </span>
      </span>

      {isOpen && rect && createPortal(
        <div 
          className="fixed z-[99999] pointer-events-auto"
          style={{
            top: rect.top - 8,
            left: rect.left + rect.width / 2,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={popoverRef}
        >
          <div className="w-64 p-3 bg-slate-900 border border-amber-500/20 rounded-xl shadow-xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{reference}</h4>
                <div className="text-[11px] text-slate-300 italic leading-snug mb-3 min-h-[40px]">
                  {loading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <span className="line-clamp-3">
                      {excerpt || 'Open Scripture study module to read this and related passages in depth.'}
                    </span>
                  )}
                </div>
                <button
                  onClick={navigateToBible}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-lg transition-colors group"
                >
                  <span>Study in Bible</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
              <div className="border-8 border-transparent border-t-slate-900 drop-shadow-md" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
