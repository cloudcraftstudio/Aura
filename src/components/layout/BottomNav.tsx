import React from 'react';
import { Home, Sun, MessageSquare, Bookmark, User, PlusCircle, Share2, BookOpen, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface BottomNavProps {
  activeTab: 'feed' | 'bible' | 'chat' | 'studio' | 'devotional';
  setActiveTab: (tab: 'feed' | 'bible' | 'chat' | 'studio' | 'devotional') => void;
  onOpenProfile: () => void;
  onOpenCreatePost?: () => void;
  onOpenShare?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenCreatePost,
  onOpenShare,
}) => {
  const { conversations, activeConversation } = useChat();
  const { user, openAuthModal } = useAuth();

  const isTexAdmin =
    user?.handle?.toLowerCase() === 'tex' ||
    user?.email?.toLowerCase().includes('lightsouttattootex') ||
    user?.email?.toLowerCase().includes('tex@aura.social');

  // If in chat tab on mobile and viewing an open conversation, hide BottomNav to keep input area fully visible & accessible
  if (activeTab === 'chat' && activeConversation) {
    return null;
  }

  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070919]/90 backdrop-blur-3xl border-t border-white/10 px-2 sm:px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Feed Tab */}
        <button
          id="mobile-tab-feed"
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
            activeTab === 'feed'
              ? 'text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Feed</span>
          {activeTab === 'feed' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

        {/* Devotional Tab */}
        <button
          id="mobile-tab-devotional"
          onClick={() => setActiveTab('devotional')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
            activeTab === 'devotional'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun className={`w-5 h-5 ${activeTab === 'devotional' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Daily</span>
          {activeTab === 'devotional' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -bottom-0.5" />
          )}
        </button>
        {/* Bible Tab */}
        <button
          id="mobile-tab-bible"
          onClick={() => setActiveTab('bible')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
            activeTab === 'bible'
              ? 'text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'bible' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">The Word</span>
          {activeTab === 'bible' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

        {/* Chats Tab */}
        <button
          id="mobile-tab-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
            activeTab === 'chat'
              ? 'text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${activeTab === 'chat' ? 'stroke-[2.5px]' : ''}`} />
            {totalUnreadChats > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center absolute -top-1 -right-2 shadow-md animate-pulse">
                {totalUnreadChats}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Chats</span>
          {activeTab === 'chat' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

        {/* Studio Tab */}
        {isTexAdmin && (
          <button
            id="mobile-tab-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
              activeTab === 'studio'
                ? 'text-blue-400 font-bold scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${activeTab === 'studio' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] tracking-tight">Studio</span>
            {activeTab === 'studio' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5" />
            )}
          </button>
        )}

        {/* Account / Profile Button */}
        <button
          id="mobile-tab-profile"
          onClick={user ? onOpenProfile : openAuthModal}
          className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-slate-400 hover:text-white transition-all relative"
        >
          {user ? (
            <div className="relative">
              <Avatar src={user.avatarUrl} name={user.name} size="sm" status={user.status} />
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] tracking-tight">{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
};
