import React from 'react';
import { Home, MessageSquare, Bookmark, User, PlusCircle, Share2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface BottomNavProps {
  activeTab: 'feed' | 'chat' | 'bookmarks';
  setActiveTab: (tab: 'feed' | 'chat' | 'bookmarks') => void;
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
  const { conversations } = useChat();
  const { user, openAuthModal } = useAuth();

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

        {/* Saved Tab */}
        <button
          id="mobile-tab-bookmarks"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all relative ${
            activeTab === 'bookmarks'
              ? 'text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${activeTab === 'bookmarks' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Saved</span>
          {activeTab === 'bookmarks' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

        {/* Share & Invite App Mobile Button */}
        {onOpenShare && (
          <button
            id="mobile-tab-share"
            onClick={onOpenShare}
            className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-blue-400 hover:text-blue-300 transition-all relative"
            title="Invite & Share App"
          >
            <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold">Invite</span>
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
