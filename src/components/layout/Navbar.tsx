import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Home,
  Bookmark,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  LogIn,
  Database,
  Layers,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { notificationService } from '../../services/notifications';
import { Avatar } from '../common/Avatar';
import { UserStatus } from '../../types';

interface NavbarProps {
  activeTab: 'feed' | 'chat' | 'bookmarks';
  setActiveTab: (tab: 'feed' | 'chat' | 'bookmarks') => void;
  onOpenProfile: () => void;
  onOpenShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenShare,
}) => {
  const { user, allUsers, loginAsUser, isOnline, openAuthModal, isServerConnected } = useAuth();
  const { conversations } = useChat();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleRequestPush = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.notify({
        type: 'system',
        title: 'Push Notifications Enabled',
        body: 'You will receive instant alerts for chats, likes, and calls.',
        playSound: true,
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)] bg-[#05060f]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-[1.5px] shadow-lg shadow-blue-500/25">
            <div className="w-full h-full rounded-[14px] bg-[#05060f]/70 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                AURA
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden lg:block">
              Server-Backed Social & HD WebRTC Calling
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Pill Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
          <button
            id="tab-feed"
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </button>

          <button
            id="tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chats</span>
            {totalUnreadChats > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center">
                {totalUnreadChats}
              </span>
            )}
          </button>

          <button
            id="tab-bookmarks"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        </nav>

        {/* Right Action Suite */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Invite & Share Button */}
          {onOpenShare && (
            <button
              id="share-app-nav-btn"
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600/25 to-indigo-600/25 hover:from-blue-600/40 hover:to-indigo-600/40 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold shadow-md transition-all active:scale-95"
              title="Invite friends & share app with QR code or link"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Invite / Share</span>
            </button>
          )}

          {/* Server DB Connection Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            title="Connected to persistent server database"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="hidden lg:inline">Server DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Quick Persona Switcher Menu (Desktop) */}
          <div className="relative hidden md:block">
            <button
              id="switch-persona-btn"
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-button text-xs font-semibold text-blue-300 hover:text-white border border-blue-500/30"
              title="Switch user to test multi-person chat & WebRTC video call"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Team Switch</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 border border-white/15">
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Live Multi-User
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        loginAsUser(u.id);
                        setIsPersonaMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left text-xs transition-colors ${
                        user?.id === u.id
                          ? 'bg-blue-500/20 text-white font-bold border border-blue-500/30'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Avatar src={u.avatarUrl} name={u.name} size="sm" status={u.status} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-white font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.handle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Push Notification Button */}
          <button
            onClick={handleRequestPush}
            className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-blue-400 transition-all flex items-center justify-center"
            title="Enable Instant Push Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Avatar or Sign In button */}
          {user ? (
            <button
              id="profile-trigger-btn"
              onClick={onOpenProfile}
              className="p-0.5 rounded-full ring-2 ring-blue-500/50 hover:ring-blue-400 transition-all active:scale-95 flex-shrink-0"
              title="Open Account & Settings"
            >
              <Avatar src={user.avatarUrl} name={user.name} size="md" status={user.status} />
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 border border-blue-400/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
