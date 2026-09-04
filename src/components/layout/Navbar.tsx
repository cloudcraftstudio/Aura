import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Home,
  Bell,
  LogIn,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notifications';
import { Avatar } from '../common/Avatar';
import { DailyMotivationModal } from '../feed/DailyMotivationModal';
import { SuperAdminDrawer } from './SuperAdminDrawer';

interface NavbarProps {
  activeTab: 'feed' | 'bible' | 'chat' | 'studio' | 'devotional' | 'recovery';
  setActiveTab: (tab: 'feed' | 'bible' | 'chat' | 'studio' | 'devotional' | 'recovery') => void;
  onOpenProfile: () => void;
  onOpenShare?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenShare,
  onOpenNotifications,
}) => {
  const { user, openAuthModal } = useAuth();
  const { conversations } = useChat();
  const { unreadCount, openNotifications } = useNotifications();

  const isTexAdmin =
    user?.handle?.toLowerCase() === 'tex' ||
    user?.email?.toLowerCase().includes('lightsouttattootex') ||
    user?.email?.toLowerCase().includes('tex@aura.social');

  const [isMotivationOpen, setIsMotivationOpen] = useState(false);
  const [isSuperDrawerOpen, setIsSuperDrawerOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenMotivation = () => setIsMotivationOpen(true);
    window.addEventListener('open_daily_motivation', handleOpenMotivation);
    return () => window.removeEventListener('open_daily_motivation', handleOpenMotivation);
  }, []);

  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleBellClick = async () => {
    if (notificationService.getPermissionStatus() === 'default') {
      await notificationService.requestPermission();
    }
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      openNotifications();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 px-3 sm:px-6 bg-[#05060f]/90 backdrop-blur-2xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Live Badge */}
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
          </div>
        </div>

        {/* Center Desktop Navigation Pill Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
          <button
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
            onClick={() => setActiveTab('bible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bible'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>The Word</span>
          </button>

          <button
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
            onClick={() => setActiveTab('recovery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recovery'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Path to Freedom</span>
          </button>

          {isTexAdmin && (
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'studio'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio</span>
            </button>
          )}
        </nav>

        {/* Right Action Suite: Cleaned Up */}
        <div className="flex items-center gap-3">
          {/* Notifications Center Bell */}
          <button
            onClick={handleBellClick}
            className="relative p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-blue-400 transition-all flex items-center justify-center active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-[#05060f] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Super Menu Trigger */}
          {user ? (
            <button
              onClick={() => setIsSuperDrawerOpen(true)}
              className="p-0.5 rounded-full ring-2 ring-blue-500/50 hover:ring-blue-400 transition-all active:scale-95 flex-shrink-0"
              title="Super Menu"
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

      <DailyMotivationModal
        isOpen={isMotivationOpen}
        onClose={() => setIsMotivationOpen(false)}
      />

      <SuperAdminDrawer
        isOpen={isSuperDrawerOpen}
        onClose={() => setIsSuperDrawerOpen(false)}
        onOpenProfile={onOpenProfile}
        onNavigateTab={(tab) => {
          setActiveTab(tab as any);
          setIsSuperDrawerOpen(false);
        }}
      />
    </header>
  );
};
