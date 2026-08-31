import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Pause,
  Play,
  Sparkles,
  Users,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserStory, StorySlide } from '../../types';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';
import { notificationService } from '../../services/notifications';
import { useAsyncMedia } from '../../utils/useAsyncMedia';

const StorySlideMedia: React.FC<{
  src: string;
  alt: string;
  onError: () => void;
}> = ({ src, alt, onError }) => {
  const { resolvedSrc, error } = useAsyncMedia(src);

  useEffect(() => {
    if (error) onError();
  }, [error, onError]);

  if (!resolvedSrc || error) return null;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={onError}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
};

interface StoryViewerModalProps {
  initialStoryIndex?: number;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  initialStoryIndex = 0,
  onClose,
  onOpenChat,
}) => {
  const { stories, markStorySeen, deleteStorySlide } = useSocial();
  const { user } = useAuth();
  const { sendStoryReply } = useChat();

  // Bound check initial user index
  const safeInitialUserIndex = useMemo(() => {
    if (!stories || stories.length === 0) return 0;
    return Math.max(0, Math.min(initialStoryIndex, stories.length - 1));
  }, [initialStoryIndex, stories]);

  const [userStoryIndex, setUserStoryIndex] = useState(safeInitialUserIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasLikedCurrentSlide, setHasLikedCurrentSlide] = useState(false);
  const [imageError, setImageError] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const isHoldingRef = useRef(false);

  // Current active user story
  const currentStory: UserStory | undefined = stories[userStoryIndex];

  // Resolve slides array for current user story
  const slides: StorySlide[] = useMemo(() => {
    if (!currentStory) return [];
    if (currentStory.slides && currentStory.slides.length > 0) {
      return currentStory.slides;
    }
    return [
      {
        id: `slide_${currentStory.id}`,
        mediaUrl: currentStory.mediaUrl,
        caption: currentStory.caption,
        createdAt: currentStory.createdAt,
      },
    ];
  }, [currentStory]);

  // Current slide
  const activeSlide: StorySlide | undefined = slides[currentSlideIndex] || slides[0];

  // Preload images for silky-smooth slide transitions
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    slides.forEach((slide) => {
      if (slide.mediaUrl) {
        const img = new Image();
        img.src = slide.mediaUrl;
      }
    });

    // Also preload next user's first slide
    const nextUser = stories[userStoryIndex + 1];
    if (nextUser) {
      const nextMedia = nextUser.slides?.[0]?.mediaUrl || nextUser.mediaUrl;
      if (nextMedia) {
        const img = new Image();
        img.src = nextMedia;
      }
    }
  }, [slides, userStoryIndex, stories]);

  // Mark story as seen once when viewed
  useEffect(() => {
    if (currentStory && !seenIdsRef.current.has(currentStory.id)) {
      seenIdsRef.current.add(currentStory.id);
      markStorySeen(currentStory.id);
    }
    setImageError(false);
    setHasLikedCurrentSlide(false);
  }, [currentStory, markStorySeen]);

  // Reset slide index & progress if user index changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    setProgress(0);
  }, [userStoryIndex]);

  // Go to next slide or next user's story
  const goToNextSlide = useCallback(() => {
    if (!currentStory || slides.length === 0) {
      onClose();
      return;
    }

    if (currentSlideIndex < slides.length - 1) {
      // Advance to next slide of this user
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
      setImageError(false);
      setHasLikedCurrentSlide(false);
      try {
        soundEffects.playTap();
      } catch {}
    } else {
      // Move to next user's story if available
      if (userStoryIndex < stories.length - 1) {
        setUserStoryIndex((prev) => prev + 1);
        setCurrentSlideIndex(0);
        setProgress(0);
        setImageError(false);
        setHasLikedCurrentSlide(false);
        try {
          soundEffects.playTap();
        } catch {}
      } else {
        // All stories completed, smoothly close
        onClose();
      }
    }
  }, [currentStory, slides.length, currentSlideIndex, userStoryIndex, stories.length, onClose]);

  // Go to previous slide or previous user's story
  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      // Go to previous slide of this user
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
      setImageError(false);
      setHasLikedCurrentSlide(false);
      try {
        soundEffects.playTap();
      } catch {}
    } else {
      // At first slide of current user; move to previous user if possible
      if (userStoryIndex > 0) {
        const prevUserStory = stories[userStoryIndex - 1];
        const prevUserSlidesCount = prevUserStory?.slides?.length || 1;
        setUserStoryIndex((prev) => prev - 1);
        setCurrentSlideIndex(Math.max(0, prevUserSlidesCount - 1));
        setProgress(0);
        setImageError(false);
        setHasLikedCurrentSlide(false);
        try {
          soundEffects.playTap();
        } catch {}
      } else {
        // Already at very first slide of first user
        setProgress(0);
      }
    }
  }, [currentSlideIndex, userStoryIndex, stories]);

  // Switch directly to another user story
  const goToUserStory = useCallback(
    (index: number) => {
      if (index >= 0 && index < stories.length) {
        setUserStoryIndex(index);
        setCurrentSlideIndex(0);
        setProgress(0);
        setImageError(false);
        setHasLikedCurrentSlide(false);
        try {
          soundEffects.playTap();
        } catch {}
      }
    },
    [stories.length]
  );

  // Auto-progression timer (4.8 seconds per slide)
  useEffect(() => {
    if (isPaused || isHoldingRef.current || replyText.length > 0) {
      return;
    }

    const stepMs = 50;
    const durationMs = 4800;
    const increment = (stepMs / durationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + increment;
        if (nextVal >= 100) {
          // Trigger next slide cleanly
          setTimeout(() => {
            goToNextSlide();
          }, 0);
          return 0;
        }
        return nextVal;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, replyText, goToNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If the user is currently typing in an input or textarea, DO NOT hijack spacebar or arrow keys
      const target = e.target as HTMLElement | null;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        target?.tagName?.toLowerCase() === 'input' ||
        target?.tagName?.toLowerCase() === 'textarea'
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, onClose]);

  // Press-and-hold to pause story
  const handleHoldStart = () => {
    isHoldingRef.current = true;
    setIsPaused(true);
  };

  const handleHoldEnd = () => {
    isHoldingRef.current = false;
    setIsPaused(false);
  };

  // Screen click zone: Left 35% = previous slide, Right 65% = next slide
  const handleTapScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('form')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.35) {
      goToPrevSlide();
    } else {
      goToNextSlide();
    }
  };

  // Send reply message
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory || !activeSlide) return;

    const messageContent = replyText.trim();
    setReplyText('');
    setIsPaused(false);

    try {
      await sendStoryReply(
        currentStory.userId,
        currentStory.userName,
        currentStory.userAvatar,
        {
          storyId: currentStory.id,
          mediaUrl: activeSlide.mediaUrl || currentStory.mediaUrl,
          caption: activeSlide.caption || currentStory.caption,
          authorName: currentStory.userName,
        },
        messageContent
      );

      notificationService.notify({
        type: 'chat',
        title: `Story comment sent to ${currentStory.userName}`,
        body: `"${messageContent}" — Added to Messages`,
        avatar: currentStory.userAvatar,
        playSound: false,
      });
    } catch (err) {
      console.error('Failed to send story reply:', err);
    }
  };

  // Like slide
  const handleLikeSlide = async () => {
    if (!currentStory || !activeSlide) return;
    setHasLikedCurrentSlide(true);
    soundEffects.playLikeSparkle();

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ec4899', '#f43f5e', '#a855f7', '#3b82f6'],
      });
    } catch {}

    try {
      await sendStoryReply(
        currentStory.userId,
        currentStory.userName,
        currentStory.userAvatar,
        {
          storyId: currentStory.id,
          mediaUrl: activeSlide.mediaUrl || currentStory.mediaUrl,
          caption: activeSlide.caption || currentStory.caption,
          authorName: currentStory.userName,
        },
        '❤️ Liked your story'
      );
    } catch (err) {
      console.error('Failed to send story like to chat:', err);
    }

    notificationService.notify({
      type: 'like',
      title: `Liked ${currentStory.userName}'s story`,
      body: activeSlide?.caption || '❤️ Sent reaction to chat',
      avatar: currentStory.userAvatar,
      playSound: false,
    });
  };

  if (!currentStory || !activeSlide) {
    return null;
  }

  // Calculate human readable time ago
  const formatTimeAgo = (timestamp: number) => {
    const diffMins = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div
      id="story-viewer-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-2xl animate-fade-in select-none overflow-y-auto"
    >
      {/* Top action controls bar */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-2 z-40">
        <button
          id="toggle-story-pause-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPaused((p) => !p);
          }}
          className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-md border border-white/20 shadow-xl"
          title={isPaused ? 'Resume story (Space)' : 'Pause story (Space)'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        <button
          id="close-story-viewer-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-md border border-white/20 shadow-xl"
          title="Close story (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Arrows for desktop */}
      {(userStoryIndex > 0 || currentSlideIndex > 0) && (
        <button
          id="story-nav-prev-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevSlide();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all z-40 hidden md:flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 shadow-2xl"
          title="Previous slide / story"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {(userStoryIndex < stories.length - 1 || currentSlideIndex < slides.length - 1) && (
        <button
          id="story-nav-next-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNextSlide();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all z-40 hidden md:flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 shadow-2xl"
          title="Next slide / story"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main Story Container Card */}
      <motion.div
        key={`${currentStory.id}_slide_${currentSlideIndex}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => {
          e.stopPropagation();
          handleTapScreen(e);
        }}
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        className="relative w-full max-w-[390px] sm:max-w-md h-[88dvh] max-h-[720px] my-auto rounded-[28px] sm:rounded-[32px] overflow-hidden bg-slate-950 backdrop-blur-2xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.85)] flex flex-col justify-between cursor-pointer flex-shrink-0"
      >
        {/* Story Visual Media / Background Image */}
        {!imageError && activeSlide.mediaUrl ? (
          <StorySlideMedia
            src={activeSlide.mediaUrl}
            alt={currentStory.userName}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-2xl max-w-xs">
              <p className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeSlide.caption || currentStory.caption || `${currentStory.userName}'s Story`}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-slate-300 text-xs font-medium">
              <Avatar src={currentStory.userAvatar} name={currentStory.userName} size="sm" />
              <span>{currentStory.userName}</span>
            </div>
          </div>
        )}

        {/* Dynamic Vignette & Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/15 to-black/90 pointer-events-none" />

        {/* Top Header with Progress Bars and User Info */}
        <div className="relative z-30 p-4 pt-safe sm:pt-6 space-y-3 pointer-events-auto mt-2">
          {/* Segmented Progress Bars (one for each slide of current user) */}
          <div className="flex items-center gap-1.5 w-full">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
                  setProgress(0);
                  setImageError(false);
                  setHasLikedCurrentSlide(false);
                  try {
                    soundEffects.playTap();
                  } catch {}
                }}
                className="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden cursor-pointer"
                title={`Jump to slide ${idx + 1}`}
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx < currentSlideIndex
                        ? '100%'
                        : idx === currentSlideIndex
                        ? `${Math.min(100, Math.max(0, progress))}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(true);
                window.dispatchEvent(
                  new CustomEvent('open_user_profile', { detail: { userId: currentStory.userId } })
                );
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
              title={`View ${currentStory.userName}'s profile`}
            >
              <div className="transition-transform group-hover:scale-105">
                <Avatar src={currentStory.userAvatar} name={currentStory.userName} size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors tracking-tight">
                    {currentStory.userName}
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {formatTimeAgo(activeSlide.createdAt || currentStory.createdAt)} • Slide {currentSlideIndex + 1} of {slides.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Other stories user quick switch icons */}
              <div className="flex items-center -space-x-1.5 bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
                {stories.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToUserStory(idx);
                    }}
                    className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-transform hover:scale-125 hover:z-20 ${
                      idx === userStoryIndex
                        ? 'border-blue-400 scale-110 z-10 shadow-md'
                        : 'border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={s.userName}
                  >
                    <img src={s.userAvatar} alt={s.userName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Quick direct chat button */}
              {onOpenChat && user?.id !== currentStory.userId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onOpenChat();
                  }}
                  className="p-1.5 px-2.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-slate-200 hover:text-white transition-all flex items-center gap-1 text-xs backdrop-blur-md"
                  title="Open direct chat with this user"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline text-[11px] font-medium">Messages</span>
                </button>
              )}

              {/* Author Delete Slide Button */}
              {user?.id === currentStory.userId && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (activeSlide) {
                      soundEffects.playTap();
                      await deleteStorySlide(currentStory.id, activeSlide.id);
                      if (slides.length <= 1) {
                        onClose();
                      } else {
                        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
                        setProgress(0);
                      }
                    }
                  }}
                  className="p-1.5 px-2 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 text-red-300 hover:text-red-100 transition-all flex items-center gap-1 text-xs backdrop-blur-md"
                  title="Delete this slide from your story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px] font-medium">Delete</span>
                </button>
              )}

              {/* Paused Indicator Badge */}
              {isPaused && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-[10px] font-bold text-amber-300 flex items-center gap-1 backdrop-blur-md">
                  <Pause className="w-2.5 h-2.5" /> Paused
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Tap Guidance Overlay */}
        <div className="relative z-10 flex-1 pointer-events-none" />

        {/* Bottom Story Caption & Interaction Bar */}
        <div
          className="relative z-30 p-3 sm:p-4 pb-5 sm:pb-6 space-y-2.5 pointer-events-auto bg-gradient-to-t from-black/95 via-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Story Caption */}
          {(activeSlide.caption || currentStory.caption) && (
            <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 text-white text-xs sm:text-sm font-medium leading-relaxed shadow-lg">
              {activeSlide.caption || currentStory.caption}
            </div>
          )}

          {/* Reply and Like Form */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                placeholder={`Reply to ${currentStory.userName.split(' ')[0]}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-400 focus:bg-black/90 transition-all shadow-lg"
              />
              {replyText.trim().length > 0 && (
                <button
                  type="submit"
                  className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex-shrink-0 shadow-lg shadow-blue-500/25"
                  title="Send reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Like story heart button */}
            <button
              type="button"
              onClick={handleLikeSlide}
              className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all flex-shrink-0 shadow-lg ${
                hasLikedCurrentSlide
                  ? 'bg-pink-500/30 border-pink-500/50 text-pink-400 scale-110'
                  : 'bg-black/70 hover:bg-white/15 border-white/20 text-white hover:text-pink-400'
              }`}
              title="Like story slide"
            >
              <Heart
                className={`w-5 h-5 ${
                  hasLikedCurrentSlide ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
