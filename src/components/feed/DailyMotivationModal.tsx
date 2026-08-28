import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, SunMedium, Calendar, Quote, Share2, Copy, Check } from 'lucide-react';
import { getDailyQuote, getFormattedToday, MotivationalQuote } from '../../data/quotes';
import { notificationService } from '../../services/notifications';
import { soundEffects } from '../../services/audio';

interface DailyMotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToFeed?: (quoteText: string, author: string) => void;
}

export const DailyMotivationModal: React.FC<DailyMotivationModalProps> = ({
  isOpen,
  onClose,
  onShareToFeed,
}) => {
  const [copied, setCopied] = useState(false);
  const dailyQuote: MotivationalQuote = getDailyQuote();
  const formattedToday = getFormattedToday();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyQuote = async () => {
    const fullText = `“${dailyQuote.quote}” — ${dailyQuote.author}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
      }
      setCopied(true);
      soundEffects.playLikeSparkle();
      notificationService.notify({
        type: 'system',
        title: 'Quote Copied to Clipboard',
        body: fullText.slice(0, 75) + '...',
        playSound: false,
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShare = () => {
    onClose();
    soundEffects.playTap();
    if (onShareToFeed) {
      onShareToFeed(dailyQuote.quote, dailyQuote.author);
    } else {
      window.dispatchEvent(
        new CustomEvent('open_create_post', {
          detail: {
            content: `“${dailyQuote.quote}”\n\n— ${dailyQuote.author}`,
            tags: 'Inspiration, Spiritual',
          },
        })
      );
    }
  };

  return createPortal(
    <AnimatePresence>
      <div
        id="daily-motivation-modal-portal"
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      >
        <motion.div
          id="daily-motivation-modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0c122c]/98 via-[#0a0f24]/98 to-[#070b1a]/98 backdrop-blur-3xl border border-white/20 shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col relative text-white my-auto max-h-[calc(100dvh-2rem)]"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Sticky Modal Top Bar */}
          <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <SunMedium className="w-5 h-5 text-black font-bold" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  Daily Word & Inspiration
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium">
                  <Calendar className="w-3 h-3 text-amber-400/70" />
                  <span>{formattedToday}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-gradient-to-r ${dailyQuote.vibeColor}`}
              >
                {dailyQuote.category}
              </span>

              <button
                id="close-motivation-modal-btn"
                onClick={() => {
                  soundEffects.playTap();
                  onClose();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-7 overflow-y-auto relative z-10 space-y-4">
            {/* Category badge on mobile */}
            <div className="sm:hidden flex items-center justify-start">
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-gradient-to-r ${dailyQuote.vibeColor}`}
              >
                {dailyQuote.category}
              </span>
            </div>

            {/* Quote Block */}
            <div className="relative pl-4 sm:pl-5 border-l-2 border-amber-400/80 my-2">
              <Quote className="w-6 h-6 text-amber-400/40 mb-1" />
              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-slate-100 italic tracking-tight">
                &ldquo;{dailyQuote.quote}&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-amber-300 not-italic">
                  — {dailyQuote.author}
                </span>
                {dailyQuote.role && (
                  <span className="text-xs sm:text-sm text-slate-400 not-italic">
                    ({dailyQuote.role})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 flex-wrap relative z-10 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Refreshes automatically at midnight</span>
              <span className="sm:hidden">Daily at midnight</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                id="copy-motivation-quote-btn"
                onClick={handleCopyQuote}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all font-semibold"
                title="Copy quote to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                id="share-motivation-quote-btn"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                title="Share this daily quote as a new post to the community feed"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share to Feed</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
