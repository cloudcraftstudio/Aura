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
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
    setIsZoomed(false);
  }, [initialIndex, images]);

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

  // Keyboard shortcut listener
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

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        id="image-lightbox-overlay"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-3 sm:p-5 select-none"
      >
        {/* Top Control Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl flex items-center justify-between z-10 px-2 py-2"
        >
          <div className="flex items-center gap-3">
            {authorName && (
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                {authorName}
              </span>
            )}
            {images.length > 1 && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium text-slate-300 border border-white/10">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
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

            {/* Prominent Close Button */}
            <button
              id="close-lightbox-btn"
              onClick={handleClose}
              className="p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 transition-all flex items-center gap-1.5 px-3.5 shadow-lg shadow-rose-950/40"
              title="Close image (or press Esc)"
            >
              <X className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Center Image Container */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto my-2 cursor-zoom-in"
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

          {/* Current Photo with full display preservation */}
          <motion.img
            key={currentImage}
            src={currentResolvedSrc || currentImage}
            alt="Full Preview"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: isZoomed ? 1.5 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={`max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform ${
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

        {/* Bottom Bar: Thumbnail Strip & Caption */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl flex flex-col items-center gap-2 z-10 px-4 pb-2 text-center"
        >
          {caption && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg">
              {caption}
            </p>
          )}

          {/* Thumbnail preview list if multiple photos */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md max-w-full">
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

          {/* Bottom Close helper prompt */}
          <button
            onClick={handleClose}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline pt-1"
          >
            Click anywhere or press Esc to close
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

const ThumbnailImage: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const { resolvedSrc } = useAsyncMedia(src);
  return <img src={resolvedSrc} alt={alt} className={className} referrerPolicy="no-referrer" />;
};
