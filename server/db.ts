import fs from 'fs';
import path from 'path';

export interface DBUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  statusMessage?: string;
  followersCount: number;
  followingCount: number;
  followingUserIds?: string[];
  isVerified?: boolean;
  joinedAt: string;
  googleId?: string;
  passwordHash?: string;
  authProvider?: 'google' | 'email' | 'guest' | 'demo';
}

export interface DBComment {
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

export interface DBPost {
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
  comments?: DBComment[];
  sharesCount: number;
  savedByUserIds: string[];
  createdAt: number;
}

export interface DBStorySlide {
  id: string;
  mediaUrl: string;
  caption?: string;
  createdAt: number;
}

export interface DBStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  createdAt: number;
  seenByUserIds: string[];
  slides?: DBStorySlide[];
}

export interface DBMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'none';
  audioDuration?: number;
  reactions?: Record<string, string[]>;
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
}

export interface DBConversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participantIds: string[];
  participants: DBUser[];
  lastMessage?: DBMessage;
  unreadCount: number;
  typingUserIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DBCallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  isVideo: boolean;
  status: 'calling' | 'connected' | 'ended' | 'declined';
  roomId: string;
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DBCallSignal {
  id: string;
  roomId: string;
  senderId: string;
  type: 'offer' | 'answer' | 'candidate';
  data: any;
  timestamp: number;
}

// ── Bible Study / LMS Models ──────────────────────────────────────────────

export interface DBCourse {
  id: string;
  title: string;
  description: string;
  track: string; // e.g. 'foundations', 'wisdom', 'prophecy', 'new-testament'
  lessonIds: string[];
  createdAt: number;
}

export interface DBLesson {
  id: string;
  courseId: string;
  title: string;
  scriptureRef: string; // e.g. "John 3:16"
  content: string;
  order: number;
  quizJson: QuizQuestion[] | null; // optional quiz attached to lesson
  createdAt: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number; // 0-based index into options
}

export interface DBUserProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  currentLessonId: string | null;
  notes: string; // free-form study notes
  startedAt: number;
  lastActivityAt: number;
}

export interface DBVerseCommentaryCache {
  id: string;          // normalized ref key, e.g. "john_3_16"
  scriptureRef: string;
  commentary: {
    passageText: string;
    bookSummary: string;
    historicalContext: string;
    thenVsNow: string;
    dailyApplication: string;
    closingPrayer: string;
  };
  cachedAt: number;
}

// ── Core DB Schema ─────────────────────────────────────────────────────────

export interface DatabaseSchema {
  users: DBUser[];
  posts: DBPost[];
  stories: DBStory[];
  conversations: DBConversation[];
  messages: Record<string, DBMessage[]>; // conversationId -> messages
  system: {
    version: string;
    lastBackup: number;
    createdAt: number;
  };
}

const SEED_USERS: DBUser[] = [
  {
    id: 'user_tex',
    name: 'Tex',
    handle: 'tex',
    email: 'lightsouttattootex@gmail.com',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=lightsouttattootex@gmail.com',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Lights Out Tattoo ✦ Real-time Social & Calling ✨',
    status: 'online',
    statusMessage: 'Online & Active',
    followersCount: 0,
    followingCount: 0,
    isVerified: true,
    joinedAt: '2024-01-01',
    authProvider: 'google',
  },
  {
    id: 'user_kimberly',
    name: 'Kimberly',
    handle: 'kimberly',
    email: 'kimberly@lightsouttattoo.site',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kimberly',
    bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    bio: 'Active member on Aura 🌟',
    status: 'online',
    statusMessage: 'Active',
    followersCount: 0,
    followingCount: 0,
    isVerified: true,
    joinedAt: '2024-01-01',
    authProvider: 'email',
  },
];

const SEED_POSTS: DBPost[] = [];

const SEED_STORIES: DBStory[] = [];

const SEED_CONVERSATIONS: DBConversation[] = [];

const SEED_MESSAGES: Record<string, DBMessage[]> = {};


class JSONDatabase {
  private dbPath: string;
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  // In-memory LMS stores (lightweight, no need to persist to main db.json)
  private courses: Map<string, DBCourse> = new Map();
  private lessons: Map<string, DBLesson> = new Map();
  private userProgress: Map<string, DBUserProgress> = new Map(); // key: userId_courseId
  private verseCache: Map<string, DBVerseCommentaryCache> = new Map();

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }

    this.dbPath = path.join(dataDir, 'db.json');
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    const dummyIds = new Set(['user_alex', 'user_maya', 'user_liam', 'user_elena', 'user_daphne', 'user_skylor']);
    const dummyHandles = new Set(['alexrivera', 'mayachen', 'liamvance', 'elenarostova']);
    const dummyEmailDomains = ['@aura.social'];
    const dummyEmails = new Set(['tex@lightsouttattoo.site', 'skylor@lightsouttattoo.site']);

    const isDummyUser = (u: any) => {
      if (!u) return true;
      if (dummyIds.has(u.id)) return true;
      if (dummyHandles.has(u.handle)) return true;
      if (u.email && (dummyEmails.has(u.email.toLowerCase()) || dummyEmailDomains.some(d => u.email.toLowerCase().endsWith(d)))) return true;
      return false;
    };

    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          // Filter out dummy users
          const cleanUsers = parsed.users.filter((u: any) => !isDummyUser(u));

          // Ensure SEED_USERS (Tex, Daphne, Kimberly, Skylor) are always present
          SEED_USERS.forEach((seedUser) => {
            const idx = cleanUsers.findIndex((u: any) => u.id === seedUser.id || u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (idx === -1) {
              cleanUsers.push({ ...seedUser, status: 'online' });
            } else {
              // Ensure online status
              cleanUsers[idx].status = 'online';
            }
          });

          // Clean posts
          const cleanPosts = (parsed.posts || []).filter((p: any) => !dummyIds.has(p.authorId) && !['post_1', 'post_2', 'post_3'].includes(p.id));

          // Clean stories
          const cleanStories = (parsed.stories || []).filter((s: any) => !dummyIds.has(s.userId) && !['story_1', 'story_2', 'story_3'].includes(s.id));

          // Clean conversations
          const cleanConversations = (parsed.conversations || []).filter((c: any) => {
            if (['conv_alex_maya', 'conv_alex_liam', 'conv_design_circle'].includes(c.id)) return false;
            if (Array.isArray(c.participantIds) && c.participantIds.some((pid: string) => dummyIds.has(pid))) return false;
            return true;
          });

          // Clean messages
          const cleanMessages: Record<string, DBMessage[]> = {};
          if (parsed.messages && typeof parsed.messages === 'object') {
            for (const [convId, msgs] of Object.entries(parsed.messages)) {
              if (['conv_alex_maya', 'conv_alex_liam', 'conv_design_circle'].includes(convId)) continue;
              if (Array.isArray(msgs)) {
                cleanMessages[convId] = (msgs as DBMessage[]).filter((m) => !dummyIds.has(m.senderId));
              }
            }
          }

          const sanitized: DatabaseSchema = {
            users: cleanUsers,
            posts: cleanPosts,
            stories: cleanStories,
            conversations: cleanConversations,
            messages: cleanMessages,
            system: parsed.system || {
              version: '2.0.0',
              lastBackup: Date.now(),
              createdAt: Date.now(),
            },
          };

          this.saveDataDirect(sanitized);
          return sanitized;
        }
      }
    } catch (e) {
      console.warn('Error reading database file, initializing with seed data:', e);
    }

    const initial: DatabaseSchema = {
      users: SEED_USERS,
      posts: SEED_POSTS,
      stories: SEED_STORIES,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      system: {
        version: '2.0.0',
        lastBackup: Date.now(),
        createdAt: Date.now(),
      },
    };

    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataDirect(this.data);
    }, 100);
  }

  // --- Users Operations ---
  public getUsers(): DBUser[] {
    return this.data.users;
  }

  public getUserById(id: string): DBUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByHandle(handle: string): DBUser | undefined {
    const clean = handle.replace('@', '').toLowerCase();
    return this.data.users.find((u) => u.handle.toLowerCase() === clean);
  }

  public createUser(user: Partial<DBUser> & { name: string; email: string }): DBUser {
    const existing = this.getUserByEmail(user.email);
    if (existing) {
      return existing;
    }

    const cleanHandle = (user.handle || user.name.toLowerCase().replace(/\s+/g, '')).replace('@', '');
    const newUser: DBUser = {
      id: user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: user.name,
      email: user.email,
      handle: cleanHandle,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
      bannerUrl: user.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: user.bio || 'Explorer on Aura ✨ Connected to real-time WebRTC social network.',
      status: user.status || 'online',
      statusMessage: user.statusMessage || 'Active on Aura',
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 4,
      isVerified: user.isVerified ?? false,
      joinedAt: user.joinedAt || new Date().toISOString().split('T')[0],
      googleId: user.googleId,
      passwordHash: user.passwordHash,
      authProvider: user.authProvider || (user.googleId ? 'google' : 'email'),
    };

    this.data.users.unshift(newUser);
    this.scheduleSave();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<DBUser>): DBUser | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const updated = { ...this.data.users[index], ...updates };
    this.data.users[index] = updated;

    // Update in conversations participant lists as well
    this.data.conversations.forEach((conv) => {
      if (Array.isArray(conv.participants)) {
        if (Array.isArray(conv.participants)) { conv.participants = conv.participants.map((p) => (p.id === id ? updated : p)); }
      }
    });

    this.scheduleSave();
    return updated;
  }

  public toggleFollowUser(currentUserId: string, targetUserId: string): { isFollowing: boolean; targetFollowersCount: number; currentFollowingCount: number } | null {
    if (currentUserId === targetUserId) return null;
    const currentUser = this.getUserById(currentUserId);
    const targetUser = this.getUserById(targetUserId);
    if (!currentUser || !targetUser) return null;

    if (!currentUser.followingUserIds) currentUser.followingUserIds = [];
    const isFollowing = currentUser.followingUserIds.includes(targetUserId);

    if (isFollowing) {
      currentUser.followingUserIds = currentUser.followingUserIds.filter((id) => id !== targetUserId);
      currentUser.followingCount = Math.max(0, (currentUser.followingCount || 1) - 1);
      targetUser.followersCount = Math.max(0, (targetUser.followersCount || 1) - 1);
    } else {
      currentUser.followingUserIds.push(targetUserId);
      currentUser.followingCount = (currentUser.followingCount || 0) + 1;
      targetUser.followersCount = (targetUser.followersCount || 0) + 1;
    }

    this.scheduleSave();
    return {
      isFollowing: !isFollowing,
      targetFollowersCount: targetUser.followersCount,
      currentFollowingCount: currentUser.followingCount,
    };
  }

  // --- Posts Operations ---
  public getPosts(): DBPost[] {
    return this.data.posts;
  }

  public getPostById(id: string): DBPost | undefined {
    return this.data.posts.find((p) => p.id === id);
  }

  public createPost(post: Omit<DBPost, 'id' | 'createdAt' | 'likesCount' | 'likedByUserIds' | 'commentsCount' | 'comments' | 'sharesCount' | 'savedByUserIds'> & { id?: string }): DBPost {
    const author = this.getUserById(post.authorId);
    const newPost: DBPost = {
      id: post.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      authorId: post.authorId,
      authorName: author?.name || post.authorName,
      authorHandle: author?.handle || post.authorHandle,
      authorAvatar: author?.avatarUrl || post.authorAvatar,
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      tags: post.tags || [],
      location: post.location,
      likesCount: 0,
      likedByUserIds: [],
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      savedByUserIds: [],
      createdAt: Date.now(),
    };

    this.data.posts.unshift(newPost);
    this.scheduleSave();
    return newPost;
  }

  public deletePost(id: string): boolean {
    const initialLen = this.data.posts.length;
    this.data.posts = this.data.posts.filter((p) => p.id !== id);
    if (this.data.posts.length !== initialLen) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  public toggleLikePost(postId: string, userId: string): { likesCount: number; likedByUserIds: string[] } | null {
    const post = this.getPostById(postId);
    if (!post) return null;

    const liked = post.likedByUserIds.includes(userId);
    if (liked) {
      post.likedByUserIds = post.likedByUserIds.filter((id) => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedByUserIds.push(userId);
      post.likesCount += 1;
    }

    this.scheduleSave();
    return { likesCount: post.likesCount, likedByUserIds: post.likedByUserIds };
  }

  public addComment(postId: string, authorId: string, content: string): DBComment | null {
    const post = this.getPostById(postId);
    const author = this.getUserById(authorId);
    if (!post || !author) return null;

    const comment: DBComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      postId,
      authorId,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      content,
      createdAt: Date.now(),
      likesCount: 0,
      likedByUserIds: [],
    };

    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    post.commentsCount = post.comments.length;

    this.scheduleSave();
    return comment;
  }

  public toggleBookmarkPost(postId: string, userId: string): { savedByUserIds: string[] } | null {
    const post = this.getPostById(postId);
    if (!post) return null;

    if (!post.savedByUserIds) post.savedByUserIds = [];
    const isSaved = post.savedByUserIds.includes(userId);
    if (isSaved) {
      post.savedByUserIds = post.savedByUserIds.filter((id) => id !== userId);
    } else {
      post.savedByUserIds.push(userId);
    }

    this.scheduleSave();
    return { savedByUserIds: post.savedByUserIds };
  }

  // --- Stories Operations ---
  public getStories(): DBStory[] {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const active = this.data.stories.filter(
      (s) => s.createdAt > cutoff || (s.slides && s.slides.some((sl) => sl.createdAt > cutoff))
    );

    // Aggregate/Group stories by userId so that any user with multiple photos/slides gets grouped into 1 user story with segmented progress bars
    const userStoryMap = new Map<string, DBStory>();

    for (const story of active) {
      const existing = userStoryMap.get(story.userId);
      
      // Ensure this raw story entry's slides array is well-formed
      let currentStorySlides: DBStorySlide[] = [];
      if (story.slides && story.slides.length > 0) {
        // If it already has slides, use them directly (this might be a previously aggregated result or a newly added slide bundle)
        currentStorySlides = [...story.slides];
      } else if (story.mediaUrl) {
        // If it's an old individual story entry, create a single slide for it
        currentStorySlides = [
          {
            id: `slide_${story.id}`,
            mediaUrl: story.mediaUrl,
            caption: story.caption,
            createdAt: story.createdAt,
          },
        ];
      }

      if (!existing) {
        // First entry for this user, create the core bundle
        userStoryMap.set(story.userId, {
          ...story,
          slides: currentStorySlides,
        });
      } else {
        // Merge this entry='s slides into the existing user story bundle
        if (!existing.slides) existing.slides = []; // Safety check
        
        const existingSlideIds = new Set(existing.slides.map((s) => s.id));
        const existingSlideUrls = new Set(existing.slides.map((s) => s.mediaUrl));

        for (const slide of currentStorySlides) {
          // Check BOTH ID and URL to prevent duplicates from overlapping raw data structures
          if (!existingSlideIds.has(slide.id) && !existingSlideUrls.has(slide.mediaUrl)) {
            existingSlideIds.add(slide.id);
            existingSlideUrls.add(slide.mediaUrl);
            existing.slides.push(slide);
          }
        }

        // Sort slides chronologically
        existing.slides.sort((a, b) => a.createdAt - b.createdAt);

        // Update latest mediaUrl/caption/createdAt so the reel thumbnail/info shows the new story
        if (story.createdAt >= existing.createdAt) {
          existing.mediaUrl = story.mediaUrl;
          existing.caption = story.caption;
          existing.createdAt = story.createdAt;
        }

        // Merge seen users efficiently
        if (story.seenByUserIds && story.seenByUserIds.length > 0) {
          if (!existing.seenByUserIds) existing.seenByUserIds = [];
          const combinedSeen = Array.from(new Set([...existing.seenByUserIds, ...story.seenByUserIds]));
          existing.seenByUserIds = combinedSeen;
        }
      }
    }

    const consolidatedStories = Array.from(userStoryMap.values());
    
    // CRITICAL: We DO NOT overwrite the raw this.data.stories here. 
    // getStories() should be non-destructive to the raw data structure.
    // Overwriting it with aggregated results can drop slides when individual 
    // entries that *contain* the slides fall off the 24h cutoff, 
    // depending on which object is processed first.
    // The consolidation will happen naturally every time getStories() is called.

    // this.data.stories = consolidatedStories; // DELETED: We do not overwrite raw data.
    // this.scheduleSave(); // DELETED: We do not save an aggregated view as raw data.

    return consolidatedStories;
  }

  public createStory(userId: string, mediaUrl: string, caption?: string): DBStory | null {
    const author = this.getUserById(userId);
    if (!author) return null;

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const now = Date.now();
    const newSlideId = `slide_${now}_${Math.random().toString(36).substr(2, 4)}`;
    const newSlide: DBStorySlide = {
      id: newSlideId,
      mediaUrl,
      caption,
      createdAt: now,
    };

    // Check if user already has an active story within 24h
    const existingStoryIndex = this.data.stories.findIndex(
      (s) => s.userId === userId && (s.createdAt > cutoff || (s.slides && s.slides.some((sl) => sl.createdAt > cutoff)))
    );

    if (existingStoryIndex !== -1) {
      const existingStory = this.data.stories[existingStoryIndex];
      if (!existingStory.slides || existingStory.slides.length === 0) {
        existingStory.slides = [
          {
            id: `slide_${existingStory.id}`,
            mediaUrl: existingStory.mediaUrl,
            caption: existingStory.caption,
            createdAt: existingStory.createdAt,
          },
        ];
      }
      // Append the new slide (photo/caption) to the existing story bundle
      existingStory.slides.push(newSlide);
      existingStory.mediaUrl = mediaUrl;
      existingStory.caption = caption;
      existingStory.createdAt = now;
      // Reset seenBy except the author so friends see the new slide indicator
      existingStory.seenByUserIds = [userId];

      this.scheduleSave();
      return existingStory;
    } else {
      const newStory: DBStory = {
        id: `story_${now}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        userName: author.name,
        userAvatar: author.avatarUrl,
        mediaUrl,
        caption,
        createdAt: now,
        seenByUserIds: [userId],
        slides: [newSlide],
      };

      this.data.stories.unshift(newStory);
      this.scheduleSave();
      return newStory;
    }
  }

  public deleteStorySlide(storyId: string, slideId: string, userId: string): DBStory | null {
    const story = this.data.stories.find((s) => s.id === storyId && s.userId === userId);
    if (!story) return null;

    if (story.slides && story.slides.length > 1) {
      story.slides = story.slides.filter((sl) => sl.id !== slideId);
      const lastSlide = story.slides[story.slides.length - 1];
      story.mediaUrl = lastSlide.mediaUrl;
      story.caption = lastSlide.caption;
      this.scheduleSave();
      return story;
    } else {
      // If only 1 slide was left, remove the entire story
      this.data.stories = this.data.stories.filter((s) => s.id !== storyId);
      this.scheduleSave();
      return null;
    }
  }

  public deleteStory(storyId: string, userId: string): boolean {
    const initialLen = this.data.stories.length;
    this.data.stories = this.data.stories.filter((s) => !(s.id === storyId && s.userId === userId));
    if (this.data.stories.length !== initialLen) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  public markStorySeen(storyId: string, userId: string): boolean {
    const story = this.data.stories.find((s) => s.id === storyId);
    if (!story) return false;

    if (!story.seenByUserIds.includes(userId)) {
      story.seenByUserIds.push(userId);
      this.scheduleSave();
    }
    return true;
  }

  // --- Conversations & Messages ---
  public getConversations(userId?: string): DBConversation[] {
    if (!userId) return this.data.conversations;
    return this.data.conversations.filter((c) => Array.isArray(c.participantIds) && (Array.isArray(c.participantIds) && (Array.isArray(c.participantIds) && (Array.isArray(c?.participantIds) && c.participantIds.includes(userId)))));
  }

  public getConversationById(id: string): DBConversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  public createConversation(creatorId: string, participantIds: string[], isGroup: boolean = false, name?: string): DBConversation {
    const allIds = Array.from(new Set([creatorId, ...participantIds]));
    
    // Check if direct conversation already exists
    if (!isGroup && allIds.length === 2) {
      const existing = this.data.conversations.find(
        (c) => !c.isGroup && c.participantIds.length === 2 && c.participantIds.includes(allIds[0]) && c.participantIds.includes(allIds[1])
      );
      if (existing) return existing;
    }

    const participants = allIds.map((id) => this.getUserById(id)).filter(Boolean) as DBUser[];
    const conv: DBConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isGroup,
      name: isGroup ? (name || 'Group Conversation') : undefined,
      avatar: isGroup ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80' : undefined,
      participantIds: allIds,
      participants,
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.data.conversations.unshift(conv);
    if (!this.data.messages[conv.id]) {
      this.data.messages[conv.id] = [];
    }

    this.scheduleSave();
    return conv;
  }

  public getMessages(conversationId: string): DBMessage[] {
    return this.data.messages[conversationId] || [];
  }

  public sendMessage(msg: Omit<DBMessage, 'id' | 'timestamp' | 'isRead'> & { id?: string }): DBMessage {
    const sender = this.getUserById(msg.senderId);
    const newMsg: DBMessage = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: sender?.name || msg.senderName,
      senderAvatar: sender?.avatarUrl || msg.senderAvatar,
      content: msg.content,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType || 'none',
      audioDuration: msg.audioDuration,
      replyTo: msg.replyTo,
      storyReply: msg.storyReply,
      callLog: msg.callLog,
      reactions: {},
      timestamp: Date.now(),
      isRead: false,
      isDelivered: true,
    };

    if (!this.data.messages[msg.conversationId]) {
      this.data.messages[msg.conversationId] = [];
    }
    this.data.messages[msg.conversationId].push(newMsg);

    // Update conversation last message
    const conv = this.getConversationById(msg.conversationId);
    if (conv) {
      conv.lastMessage = newMsg;
      conv.updatedAt = Date.now();
      // Re-sort conversations
      this.data.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    this.scheduleSave();
    return newMsg;
  }

  public addMessageReaction(conversationId: string, messageId: string, emoji: string, userId: string): Record<string, string[]> | null {
    const list = this.data.messages[conversationId];
    if (!list) return null;

    const msg = list.find((m) => m.id === messageId);
    if (!msg) return null;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const index = msg.reactions[emoji].indexOf(userId);
    if (index > -1) {
      msg.reactions[emoji].splice(index, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(userId);
    }

    this.scheduleSave();
    return msg.reactions;
  }

  // --- Calls & WebRTC Signaling Operations ---
  private activeCalls: Map<string, DBCallSession> = new Map();
  private callSignals: DBCallSignal[] = [];

  public createOrUpdateCallSession(sessionData: Partial<DBCallSession> & { callerId: string; receiverId: string; roomId: string }): DBCallSession {
    const caller = this.getUserById(sessionData.callerId);
    const receiver = this.getUserById(sessionData.receiverId);

    const existing = this.activeCalls.get(sessionData.roomId);
    const session: DBCallSession = {
      id: existing?.id || sessionData.id || `call_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      callerId: sessionData.callerId,
      callerName: caller?.name || sessionData.callerName || 'Caller',
      callerAvatar: caller?.avatarUrl || sessionData.callerAvatar || '',
      receiverId: sessionData.receiverId,
      receiverName: receiver?.name || sessionData.receiverName || 'Receiver',
      receiverAvatar: receiver?.avatarUrl || sessionData.receiverAvatar || '',
      isVideo: sessionData.isVideo !== undefined ? sessionData.isVideo : true,
      status: sessionData.status || existing?.status || 'calling',
      roomId: sessionData.roomId,
      startedAt: sessionData.startedAt || existing?.startedAt,
      endedAt: sessionData.endedAt || existing?.endedAt,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    this.activeCalls.set(sessionData.roomId, session);
    return session;
  }

  public getCallSessionByRoomId(roomId: string): DBCallSession | undefined {
    return this.activeCalls.get(roomId);
  }

  public getPendingCallsForUser(userId: string): DBCallSession[] {
    const now = Date.now();
    const result: DBCallSession[] = [];
    for (const [roomId, session] of this.activeCalls.entries()) {
      // Pending ringing call created in last 45 seconds
      if (session.receiverId === userId && session.status === 'calling' && now - session.createdAt < 45000) {
        result.push(session);
      }
    }
    return result;
  }

  public updateCallStatus(roomId: string, status: 'calling' | 'connected' | 'ended' | 'declined'): DBCallSession | null {
    const session = this.activeCalls.get(roomId);
    if (!session) return null;

    session.status = status;
    session.updatedAt = Date.now();
    if (status === 'connected' && !session.startedAt) {
      session.startedAt = Date.now();
    }
    if (status === 'ended' || status === 'declined') {
      session.endedAt = Date.now();
    }

    this.activeCalls.set(roomId, session);
    return session;
  }

  public addCallSignal(roomId: string, senderId: string, type: 'offer' | 'answer' | 'candidate', data: any): DBCallSignal {
    const signal: DBCallSignal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      roomId,
      senderId,
      type,
      data,
      timestamp: Date.now(),
    };

    this.callSignals.push(signal);
    // Keep max 200 signals in memory
    if (this.callSignals.length > 200) {
      this.callSignals.splice(0, this.callSignals.length - 200);
    }
    return signal;
  }

  public getCallSignals(roomId: string, excludeSenderId?: string, sinceTimestamp: number = 0): DBCallSignal[] {
    return this.callSignals.filter(
      (s) => s.roomId === roomId && (!excludeSenderId || s.senderId !== excludeSenderId) && s.timestamp > sinceTimestamp
    );
  }

  // ── LMS: Courses ────────────────────────────────────────────────────────

  public createCourse(data: Omit<DBCourse, 'id' | 'lessonIds' | 'createdAt'>): DBCourse {
    const course: DBCourse = {
      id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...data,
      lessonIds: [],
      createdAt: Date.now(),
    };
    this.courses.set(course.id, course);
    return course;
  }

  public getCourseById(id: string): DBCourse | undefined {
    return this.courses.get(id);
  }

  public getAllCourses(): DBCourse[] {
    return Array.from(this.courses.values());
  }

  public getCoursesByTrack(track: string): DBCourse[] {
    return Array.from(this.courses.values()).filter((c) => c.track === track);
  }

  // ── LMS: Lessons ────────────────────────────────────────────────────────

  public createLesson(data: Omit<DBLesson, 'id' | 'createdAt'>): DBLesson {
    const lesson: DBLesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...data,
      createdAt: Date.now(),
    };
    this.lessons.set(lesson.id, lesson);

    // Register lesson id on its parent course
    const course = this.courses.get(lesson.courseId);
    if (course && !course.lessonIds.includes(lesson.id)) {
      course.lessonIds.push(lesson.id);
      // Keep lessons sorted by order
      course.lessonIds.sort((a, b) => {
        const la = this.lessons.get(a)?.order ?? 0;
        const lb = this.lessons.get(b)?.order ?? 0;
        return la - lb;
      });
    }
    return lesson;
  }

  public getLessonById(id: string): DBLesson | undefined {
    return this.lessons.get(id);
  }

  public getLessonsByCourse(courseId: string): DBLesson[] {
    return Array.from(this.lessons.values())
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  // ── LMS: UserProgress ───────────────────────────────────────────────────

  private progressKey(userId: string, courseId: string): string {
    return `${userId}::${courseId}`;
  }

  public getOrCreateProgress(userId: string, courseId: string): DBUserProgress {
    const key = this.progressKey(userId, courseId);
    const existing = this.userProgress.get(key);
    if (existing) return existing;

    const course = this.courses.get(courseId);
    const firstLessonId = course?.lessonIds[0] ?? null;
    const progress: DBUserProgress = {
      id: `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      courseId,
      completedLessonIds: [],
      currentLessonId: firstLessonId,
      notes: '',
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    this.userProgress.set(key, progress);
    return progress;
  }

  public getProgressForUser(userId: string): DBUserProgress[] {
    return Array.from(this.userProgress.values()).filter((p) => p.userId === userId);
  }

  public completeLesson(userId: string, courseId: string, lessonId: string): DBUserProgress | null {
    const key = this.progressKey(userId, courseId);
    const progress = this.userProgress.get(key);
    if (!progress) return null;

    if (!progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds.push(lessonId);
    }

    // Advance currentLessonId to the next uncompleted lesson
    const course = this.courses.get(courseId);
    if (course) {
      const next = course.lessonIds.find((id) => !progress.completedLessonIds.includes(id));
      progress.currentLessonId = next ?? null;
    }

    progress.lastActivityAt = Date.now();
    return progress;
  }

  public updateNotes(userId: string, courseId: string, notes: string): DBUserProgress | null {
    const key = this.progressKey(userId, courseId);
    const progress = this.userProgress.get(key);
    if (!progress) return null;
    progress.notes = notes;
    progress.lastActivityAt = Date.now();
    return progress;
  }

  // ── LMS: VerseCommentaryCache ────────────────────────────────────────────

  /** Normalise a scripture ref to a stable cache key, e.g. "John 3:16" → "john_3_16" */
  public static cacheKey(scriptureRef: string): string {
    return scriptureRef.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  public getCachedCommentary(scriptureRef: string): DBVerseCommentaryCache | undefined {
    return this.verseCache.get(JSONDatabase.cacheKey(scriptureRef));
  }

  public setCachedCommentary(
    scriptureRef: string,
    commentary: DBVerseCommentaryCache['commentary']
  ): DBVerseCommentaryCache {
    const entry: DBVerseCommentaryCache = {
      id: JSONDatabase.cacheKey(scriptureRef),
      scriptureRef,
      commentary,
      cachedAt: Date.now(),
    };
    this.verseCache.set(entry.id, entry);
    return entry;
  }

  public getAllCachedCommentaries(): DBVerseCommentaryCache[] {
    return Array.from(this.verseCache.values());
  }

  // ── System Operations ────────────────────────────────────────────────────
  public getSystemStats() {
    return {
      usersCount: this.data.users.length,
      postsCount: this.data.posts.length,
      storiesCount: this.data.stories.length,
      conversationsCount: this.data.conversations.length,
      messagesCount: Object.values(this.data.messages).reduce((acc, list) => acc + list.length, 0),
      dbPath: this.dbPath,
      uptimeSeconds: process.uptime(),
      version: this.data.system.version,
    };
  }

  public exportFullDatabase(): DatabaseSchema {
    return this.data;
  }
}

export const db = new JSONDatabase();
