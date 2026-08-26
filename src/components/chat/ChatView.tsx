import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Video,
  Phone,
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  Reply,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Users,
  Plus,
  X,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  Share2,
  Home,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { ChatMessage, UserProfile, Conversation } from '../../types';
import { Avatar } from '../common/Avatar';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { RichTextRenderer } from '../common/RichTextRenderer';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🚀', '✨'];

export const ChatView: React.FC = () => {
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversationId,
    sendMessage,
    addReaction,
    startDirectConversation,
    createGroupConversation,
    activeTypingUsers,
    setTyping,
  } = useChat();

  const { user, allUsers } = useAuth();
  const { startCall } = useCall();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [selectedImageAttachment, setSelectedImageAttachment] = useState<string | null>(null);
  const [mobileShowChatRoom, setMobileShowChatRoom] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioTimerRef = useRef<any>(null);

  const rawMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  // Deduplicate messages by ID and near-simultaneous duplicate contents
  const currentMessages = useMemo(() => {
    const seenIds = new Set<string>();
    const result: ChatMessage[] = [];
    rawMessages.forEach((m) => {
      if (!seenIds.has(m.id)) {
        const isDuplicateContent = result.some(
          (prev) =>
            prev.senderId === m.senderId &&
            prev.content === m.content &&
            Math.abs(prev.timestamp - m.timestamp) < 3000
        );
        if (!isDuplicateContent) {
          seenIds.add(m.id);
          result.push(m);
        }
      }
    });
    return result;
  }, [rawMessages]);

  const handleExitChatToFeed = () => {
    window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'feed' } }));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeConversation?.id]);

  // Audio recording timer
  useEffect(() => {
    if (isRecordingAudio) {
      setAudioTimer(0);
      audioTimerRef.current = setInterval(() => {
        setAudioTimer((p) => p + 1);
      }, 1000);
    } else {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [isRecordingAudio]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileShowChatRoom(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedImageAttachment) return;

    sendMessage(
      messageInput,
      selectedImageAttachment || undefined,
      selectedImageAttachment ? 'image' : 'none',
      undefined,
      replyingTo || undefined
    );

    setMessageInput('');
    setSelectedImageAttachment(null);
    setReplyingTo(null);
    setTyping(false);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingAudio(false);
    sendMessage('🎤 Voice Audio Note', undefined, 'audio', Math.max(2, audioTimer));
    setAudioTimer(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedImageAttachment(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCall = (isVideo: boolean) => {
    if (!activeConversation || !user) return;
    const targetUser = activeConversation.participants.find((p) => p.id !== user.id);
    if (targetUser) {
      startCall(targetUser, isVideo);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const members = allUsers.filter((u) => selectedGroupMembers.includes(u.id));
    createGroupConversation(newGroupName.trim(), members);
    setIsNewGroupModalOpen(false);
    setNewGroupName('');
    setSelectedGroupMembers([]);
    setMobileShowChatRoom(true);
  };

  const getRecipient = (conv: Conversation) => {
    if (conv.isGroup) return null;
    return conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
  };

  const filteredConversations = conversations.filter((c) => {
    if (c.isGroup) {
      return c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const other = getRecipient(c);
    return (
      other?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other?.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      id="chat-view"
      className="w-full max-w-6xl mx-auto h-full flex gap-3 md:gap-6 overflow-hidden flex-1 min-h-0 p-2 sm:p-4"
    >
      {/* Left Sidebar: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 rounded-3xl bg-[#090d22]/85 backdrop-blur-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl ${
          mobileShowChatRoom ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header with Search & New Actions */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 space-y-3 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                id="exit-chat-to-feed-btn"
                onClick={handleExitChatToFeed}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                title="Back to Feed"
              >
                <Home className="w-4 h-4 text-blue-400" />
              </button>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Messages</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {conversations.length}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="invite-chat-btn"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('open_share_modal', { detail: { type: 'chat' } })
                  );
                }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                title="Invite Friends to Chat"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
              </button>

              <button
                id="new-group-btn"
                onClick={() => setIsNewGroupModalOpen(true)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                title="Create Group"
              >
                <Users className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                id="new-chat-btn"
                onClick={() => setIsNewChatModalOpen(true)}
                className="w-8 h-8 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                title="Start New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 space-y-1.5">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations found. Start a new chat!
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const recipient = getRecipient(conv);

              return (
                <div
                  key={conv.id}
                  id={`conversation-item-${conv.id}`}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-white/10 border border-white/15 shadow-md'
                      : 'opacity-80 hover:opacity-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Avatar
                    src={conv.isGroup ? conv.avatar : recipient?.avatarUrl}
                    name={conv.isGroup ? conv.name || 'Group' : recipient?.name || 'User'}
                    size="md"
                    status={conv.isGroup ? undefined : recipient?.status}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-semibold text-xs text-white truncate">
                        {conv.isGroup ? conv.name : recipient?.name}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDistanceToNow(conv.lastMessage.timestamp, { addSuffix: false })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-300 truncate flex items-center gap-1">
                        {conv.lastMessage?.storyReply && (
                          <Sparkles className="w-3 h-3 text-pink-400 flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {conv.lastMessage
                            ? conv.lastMessage.storyReply
                              ? `Story reply: ${conv.lastMessage.content || '❤️'}`
                              : conv.lastMessage.content || (conv.lastMessage.mediaType === 'image' ? '📷 Photo attachment' : 'Message')
                            : 'Start chatting'}
                        </span>
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-md">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Chat Area */}
      <div
        className={`w-full md:flex-1 rounded-3xl bg-[#090d22]/85 backdrop-blur-2xl border border-white/10 flex flex-col h-full min-h-0 overflow-hidden shadow-2xl ${
          mobileShowChatRoom ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Room Top Bar */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md flex-shrink-0 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setMobileShowChatRoom(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                  title="Back to conversations"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {(() => {
                  const recipient = getRecipient(activeConversation);
                  return (
                    <div
                      onClick={() => {
                        if (!activeConversation.isGroup && recipient) {
                          window.dispatchEvent(
                            new CustomEvent('open_user_profile', { detail: { userId: recipient.id } })
                          );
                        }
                      }}
                      className={`flex items-center gap-2.5 min-w-0 ${
                        !activeConversation.isGroup ? 'cursor-pointer group' : ''
                      }`}
                      title={!activeConversation.isGroup ? `View ${recipient?.name}'s profile` : undefined}
                    >
                      <div className="transition-transform group-hover:scale-105">
                        <Avatar
                          src={activeConversation.isGroup ? activeConversation.avatar : recipient?.avatarUrl}
                          name={activeConversation.isGroup ? activeConversation.name || 'Group' : recipient?.name || 'User'}
                          size="sm"
                          status={activeConversation.isGroup ? undefined : recipient?.status}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {activeConversation.isGroup ? activeConversation.name : recipient?.name}
                        </h4>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block flex-shrink-0" />
                          {activeConversation.isGroup
                            ? `${activeConversation.participantIds.length} members`
                            : recipient?.statusMessage || (recipient?.status === 'online' ? 'Active now' : 'Offline')}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* WebRTC Video & Audio Call Buttons, Share & Exit */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  id="share-chat-conversation-btn"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('open_share_modal', { detail: { type: 'chat' } })
                    );
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1"
                  title="Invite Others to this Chat"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden lg:inline">Invite</span>
                </button>

                <button
                  id="start-audio-call-btn"
                  onClick={() => handleStartCall(false)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1"
                  title="WebRTC Audio Call"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Call</span>
                </button>

                <button
                  id="start-video-call-btn"
                  onClick={() => handleStartCall(true)}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-medium transition-all flex items-center gap-1 shadow-lg shadow-blue-500/15 hover:scale-105"
                  title="WebRTC HD Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Join Video</span>
                </button>

                {/* Exit Chat Button */}
                <button
                  id="close-chat-btn"
                  onClick={handleExitChatToFeed}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/10 text-slate-300 hover:text-rose-300 transition-all text-xs font-medium flex items-center gap-1"
                  title="Exit to Feed"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-rose-300" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 overscroll-contain">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                  <Sparkles className="w-8 h-8 text-blue-400/50 mb-2 animate-bounce" />
                  <p className="font-semibold text-white">No messages yet</p>
                  <p>Send a message or photo to start the conversation.</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = user?.id === msg.senderId;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isMe && (
                        <div
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('open_user_profile', { detail: { userId: msg.senderId } })
                            );
                          }}
                          className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                          title={`View ${msg.senderName}'s profile`}
                        >
                          <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" />
                        </div>
                      )}

                      <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Sender name for group chats */}
                        {!isMe && activeConversation.isGroup && (
                          <p
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent('open_user_profile', { detail: { userId: msg.senderId } })
                              );
                            }}
                            className="text-[10px] font-semibold text-blue-300 px-1 cursor-pointer hover:text-blue-200 transition-colors"
                          >
                            {msg.senderName}
                          </p>
                        )}

                        {/* Quoted reply message */}
                        {msg.replyTo && (
                          <div
                            className={`p-2 rounded-xl text-xs mb-1 border ${
                              isMe
                                ? 'bg-blue-600/30 border-blue-400/20 text-blue-200'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            <p className="font-bold text-[10px] opacity-80">{msg.replyTo.senderName}</p>
                            <p className="truncate">{msg.replyTo.content}</p>
                          </div>
                        )}

                        {/* Quoted story reply badge */}
                        {msg.storyReply && (
                          <div
                            className={`p-2 rounded-xl text-xs mb-1.5 border flex items-center gap-2.5 ${
                              isMe
                                ? 'bg-black/35 border-blue-400/30 text-blue-100 shadow-md'
                                : 'bg-black/40 border-white/15 text-slate-200 shadow-md'
                            }`}
                          >
                            {msg.storyReply.mediaUrl && (
                              <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/20 bg-black/60 shadow-sm">
                                <img
                                  src={msg.storyReply.mediaUrl}
                                  alt="Story"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-pink-400">
                                <Sparkles className="w-3 h-3" />
                                <span>Replied to {isMe ? `${msg.storyReply.authorName}'s story` : 'your story'}</span>
                              </div>
                              {msg.storyReply.caption && (
                                <p className="text-[11px] text-slate-300 italic truncate mt-0.5 opacity-90">
                                  "{msg.storyReply.caption}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Main Message Bubble */}
                        <div
                          className={`relative group p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm ${
                            isMe
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-blue-600/25 border border-blue-400/30'
                              : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/10'
                          }`}
                        >
                          {/* Image Attachment */}
                          {msg.mediaUrl && msg.mediaType === 'image' && (
                            <div
                              onClick={() => setLightboxImage(msg.mediaUrl || null)}
                              className="rounded-xl overflow-hidden mb-2 border border-white/10 max-h-60 cursor-pointer group relative"
                            >
                              <img
                                src={msg.mediaUrl}
                                alt="Attachment"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white">
                                  View Photo
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Voice Note Audio Bar */}
                          {msg.mediaType === 'audio' && (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/20 mb-1">
                              <Mic className="w-4 h-4 text-pink-400 animate-pulse" />
                              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-400 w-2/3" />
                              </div>
                              <span className="text-[10px] font-mono text-slate-300">
                                0:0{msg.audioDuration || 3}
                              </span>
                            </div>
                          )}

                          {/* Message Text Content */}
                          {msg.content && (
                            <RichTextRenderer
                              content={msg.content}
                              className={isMe ? 'text-white' : 'text-slate-100'}
                              showVideoEmbeds={true}
                            />
                          )}

                          {/* Timestamp & Read Status */}
                          <div
                            className={`flex items-center gap-1 mt-1 text-[9px] ${
                              isMe ? 'text-blue-200 justify-end' : 'text-slate-400'
                            }`}
                          >
                            <span>{format(msg.timestamp, 'HH:mm')}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                          </div>

                          {/* Hover Emoji Reaction Bar */}
                          <div
                            className={`absolute top-0 ${
                              isMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                            } hidden group-hover:flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-md shadow-xl z-10`}
                          >
                            {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-xs"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 text-slate-300 hover:text-white"
                              title="Reply"
                            >
                              <Reply className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Reactions Badges */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, rawIds]) => {
                              const userIds = (rawIds as string[]) || [];
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className={`px-1.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1 transition-all ${
                                    user && userIds.includes(user.id)
                                      ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{userIds.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview before send */}
            {selectedImageAttachment && (
              <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImageAttachment}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-white/15"
                  />
                  <span className="text-xs text-slate-300">Photo attached</span>
                </div>
                <button
                  onClick={() => setSelectedImageAttachment(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Replying banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Reply className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-400">Replying to {replyingTo.senderName}:</span>
                  <span className="text-slate-200 truncate max-w-xs">{replyingTo.content}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Chat Input Toolbar */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 sm:p-3.5 border-t border-white/10 bg-[#090d22] backdrop-blur-xl flex items-center gap-2 flex-shrink-0 z-20 sticky bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0"
                title="Attach Photo"
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
              </button>

              <button
                type="button"
                onClick={isRecordingAudio ? handleSendVoiceNote : () => setIsRecordingAudio(true)}
                className={`p-2.5 rounded-2xl border transition-all flex-shrink-0 ${
                  isRecordingAudio
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title={isRecordingAudio ? 'Stop and send voice note' : 'Record voice note'}
              >
                <Mic className="w-4 h-4" />
              </button>

              {isRecordingAudio ? (
                <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
                  <span className="truncate mr-2 font-medium">Recording voice... {audioTimer}s</span>
                  <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className="font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1 rounded-xl text-xs flex-shrink-0 shadow-md"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder="Type a message or paste a link..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    setTyping(true);
                  }}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 text-sm sm:text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-inner"
                />
              )}

              <button
                id="send-message-btn"
                type="submit"
                disabled={!messageInput.trim() && !selectedImageAttachment}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-40 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Select a conversation</h4>
            <p className="text-xs max-w-xs">
              Choose from existing messages or start a new peer-to-peer chat.
            </p>
          </div>
        )}
      </div>

      {/* New Group Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#090d22] border border-white/15 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Create New Group</h3>
              <button
                onClick={() => setIsNewGroupModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Tech Circle"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Select Members</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {allUsers
                    .filter((u) => u.id !== user?.id)
                    .map((u) => {
                      const isSelected = selectedGroupMembers.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedGroupMembers((prev) =>
                              isSelected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                            );
                          }}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                            <div>
                              <p className="text-xs font-semibold">{u.name}</p>
                              <p className="text-[10px] text-slate-400">@{u.handle}</p>
                            </div>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/20'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newGroupName.trim() || selectedGroupMembers.length === 0}
                className="w-full py-2.5 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-500/30"
              >
                Create Group Chat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Direct Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#090d22] border border-white/15 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Start a Direct Conversation</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {allUsers
                .filter((u) => u.id !== user?.id)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      startDirectConversation(u);
                      setIsNewChatModalOpen(false);
                      setMobileShowChatRoom(true);
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 text-left transition-all"
                  >
                    <Avatar src={u.avatarUrl} name={u.name} size="sm" status={u.status} />
                    <div>
                      <p className="text-xs font-semibold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">@{u.handle}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          images={[lightboxImage]}
          initialIndex={0}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
