import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Sliders, 
  Share2, 
  LogOut, 
  Flame, 
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';

interface SuperAdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenPermissions?: () => void;
}

export const SuperAdminDrawer: React.FC<SuperAdminDrawerProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
  onNavigateTab,
  onOpenPermissions
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const isTexAdmin =
    user?.handle?.toLowerCase() === 'tex' ||
    user?.email?.toLowerCase().includes('lightsouttattootex') ||
    user?.email?.toLowerCase().includes('tex@aura.social');

  const handleAction = (cb: () => void) => {
    soundEffects.playTap();
    cb();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end pointer-events-auto">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm h-[100dvh] bg-[#070919] border-l border-white/10 shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Aura Super Menu</h2>
              <p className="text-[10px] text-slate-400">Navigation & Tools</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div 
            onClick={() => handleAction(() => onOpenProfile?.())}
            className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-3"
          >
            <Avatar src={user.avatarUrl} name={user.name || user.handle || 'User'} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{user.name}</span>
                {isTexAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">@{user.handle}</p>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="mt-4 space-y-3 flex-1">
          {/* Admin Exclusive: Master Studio */}
          {isTexAdmin && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 mb-1.5">
                Creator & Admin Suite
              </p>
              <button
                onClick={() => handleAction(() => onNavigateTab?.('studio'))}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-300 hover:bg-blue-600/20 transition-all text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Master Studio & Archive</span>
              </button>
            </div>
          )}

          {/* Community & Content */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Community & Feeds
            </p>

            <button
              onClick={() => handleAction(() => onNavigateTab?.('feed'))}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Community Feed & Stories</span>
            </button>

            <button
              onClick={() => handleAction(() => onNavigateTab?.('bible'))}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Scriptures, Sermons & Courses</span>
            </button>

            <button
              onClick={() => handleAction(() => onNavigateTab?.('chat'))}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Messenger</span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  try {
                    localStorage.setItem('aura_study_initial_tab', 'prayers');
                  } catch {}
                  onNavigateTab?.('bible');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('switch_study_tab', { detail: { tab: 'prayers' } }));
                  }, 50);
                })
              }
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Sanctuary Prayer Wall</span>
            </button>
          </div>

          {/* Quick Tools & Shortcuts */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Tools & Sharing
            </p>

            <button
              onClick={() =>
                handleAction(() => {
                  window.dispatchEvent(new CustomEvent('open_share_modal'));
                })
              }
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Invite Friends & QR Code</span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  if (onOpenPermissions) {
                    onOpenPermissions();
                  } else {
                    window.dispatchEvent(new CustomEvent('open_permissions_modal'));
                  }
                })
              }
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>App Permissions & Audio/Video Setup</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 mt-auto">
          <button
            onClick={() => handleAction(() => logout())}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
