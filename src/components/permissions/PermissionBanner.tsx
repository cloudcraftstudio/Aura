import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Mic,
  Bell,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { usePermissions } from '../../context/PermissionsContext';

export const PermissionBanner: React.FC = () => {
  const {
    cameraStatus,
    micStatus,
    notificationStatus,
    pwaStatus,
    isStandalone,
    isBannerDismissed,
    requestAllPermissions,
    promptSaveToHome,
    openPermissionsModal,
    dismissBanner,
  } = usePermissions();

  const isMediaGranted = cameraStatus === 'granted' && micStatus === 'granted';
  const isNotifGranted = notificationStatus === 'granted';
  const isPwaInstalled = isStandalone || pwaStatus === 'installed';

  const allComplete = isMediaGranted && isNotifGranted && isPwaInstalled;

  // Don't show if all permissions are granted and app is installed, or if user dismissed
  if (allComplete || isBannerDismissed) {
    return null;
  }

  const handleAllowAll = async () => {
    await requestAllPermissions();
    if (!isPwaInstalled) {
      await promptSaveToHome();
    }
  };

  return (
    <div
      id="permission-smart-banner"
      className="relative z-30 max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-1 animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#0d1333]/90 to-purple-950/70 border border-blue-500/30 p-3 sm:p-4 shadow-xl backdrop-blur-xl">
        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Info & Status Badges */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Enable Full Aura Features</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    Recommended
                  </span>
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                Allow Camera & Mic for HD video calling, enable Push Notifications for alerts, and Save to Home Screen.
              </p>

              {/* Status pills list */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap text-[10px] font-semibold">
                {/* Camera & Mic Status */}
                <button
                  type="button"
                  onClick={openPermissionsModal}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    isMediaGranted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-blue-400/50'
                  }`}
                >
                  <Video className="w-3 h-3 text-blue-400" />
                  <span>Camera & Mic</span>
                  {isMediaGranted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
                  ) : (
                    <span className="text-[9px] text-amber-400 font-bold ml-0.5">Allow</span>
                  )}
                </button>

                {/* Notifications Status */}
                <button
                  type="button"
                  onClick={openPermissionsModal}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    isNotifGranted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-blue-400/50'
                  }`}
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>Notifications</span>
                  {isNotifGranted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
                  ) : (
                    <span className="text-[9px] text-amber-400 font-bold ml-0.5">Allow</span>
                  )}
                </button>

                {/* Save to Home Status */}
                <button
                  type="button"
                  onClick={promptSaveToHome}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                    isPwaInstalled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-blue-400/50'
                  }`}
                >
                  <Smartphone className="w-3 h-3 text-purple-400" />
                  <span>Save to Home</span>
                  {isPwaInstalled ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
                  ) : (
                    <span className="text-[9px] text-indigo-400 font-bold ml-0.5">Add</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              id="allow-all-permissions-banner-btn"
              type="button"
              onClick={handleAllowAll}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Allow All & Save App</span>
            </button>

            <button
              type="button"
              onClick={openPermissionsModal}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Inspect Device Settings"
            >
              <span>Manage</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={dismissBanner}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss for now"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
