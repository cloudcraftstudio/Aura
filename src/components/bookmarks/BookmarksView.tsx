import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { PostCard } from '../feed/PostCard';

export const BookmarksView: React.FC = () => {
  const { posts, savedPostIds } = useSocial();

  const savedPosts = posts.filter((p) => savedPostIds.includes(p.id));

  return (
    <div id="bookmarks-view" className="w-full max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400/20" /> Saved Posts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bookmarked photos, discussions, and updates stored in your private collection.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
          {savedPosts.length} saved
        </span>
      </div>

      {savedPosts.length > 0 ? (
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No saved posts yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any post in your social feed to save it for quick reference later.
          </p>
        </div>
      )}
    </div>
  );
};
