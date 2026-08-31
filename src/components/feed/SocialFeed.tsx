import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Video, Compass, Share2, QrCode } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { StoriesReel } from '../stories/StoriesReel';
import { ActiveUsersBar } from './ActiveUsersBar';
import { PostCard } from './PostCard';
import { CreatePostModal, POST_CATEGORIES } from './CreatePostModal';
import { Avatar } from '../common/Avatar';

const TAG_FILTERS = ['All', ...POST_CATEGORIES];

export const SocialFeed: React.FC = () => {
  const { posts } = useSocial();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialPostContent, setInitialPostContent] = useState('');
  const [initialPostTags, setInitialPostTags] = useState('');

  useEffect(() => {
    const handleOpenCreatePost = (e: Event) => {
      const customEvent = e as CustomEvent<{ content?: string; tags?: string }>;
      if (customEvent.detail?.content) {
        setInitialPostContent(customEvent.detail.content);
      }
      if (customEvent.detail?.tags) {
        setInitialPostTags(customEvent.detail.tags);
      }
      setIsCreateModalOpen(true);
    };
    window.addEventListener('open_create_post', handleOpenCreatePost);
    return () => window.removeEventListener('open_create_post', handleOpenCreatePost);
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'All') return true;
    return post.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  const handleOpenCreateModal = (presetCategory?: string) => {
    setInitialPostContent('');
    setInitialPostTags(presetCategory || (activeFilter !== 'All' ? activeFilter : ''));
    setIsCreateModalOpen(true);
  };

  return (
    <div id="social-feed-view" className="w-full max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      {/* 24-Hour Ephemeral Stories Reel - Facebook-style rich card layout */}
      <StoriesReel />

      {/* Real-time Active Online Members Bar */}
      <ActiveUsersBar />

      {/* Quick Create Post Trigger Card (Facebook-style composer) */}
      <div
        id="quick-post-card"
        className="rounded-2xl bg-[#0b0f24]/90 backdrop-blur-xl border border-white/10 p-3.5 sm:p-4 mb-4 shadow-lg"
      >
        <div className="flex items-center gap-3">
          {user && <Avatar src={user.avatarUrl} name={user.name} size="md" />}
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs sm:text-sm transition-all flex items-center justify-between"
          >
            <span>What's on your mind?</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 gap-1">
          <button
            onClick={() => handleOpenCreateModal('Photography')}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-blue-400 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Photo</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-amber-300 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cards & Quotes</span>
            <span className="sm:hidden">Cards</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-purple-400 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>Camera</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-2">
        <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center flex-shrink-0">
          <Compass className="w-3.5 h-3.5" />
        </div>
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === tag
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Feed Posts Stream with Interleaved Drift Cards */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => {
          // Interleave a Prayer Wall drift card every 4 posts
          const showPrayerDrift = index > 0 && index % 4 === 0;
          // Interleave a Bible Study drift card every 7 posts
          const showStudyDrift = index > 0 && index % 7 === 0;

          return (
            <React.Fragment key={post.id}>
              <PostCard post={post} />

              {showPrayerDrift && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 border border-amber-500/30 p-4 shadow-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                      🙏 Prayer Wall Activity
                    </span>
                    <span className="text-[10px] text-slate-400">Community Request</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">"Lord, grant strength, peace, and guidance today."</h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Recent prayer request shared on the sanctuary wall. Lift up our brothers and sisters in faith.
                    </p>
                  </div>
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'bible' } }));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Pray Now</span>
                    </button>
                  </div>
                </div>
              )}

              {showStudyDrift && (
                <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/30 border border-blue-500/30 p-4 shadow-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                      📖 Bible Study & Expositions
                    </span>
                    <span className="text-[10px] text-slate-400">Featured Lesson</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">The Book of Hebrews: Anchor of the Soul</h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Dive into verse-by-verse notes, historical context, and daily application questions.
                    </p>
                  </div>
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'bible' } }));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Join Study</span>
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
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
