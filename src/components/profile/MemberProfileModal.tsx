import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageSquare,
  Video,
  Phone,
  UserPlus,
  UserCheck,
  Share2,
  Sparkles,
  ShieldCheck,
  Radio,
  FileText,
  Activity,
  Heart,
  MessageCircle,
  Clock,
  Maximize2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';

interface MemberProfileModalProps {
  userId: string;
  onClose: () => void;
  onOpenSelfEdit?: () => void;
}

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80';

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  userId,
  onClose,
  onOpenSelfEdit,
}) => {
  const { user: currentUser, allUsers, followUser } = useAuth();
  const { startDirectConversation, setActiveConversationId } = useChat();
  const { startCall } = useCall();
  const { posts, likePost } = useSocial();

  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const targetUser = allUsers.find((u) => u.id === userId);

  if (!targetUser) return null;

  const isSelf = currentUser?.id === targetUser.id;
  const isFollowing = currentUser?.followingUserIds?.includes(targetUser.id);
  const isOnline = targetUser.status === 'online';
  const isBusy = targetUser.status === 'busy';

  // Filter posts by this user
  const userPosts = posts.filter((p) => p.authorId === targetUser.id);

  const handleToggleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      await followUser(targetUser.id);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleStartMessage = async () => {
    const conv = await startDirectConversation(targetUser);
    setActiveConversationId(conv.id);
    onClose();
  };

  const handleStartCall = (isVideo: boolean) => {
    onClose();
    startCall(targetUser, isVideo);
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/?user=${targetUser.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const coverUrl = targetUser.bannerUrl || DEFAULT_COVER_IMAGE;

  return (
    <div
      id="member-profile-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in select-none overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0c1024]/95 border border-white/20 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Full Image Zoom Lightbox Overlay */}
        <AnimatePresence>
          {zoomImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
            >
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomImage}
                alt="Full View"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Section - High Definition & Fully Visible */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-900 overflow-hidden flex-shrink-0 group">
          <img
            src={coverUrl}
            alt="Cover Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => setZoomImage(coverUrl)}
          />

          {/* Gradient shading for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1024] via-transparent to-black/30 pointer-events-none" />

          {/* Banner expand button */}
          <button
            type="button"
            onClick={() => setZoomImage(coverUrl)}
            className="absolute top-3.5 left-3.5 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100"
            title="View Full Cover Image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Modal Button */}
          <button
            id="close-member-profile-btn"
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-md border border-white/20 shadow-xl z-20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details Container */}
        <div className="px-5 sm:px-6 pb-6 pt-0 overflow-y-auto scrollbar-thin flex-1 min-h-0">
          {/* Avatar and Top Actions Bar */}
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4 relative z-20">
            <div
              className="relative cursor-pointer group"
              onClick={() => setZoomImage(targetUser.avatarUrl)}
              title="Click to view full photo"
            >
              <div className="p-1.5 rounded-full bg-[#0c1024] shadow-2xl ring-4 ring-[#0c1024]">
                <Avatar
                  src={targetUser.avatarUrl}
                  name={targetUser.name}
                  size="2xl"
                  className="group-hover:opacity-90 transition-opacity"
                />
              </div>

              {/* Online indicator */}
              <span
                className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#0c1024] shadow-md ${
                  isOnline
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/40'
                    : isBusy
                    ? 'bg-amber-400 ring-2 ring-amber-500/40'
                    : 'bg-slate-500'
                }`}
                title={targetUser.status}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSelfEdit?.();
                  }}
                  className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    id="member-follow-btn"
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
                      isFollowing
                        ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white border border-white/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    id="member-msg-btn"
                    type="button"
                    onClick={handleStartMessage}
                    className="p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-blue-600 text-white transition-all border border-white/15 shadow-md"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    id="member-videocall-btn"
                    type="button"
                    onClick={() => handleStartCall(true)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all border border-emerald-500/30 shadow-md"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button
                    id="member-audiocall-btn"
                    type="button"
                    onClick={() => handleStartCall(false)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-500 text-indigo-300 hover:text-white transition-all border border-indigo-500/30 shadow-md"
                    title="Start Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleShareProfile}
                className="p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {copiedLink && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center animate-fade-in">
              Profile link copied to clipboard!
            </div>
          )}

          {/* User Name & Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">{targetUser.name}</h3>
              {targetUser.isVerified && (
                <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>@{targetUser.handle}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Radio className={`w-3 h-3 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="capitalize">{targetUser.status}</span>
              </span>
            </div>
          </div>

          {/* Bio */}
          {targetUser.bio && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 whitespace-pre-line bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
              {targetUser.bio}
            </p>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <div>
              <p className="text-base sm:text-lg font-extrabold text-white">{userPosts.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">Posts</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-white">{targetUser.followersCount || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Followers</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-white">{targetUser.followingCount || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Following</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-white/10 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Posts ({userPosts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>About & Details</span>
            </button>
          </div>

          {/* Tab 1: Posts by this User */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {userPosts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No posts published yet by {targetUser.name.split(' ')[0]}.
                </div>
              ) : (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </span>
                      {post.location && <span className="text-blue-300 font-medium">{post.location}</span>}
                    </div>

                    <p className="text-xs text-white leading-relaxed">{post.content}</p>

                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="rounded-xl overflow-hidden max-h-48 bg-black/40 border border-white/10">
                        <img
                          src={post.mediaUrls[0]}
                          alt="Post media"
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setZoomImage(post.mediaUrls[0])}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          currentUser && post.likedByUserIds.includes(currentUser.id)
                            ? 'text-pink-400 font-bold'
                            : 'hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            currentUser && post.likedByUserIds.includes(currentUser.id)
                              ? 'fill-pink-500 text-pink-500'
                              : ''
                          }`}
                        />
                        <span>{post.likesCount}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span>{post.commentsCount || (post.comments ? post.comments.length : 0)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: About & Details */}
          {activeTab === 'about' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Joined Aura:</span>
                  <span className="font-semibold text-white">{targetUser.joinedAt || 'Recently'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Status Message:</span>
                  <span className="font-semibold text-white">{targetUser.statusMessage || 'Active'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Identity Verification:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Member
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-blue-200">
                <p className="font-semibold mb-1">Encrypted WebRTC Audio & Video</p>
                <p className="text-[11px] text-blue-300/80 leading-relaxed">
                  Calls and direct messages with {targetUser.name} are synchronized in real-time across your phone and desktop.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
