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
    id: 'user_alex',
    name: 'Alex Rivera',
    handle: 'alexrivera',
    email: 'alex.rivera@aura.social',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Product Designer & Visual Creator ✦ Exploring generative art & cyber-minimalism ✨',
    status: 'online',
    statusMessage: 'Designing the future 🎨',
    followersCount: 1420,
    followingCount: 380,
    isVerified: true,
    joinedAt: '2024-01-15',
  },
  {
    id: 'user_maya',
    name: 'Maya Chen',
    handle: 'mayachen',
    email: 'maya.chen@aura.social',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Creative Technologist 💻 Building WebRTC spatial audio & interactive installations 🌊',
    status: 'online',
    statusMessage: 'Deep in code 🎧',
    followersCount: 2890,
    followingCount: 512,
    isVerified: true,
    joinedAt: '2023-11-20',
  },
  {
    id: 'user_liam',
    name: 'Liam Vance',
    handle: 'liamvance',
    email: 'liam.vance@aura.social',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    bio: 'Landscape & Night Sky Photographer 🌌 Tokyo / SF / Reyjavik ✈️',
    status: 'busy',
    statusMessage: 'Shooting Aurora Borealis',
    followersCount: 5410,
    followingCount: 620,
    isVerified: true,
    joinedAt: '2024-02-01',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: 'elenarostova',
    email: 'elena.rostova@aura.social',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    bio: 'Sound Designer & AI Musician 🎹 Synthesizing atmospheric soundscapes 🪐',
    status: 'away',
    statusMessage: 'In the recording studio',
    followersCount: 3150,
    followingCount: 410,
    isVerified: false,
    joinedAt: '2024-03-10',
  },
];

const SEED_POSTS: DBPost[] = [
  {
    id: 'post_1',
    authorId: 'user_liam',
    authorName: 'Liam Vance',
    authorHandle: 'liamvance',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    content: 'Caught the breathtaking northern lights dancing over the glaciers last night in Iceland. Nature never ceases to amaze me! 🌌❄️✨',
    mediaUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1000&auto=format&fit=crop&q=80',
    ],
    tags: ['photography', 'aurora', 'travel', 'nightsky'],
    location: 'Vatnajökull, Iceland',
    likesCount: 342,
    likedByUserIds: ['user_alex', 'user_maya'],
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        authorId: 'user_alex',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        content: 'These colors are pure magic Liam! What shutter speed were you using?',
        createdAt: Date.now() - 1000 * 60 * 30,
        likesCount: 12,
        likedByUserIds: ['user_liam'],
      },
      {
        id: 'c2',
        postId: 'post_1',
        authorId: 'user_maya',
        authorName: 'Maya Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        content: 'Looks ethereal! Adding this location to my travel bucket list immediately.',
        createdAt: Date.now() - 1000 * 60 * 15,
        likesCount: 8,
        likedByUserIds: [],
      },
    ],
    sharesCount: 45,
    savedByUserIds: ['user_alex'],
    createdAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'post_2',
    authorId: 'user_maya',
    authorName: 'Maya Chen',
    authorHandle: 'mayachen',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    content: 'Just launched our real-time WebRTC audio visualizer! Crystal-clear latency under 45ms and 3D spatial panning 🚀 Check out the studio demo preview!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    ],
    tags: ['webrtc', 'audio', 'tech', 'coding'],
    location: 'San Francisco, CA',
    likesCount: 519,
    likedByUserIds: ['user_alex', 'user_liam', 'user_elena'],
    commentsCount: 1,
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        content: 'The spatial audio fidelity is stunning. Amazing work Maya!',
        createdAt: Date.now() - 1000 * 60 * 120,
        likesCount: 14,
        likedByUserIds: ['user_maya'],
      },
    ],
    sharesCount: 88,
    savedByUserIds: ['user_maya'],
    createdAt: Date.now() - 1000 * 60 * 180,
  },
];

const SEED_STORIES: DBStory[] = [
  {
    id: 'story_1',
    userId: 'user_maya',
    userName: 'Maya Chen',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset stroll along the coast after a long sprint 🌅',
    createdAt: Date.now() - 1000 * 60 * 90,
    seenByUserIds: ['user_alex'],
    slides: [
      {
        id: 'maya_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        caption: 'Sunset stroll along the coast after a long sprint 🌅',
        createdAt: Date.now() - 1000 * 60 * 90,
      },
      {
        id: 'maya_slide_2',
        mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        caption: 'Deep focus coding setup with ambient backlight 💻⚡️',
        createdAt: Date.now() - 1000 * 60 * 60,
      },
      {
        id: 'maya_slide_3',
        mediaUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
        caption: 'Night skyline reflections across the bay bridge 🌉✨',
        createdAt: Date.now() - 1000 * 60 * 30,
      },
    ],
  },
  {
    id: 'story_2',
    userId: 'user_liam',
    userName: 'Liam Vance',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    caption: 'Setting up tripods before the alpine storm hits 🏔️❄️',
    createdAt: Date.now() - 1000 * 60 * 180,
    seenByUserIds: [],
    slides: [
      {
        id: 'liam_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        caption: 'Setting up tripods before the alpine storm hits 🏔️❄️',
        createdAt: Date.now() - 1000 * 60 * 180,
      },
      {
        id: 'liam_slide_2',
        mediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        caption: 'Milky Way rising above the granite canyon 🌌✨',
        createdAt: Date.now() - 1000 * 60 * 120,
      },
      {
        id: 'liam_slide_3',
        mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: 'Golden hour mist breaking through the pines 🌲☀️',
        createdAt: Date.now() - 1000 * 60 * 45,
      },
    ],
  },
  {
    id: 'story_3',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    caption: 'Live performance rehearsals under laser lighting! ⚡️',
    createdAt: Date.now() - 1000 * 60 * 240,
    seenByUserIds: [],
    slides: [
      {
        id: 'elena_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        caption: 'Live performance rehearsals under laser lighting! ⚡️',
        createdAt: Date.now() - 1000 * 60 * 240,
      },
      {
        id: 'elena_slide_2',
        mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
        caption: 'Analog synthesizer patches & modular oscillator racks 🎹🎛️',
        createdAt: Date.now() - 1000 * 60 * 150,
      },
      {
        id: 'elena_slide_3',
        mediaUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80',
        caption: 'Soundcheck complete! Doors opening in 30 mins 🎤🔥',
        createdAt: Date.now() - 1000 * 60 * 50,
      },
    ],
  },
];

const SEED_CONVERSATIONS: DBConversation[] = [
  {
    id: 'conv_alex_maya',
    isGroup: false,
    participantIds: ['user_alex', 'user_maya'],
    participants: [SEED_USERS[0], SEED_USERS[1]],
    unreadCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 10,
    lastMessage: {
      id: 'm_last',
      conversationId: 'conv_alex_maya',
      senderId: 'user_maya',
      senderName: 'Maya Chen',
      senderAvatar: SEED_USERS[1].avatarUrl,
      content: 'Let’s jump on a quick WebRTC call to review the audio setup!',
      timestamp: Date.now() - 1000 * 60 * 10,
      isRead: true,
    },
  },
  {
    id: 'conv_alex_liam',
    isGroup: false,
    participantIds: ['user_alex', 'user_liam'],
    participants: [SEED_USERS[0], SEED_USERS[2]],
    unreadCount: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 40,
    lastMessage: {
      id: 'm_last_2',
      conversationId: 'conv_alex_liam',
      senderId: 'user_liam',
      senderName: 'Liam Vance',
      senderAvatar: SEED_USERS[2].avatarUrl,
      content: 'Just uploaded raw TIFF files from the glacier!',
      timestamp: Date.now() - 1000 * 60 * 40,
      isRead: false,
    },
  },
];

const SEED_MESSAGES: Record<string, DBMessage[]> = {
  conv_alex_maya: [
    {
      id: 'm1',
      conversationId: 'conv_alex_maya',
      senderId: 'user_alex',
      senderName: 'Alex Rivera',
      senderAvatar: SEED_USERS[0].avatarUrl,
      content: 'Hey Maya! The new frosted glass interface looks spectacular.',
      timestamp: Date.now() - 1000 * 60 * 35,
      isRead: true,
    },
    {
      id: 'm2',
      conversationId: 'conv_alex_maya',
      senderId: 'user_maya',
      senderName: 'Maya Chen',
      senderAvatar: SEED_USERS[1].avatarUrl,
      content: 'Thanks Alex! The backdrop blur and WebRTC audio stream are syncing flawlessly.',
      timestamp: Date.now() - 1000 * 60 * 25,
      isRead: true,
    },
    {
      id: 'm3',
      conversationId: 'conv_alex_maya',
      senderId: 'user_maya',
      senderName: 'Maya Chen',
      senderAvatar: SEED_USERS[1].avatarUrl,
      content: 'Let’s jump on a quick WebRTC call to review the audio setup!',
      timestamp: Date.now() - 1000 * 60 * 10,
      isRead: true,
    },
  ],
  conv_alex_liam: [
    {
      id: 'm4',
      conversationId: 'conv_alex_liam',
      senderId: 'user_liam',
      senderName: 'Liam Vance',
      senderAvatar: SEED_USERS[2].avatarUrl,
      content: 'Just uploaded raw TIFF files from the glacier!',
      timestamp: Date.now() - 1000 * 60 * 40,
      isRead: false,
    },
  ],
};

class JSONDatabase {
  private dbPath: string;
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

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
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.posts)) {
          return parsed;
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
      conv.participants = conv.participants.map((p) => (p.id === id ? updated : p));
    });

    this.scheduleSave();
    return updated;
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
    return this.data.stories.filter((s) => s.createdAt > cutoff);
  }

  public createStory(userId: string, mediaUrl: string, caption?: string): DBStory | null {
    const author = this.getUserById(userId);
    if (!author) return null;

    const slideId = `slide_${Date.now()}`;
    const story: DBStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName: author.name,
      userAvatar: author.avatarUrl,
      mediaUrl,
      caption,
      createdAt: Date.now(),
      seenByUserIds: [userId],
      slides: [
        {
          id: slideId,
          mediaUrl,
          caption,
          createdAt: Date.now(),
        },
      ],
    };

    this.data.stories.unshift(story);
    this.scheduleSave();
    return story;
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
    return this.data.conversations.filter((c) => c.participantIds.includes(userId));
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

  // --- System Operations ---
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
