export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  status: UserStatus;
  statusMessage?: string;
  followersCount: number;
  followingCount: number;
  isVerified?: boolean;
  joinedAt: string;
  authProvider?: 'google' | 'email' | 'guest' | 'demo';
  hasPassword?: boolean;
}

export type MediaType = 'image' | 'video' | 'audio' | 'none';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  audioDuration?: number;
  reactions?: Record<string, string[]>; // emoji -> [userId1, userId2]
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    mediaUrl?: string;
  };
  storyReply?: {
    storyId: string;
    mediaUrl: string;
    caption?: string;
    authorName: string;
  };
  callLog?: {
    callType: 'video' | 'audio';
    status: 'missed' | 'completed' | 'declined';
    durationSeconds?: number;
  };
  timestamp: number;
  isRead: boolean;
  isDelivered?: boolean;
  isPendingSync?: boolean;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participantIds: string[];
  participants: UserProfile[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  typingUserIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: number;
  likesCount: number;
  likedByUserIds: string[];
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  mediaUrls: string[];
  tags: string[];
  location?: string;
  likesCount: number;
  likedByUserIds: string[];
  commentsCount: number;
  comments?: PostComment[];
  sharesCount: number;
  savedByUserIds: string[];
  createdAt: number;
  isPendingSync?: boolean;
}

export interface StorySlide {
  id: string;
  mediaUrl: string;
  caption?: string;
  createdAt: number;
}

export interface UserStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  createdAt: number;
  seenByUserIds: string[];
  slides?: StorySlide[];
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'declined' | 'busy';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  isVideo: boolean;
  status: CallStatus;
  startedAt?: number;
  endedAt?: number;
  roomId: string;
}

export type NotificationType = 'chat' | 'call' | 'like' | 'comment' | 'follow' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  avatar?: string;
  actionId?: string;
  timestamp: number;
  isRead: boolean;
}

export interface OfflineSyncQueueItem {
  id: string;
  type: 'send_message' | 'create_post' | 'like_post' | 'add_comment' | 'update_profile';
  payload: any;
  timestamp: number;
  retryCount: number;
}
