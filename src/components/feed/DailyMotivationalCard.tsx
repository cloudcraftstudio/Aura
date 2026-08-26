import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, Share2, Copy, Check, Calendar, SunMedium } from 'lucide-react';
import { getDailyQuote, getFormattedToday, MotivationalQuote } from '../../data/quotes';
import { notificationService } from '../../services/notifications';
import { soundEffects } from '../../services/audio';

interface DailyMotivationalCardProps {
  onShareToFeed?: (quoteText: string, author: string) => void;
}

export const DailyMotivationalCard: React.FC<DailyMotivationalCardProps> = ({ onShareToFeed }) => {
  const [copied, setCopied] = useState(false);
  const dailyQuote: MotivationalQuote = getDailyQuote();
  const formattedToday = getFormattedToday();

  const handleCopyQuote = async () => {
    const fullText = `"${dailyQuote.quote}" — ${dailyQuote.author}`;
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
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShare = () => {
    if (onShareToFeed) {
      onShareToFeed(dailyQuote.quote, dailyQuote.author);
    }
  };

  return (
    <motion.div
      id="daily-motivational-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0c122c]/90 via-[#0a0f24]/90 to-[#070b1a]/90 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 mb-6 shadow-2xl group text-white"
    >
      {/* Ambient background glow orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />

      {/* Top Meta Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <SunMedium className="w-4 h-4 text-black font-bold" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              Daily Inspiration
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedToday}</span>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-gradient-to-r ${dailyQuote.vibeColor}`}
        >
          {dailyQuote.category}
        </span>
      </div>

      {/* Quote Main Body */}
      <div className="relative z-10 my-3 pl-4 border-l-2 border-gradient-to-b border-blue-400/60">
        <p className="text-sm sm:text-base md:text-lg font-semibold leading-relaxed text-slate-100 italic tracking-tight">
          &ldquo;{dailyQuote.quote}&rdquo;
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-blue-300 not-italic">
            — {dailyQuote.author}
          </span>
          {dailyQuote.role && (
            <span className="text-[11px] text-slate-400 not-italic">
              ({dailyQuote.role})
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refreshes automatically at midnight</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
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

          {onShareToFeed && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-white transition-all text-xs font-bold shadow-lg shadow-blue-500/15 hover:scale-105"
              title="Share this daily quote as a new post to the community feed"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to Feed</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
