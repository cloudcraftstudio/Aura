import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Video, Compass, Share2, QrCode } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { StoriesReel } from '../stories/StoriesReel';
import { ActiveUsersBar } from './ActiveUsersBar';
import { PostCard } from './PostCard';
import { CreatePostModal, POST_CATEGORIES } from './CreatePostModal';
import { DailyMotivationalCard } from './DailyMotivationalCard';
import { Avatar } from '../common/Avatar';

const TAG_FILTERS = ['All', ...POST_CATEGORIES];

export const SocialFeed: React.FC = () => {
  const { posts } = useSocial();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialPostContent, setInitialPostContent] = useState('');
  const [initialPostTags, setInitialPostTags] = useState('');

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'All') return true;
    return post.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  const handleShareQuoteToFeed = (quoteText: string, author: string) => {
    setInitialPostContent(`“${quoteText}”\n\n— ${author}`);
    setInitialPostTags('Inspiration, Spiritual');
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateModal = (presetCategory?: string) => {
    setInitialPostContent('');
    setInitialPostTags(presetCategory || (activeFilter !== 'All' ? activeFilter : ''));
    setIsCreateModalOpen(true);
  };

  return (
    <div id="social-feed-view" className="w-full max-w-2xl mx-auto py-6 px-4">
      {/* 24-Hour Ephemeral Stories Reel */}
      <StoriesReel />

      {/* Real-time Active Online Members Bar */}
      <ActiveUsersBar />

      {/* Daily Motivational Quote - Displayed to all users and changes daily */}
      <DailyMotivationalCard onShareToFeed={handleShareQuoteToFeed} />

      {/* Quick Create Post Trigger Card */}
      <div
        id="quick-post-card"
        className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-5 mb-6 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          {user && <Avatar src={user.avatarUrl} name={user.name} size="md" />}
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex-1 text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-sm transition-all flex items-center justify-between"
          >
            <span>What's on your mind? Share photos or thoughts...</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/5">
          <button
            onClick={() => handleOpenCreateModal('Photography')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-blue-400 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>Share Photo</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>Camera Capture</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-xs font-bold shadow-lg transition-transform hover:scale-105"
          >
            Post
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center flex-shrink-0">
          <Compass className="w-3.5 h-3.5" />
        </div>
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === tag
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Feed Posts Stream */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Invite Friends & Share App Card at end of feed */}
      <div className="mt-8 p-6 rounded-[32px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/15 border border-blue-500/25 shadow-xl text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto shadow-lg shadow-blue-500/20">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Invite Friends to AURA</h4>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Share your personal referral link or QR code to chat in real-time, post stories, and jump on HD video calls!
          </p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('open_share_modal', { detail: { type: 'general' } })
            );
          }}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 inline-flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          <span>Open Invite & Share Hub</span>
        </button>
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          initialContent={initialPostContent}
          initialTags={initialPostTags}
        />
      )}
    </div>
  );
};
