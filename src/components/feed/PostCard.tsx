import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SocialPost } from '../../types';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { AsyncMedia } from '../common/AsyncMedia';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { extractVideosFromText, isDirectVideoUrl } from '../../utils/mediaUtils';
import { VideoEmbed } from '../common/VideoEmbed';
import { CreatePostModal } from './CreatePostModal';

interface PostCardProps {
  post: SocialPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { likePost, addComment, toggleSavePost, deletePost } = useSocial();
  const { user } = useAuth();

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isLiked = user ? post.likedByUserIds.includes(user.id) : false;

  React.useEffect(() => {
    const handleOpenPost = (e: Event) => {
      const customEvent = e as CustomEvent<{ postId: string; openComments?: boolean }>;
      if (customEvent.detail?.postId === post.id) {
        setIsHighlighted(true);
        if (customEvent.detail.openComments) {
          setIsCommentsOpen(true);
        }
        const el = document.getElementById(`post-card-${post.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => setIsHighlighted(false), 3000);
      }
    };
    window.addEventListener('open_post', handleOpenPost);
    return () => window.removeEventListener('open_post', handleOpenPost);
  }, [post.id]);

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
      className={`rounded-[32px] bg-white/5 backdrop-blur-2xl border shadow-2xl overflow-hidden transition-all duration-500 mb-6 ${
        isHighlighted
          ? 'border-blue-400/80 shadow-[0_0_35px_rgba(59,130,246,0.35)] ring-2 ring-blue-400/50'
          : 'border-white/10 hover:border-white/20'
      }`}
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

        <div className="flex items-center gap-3 relative">
          {post.location && (
            <div className="flex items-center gap-1 text-[11px] text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <MapPin className="w-3 h-3" />
              <span>{post.location}</span>
            </div>
          )}
          
          {user && user.id === post.authorId && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm('Are you sure you want to delete this post?')) {
                        deletePost(post.id);
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content & Video Embeds */}
      <div className="px-5 pb-3">
        <RichTextRenderer content={post.content} className="text-sm text-slate-100" />

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

      {/* Media Photo & Direct Video Responsive Display */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (() => {
        // Filter out URLs that are standalone videos to avoid double rendering with text if already embedded
        const contentVideos = extractVideosFromText(post.content);
        const contentVideoUrls = new Set(contentVideos.map(v => v.url));

        const externalVideoMedia = post.mediaUrls.filter(url => {
          const yt = extractVideosFromText(url);
          return yt.length > 0 && yt[0].type !== 'direct' && !contentVideoUrls.has(url);
        });

        const nativeMedia = post.mediaUrls.filter(url => {
          const yt = extractVideosFromText(url);
          return yt.length === 0 || yt[0].type === 'direct';
        });

        return (
          <div className="px-5 pb-3.5 space-y-3">
            {/* Any external video embeds (YouTube) */}
            {externalVideoMedia.map((vUrl, vIdx) => {
              const extracted = extractVideosFromText(vUrl);
              const vObj = extracted[0];
              return <VideoEmbed key={vIdx} video={vObj} />;
            })}

            {/* Native Media (Photos & Direct Videos) */}
            {nativeMedia.length === 1 && (
              <div
                onClick={() => {
                  if (!isDirectVideoUrl(nativeMedia[0])) {
                    setSelectedPhotoIndex(0);
                  }
                }}
                className={`relative max-h-[580px] w-full rounded-2xl overflow-hidden ${!isDirectVideoUrl(nativeMedia[0]) ? 'cursor-pointer group' : ''} border border-white/10 bg-black/50 flex items-center justify-center`}
              >
                {isDirectVideoUrl(nativeMedia[0]) ? (
                  <AsyncMedia
                    mediaType="video"
                    src={nativeMedia[0]}
                    controls
                    playsInline
                    className="w-full max-h-[580px] object-contain bg-black"
                  />
                ) : (
                  <>
                    <AsyncMedia
                      mediaType="image"
                      src={nativeMedia[0]}
                      alt="Post media"
                      className="w-full max-h-[580px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/20 shadow-xl">
                        Click to View Full Size
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {nativeMedia.length > 1 && (
              <div
                className={`grid gap-2 ${
                  nativeMedia.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {nativeMedia.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (!isDirectVideoUrl(url)) {
                        setSelectedPhotoIndex(i);
                      }
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden ${!isDirectVideoUrl(url) ? 'cursor-pointer group' : ''} border border-white/10 bg-black/40`}
                  >
                    {isDirectVideoUrl(url) ? (
                      <AsyncMedia
                        mediaType="video"
                        src={url}
                        controls
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <>
                        <AsyncMedia
                          mediaType="image"
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs text-white">
                            View
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

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
                    <div className="mt-1">
                      <RichTextRenderer content={c.content} className="text-slate-300" showVideoEmbeds={true} />
                    </div>
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

      {isEditing && (
        <CreatePostModal
          onClose={() => setIsEditing(false)}
          initialContent={post.content}
          initialTags={post.tags}
          initialMedia={post.mediaUrls}
          initialLocation={post.location}
          editPostId={post.id}
        />
      )}
    </article>
  );
};
