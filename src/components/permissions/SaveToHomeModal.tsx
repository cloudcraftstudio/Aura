import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Smartphone,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Download,
  Zap,
  ShieldCheck,
  Bell,
  Video,
  ExternalLink,
} from 'lucide-react';
import { usePermissions } from '../../context/PermissionsContext';

export const SaveToHomeModal: React.FC = () => {
  const {
    isSaveToHomeModalOpen,
    closeSaveToHomeModal,
    isIos,
    isStandalone,
    pwaStatus,
    promptSaveToHome,
  } = usePermissions();

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isSaveToHomeModalOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      id="save-to-home-modal"
      onClick={closeSaveToHomeModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fade-in select-none overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#090d22]/95 border border-white/20 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white my-auto"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Save Aura to Home Screen</h3>
              <p className="text-[10px] text-slate-400">Full-screen PWA with instant offline loading</p>
            </div>
          </div>
          <button
            onClick={closeSaveToHomeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* App Card Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-950/60 to-purple-950/60 border border-white/15 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#05060f] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-extrabold text-white">Aura App</h4>
              <p className="text-xs text-slate-300">Fast, standalone social feed & WebRTC calling</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Progressive Web App</span>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Launch</span>
              </div>
              <p className="text-[11px] text-slate-300">Opens straight from your phone home screen with no URL bars.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Bell className="w-3.5 h-3.5" />
                <span>Background Alerts</span>
              </div>
              <p className="text-[11px] text-slate-300">Receive real-time push rings when friends start a video call.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                <Video className="w-3.5 h-3.5" />
                <span>Full-Screen Calls</span>
              </div>
              <p className="text-[11px] text-slate-300">Maximum screen space for 1080p HD video chat and screen shares.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>0 MB Download</span>
              </div>
              <p className="text-[11px] text-slate-300">No App Store or Play Store needed. Saves directly in seconds.</p>
            </div>
          </div>

          {/* iOS Safari Guided Instructions vs Android/Desktop Native Install */}
          {isIos ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>How to Add on iPhone / iPad (Safari):</span>
              </h5>

              <ol className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <div className="flex-1">
                    <span>Tap the </span>
                    <strong className="text-blue-300 inline-flex items-center gap-1">
                      Share button <Share2 className="w-3.5 h-3.5 inline" />
                    </strong>
                    <span> in Safari toolbar (at the bottom or top of your browser).</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <div className="flex-1">
                    <span>Scroll down the menu list and select </span>
                    <strong className="text-purple-300 inline-flex items-center gap-1">
                      Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" />
                    </strong>.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    3
                  </span>
                  <div className="flex-1">
                    <span>Tap </span>
                    <strong className="text-emerald-300">Add</strong>
                    <span> in the top-right corner. The Aura icon will appear on your home screen!</span>
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                id="install-pwa-button"
                type="button"
                onClick={promptSaveToHome}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save / Install App to Home Screen</span>
              </button>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-1">Android & Chrome Tip:</p>
                <p className="text-[11px] text-slate-400">
                  If prompted, click &ldquo;Install&rdquo;. You can also tap Chrome&rsquo;s 3-dot menu <strong className="text-white">⋮</strong> and choose <strong className="text-blue-300">&ldquo;Install app&rdquo;</strong> or <strong className="text-blue-300">&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Direct Share Link button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">Want to open on another device or phone?</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Web Link'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
