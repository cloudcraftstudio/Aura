import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SocialPost } from '../../types';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface PostCardProps {
  post: SocialPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { likePost, addComment, toggleSavePost } = useSocial();
  const { user } = useAuth();

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const isLiked = user ? post.likedByUserIds.includes(user.id) : false;

  const handleLike = () => {
    likePost(post.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Post by ${post.authorName} on Aura`,
          text: post.content,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <article
      id={`post-card-${post.id}`}
      className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden transition-all hover:border-white/20 mb-6"
    >
      {/* Author Header */}
      <div className="p-5 flex items-center justify-between">
        <div
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('open_user_profile', { detail: { userId: post.authorId } })
            );
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View ${post.authorName}'s profile`}
        >
          <div className="transition-transform group-hover:scale-105">
            <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                {post.authorName}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="group-hover:text-slate-300">@{post.authorHandle}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {post.isPendingSync ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Queued offline
                  </span>
                ) : (
                  formatDistanceToNow(post.createdAt, { addSuffix: true })
                )}
              </span>
            </div>
          </div>
        </div>

        {post.location && (
          <div className="flex items-center gap-1 text-[11px] text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <MapPin className="w-3 h-3" />
            <span>{post.location}</span>
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-5 pb-3">
        <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-line">{post.content}</p>

        {/* Tags / Categories */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 cursor-pointer bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Photo Responsive Display */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="px-5 pb-3.5">
          {post.mediaUrls.length === 1 ? (
            <div
              onClick={() => setSelectedPhotoIndex(0)}
              className="relative max-h-[580px] w-full rounded-2xl overflow-hidden cursor-pointer border border-white/10 group bg-black/50 flex items-center justify-center"
            >
              <img
                src={post.mediaUrls[0]}
                alt="Post media"
                referrerPolicy="no-referrer"
                className="w-full max-h-[580px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/20 shadow-xl">
                  Click to View Full Size
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-2 ${
                post.mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {post.mediaUrls.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/10 group bg-black/40"
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs text-white">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            id={`like-btn-${post.id}`}
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all ${
              isLiked
                ? 'text-pink-400 bg-pink-500/15 border border-pink-500/30'
                : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment Drawer Toggle */}
          <button
            id={`comments-toggle-${post.id}`}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span>{post.commentsCount || (post.comments ? post.comments.length : 0)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {isCommentsOpen && (
        <div className="px-5 py-4 border-t border-white/5 bg-black/20 space-y-3">
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <div
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('open_user_profile', { detail: { userId: c.authorId } })
                      );
                    }}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    title={`View ${c.authorName}'s profile`}
                  >
                    <Avatar src={c.authorAvatar} name={c.authorName} size="xs" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl p-2.5 border border-white/5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent('open_user_profile', { detail: { userId: c.authorId } })
                          );
                        }}
                        className="font-semibold text-white cursor-pointer hover:text-blue-300 transition-colors"
                      >
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-300">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No comments yet. Be the first to reply!</p>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Lightbox for full image inspection */}
      {selectedPhotoIndex !== null && (
        <ImageLightboxModal
          isOpen={true}
          images={post.mediaUrls}
          initialIndex={selectedPhotoIndex}
          caption={post.content}
          authorName={post.authorName}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
    </article>
  );
};
