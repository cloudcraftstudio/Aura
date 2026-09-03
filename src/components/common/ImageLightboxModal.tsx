import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAsyncMedia } from '../../utils/useAsyncMedia';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  caption?: string;
  authorName?: string;
  authorAvatar?: string;
  authorHandle?: string;
  createdAt?: string | number;
  onClose: () => void;
}

const AsyncThumbnail: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const { resolvedSrc } = useAsyncMedia(src);
  return <img src={resolvedSrc || src} alt={alt} className={className} referrerPolicy="no-referrer" />;
};

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  caption,
  authorName,
  authorAvatar,
  authorHandle,
  createdAt,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, (images?.length || 1) - 1)));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, images]);

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      soundEffects.playTap();
      setIsZoomed(false);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      soundEffects.playTap();
      setIsZoomed(false);
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const handleClose = useCallback(() => {
    soundEffects.playTap();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  const currentImage = images[currentIndex] || images[0];
  const { resolvedSrc: currentResolvedSrc } = useAsyncMedia(currentImage || '');

  if (!isOpen || images.length === 0) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentResolvedSrc || currentImage;
    link.download = `aura-photo-${Date.now()}.jpg`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = currentResolvedSrc || currentImage;
    if (navigator.share) {
      try {
        await navigator.share({
          title: authorName ? `Photo by ${authorName}` : 'Photo from Aura',
          text: caption || 'Check out this photo on Aura',
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="image-lightbox-overlay"
        className="fixed inset-0 z-[9999] flex flex-col md:flex-row bg-black/95 backdrop-blur-xl select-none"
      >
        {/* Floating Close Button (Top Left on Stage) */}
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 z-50 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all backdrop-blur-md shadow-lg"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT / CENTER STAGE: Uncropped Media Viewing Area */}
        <div 
          onClick={handleClose}
          className="relative flex-1 flex flex-col items-center justify-between min-h-[55vh] md:min-h-screen p-3 md:p-6 overflow-hidden"
        >
          {/* Top Controls Bar inside Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-end gap-2 z-20"
          >
            {images.length > 1 && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200 border border-white/10 mr-auto ml-12">
                {currentIndex + 1} of {images.length}
              </span>
            )}

            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              title="Share photo"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Center Image Stage */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="relative flex-1 w-full flex items-center justify-center overflow-auto my-2 cursor-zoom-in"
          >
            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 transition-all backdrop-blur-md hover:scale-110 shadow-2xl"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <motion.img
              key={currentImage}
              src={currentResolvedSrc || currentImage}
              alt="Full Preview"
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{
                opacity: 1,
                scale: isZoomed ? 1.5 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`max-w-full max-h-[75vh] md:max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-transform ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
            />

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 transition-all backdrop-blur-md hover:scale-110 shadow-2xl"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip (if multi-photo) */}
          {images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md max-w-full z-20"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundEffects.playTap();
                    setCurrentIndex(idx);
                  }}
                  className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentIndex
                      ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/40'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <AsyncThumbnail
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Facebook-Style Detail Sidebar (Full Caption & Details) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full md:w-[400px] lg:w-[440px] bg-neutral-900/95 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col h-[45vh] md:h-screen shrink-0 shadow-2xl select-text"
        >
          {/* Author Header */}
          <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName || 'Author'}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {(authorName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">
                  {authorName || 'Aura Member'}
                </span>
                {authorHandle && (
                  <span className="text-neutral-400 text-xs">@{authorHandle}</span>
                )}
                {formattedDate && (
                  <span className="text-neutral-500 text-[11px] mt-0.5">{formattedDate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Full Caption Content Area - No Truncation, Full Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-neutral-200 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-neutral-700">
            {caption ? (
              <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-200">
                {caption}
              </p>
            ) : (
              <p className="text-neutral-500 italic text-xs">No caption provided.</p>
            )}
          </div>

          {/* Bottom Footer Notice */}
          <div className="p-3 border-t border-neutral-800 text-center">
            <span className="text-xs text-neutral-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-[10px]">Esc</kbd> to exit full view
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
