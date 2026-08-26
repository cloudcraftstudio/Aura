import { UserProfile, SocialPost, UserStory, Conversation } from '../types';

export const DEMO_USERS: UserProfile[] = [
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
  }
];

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    authorId: 'user_liam',
    authorName: 'Liam Vance',
    authorHandle: 'liamvance',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    content: 'Caught the breathtaking northern lights dancing over the glaciers last night in Iceland. Nature never ceases to amaze me! 🌌❄️✨',
    mediaUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1000&auto=format&fit=crop&q=80'
    ],
    tags: ['photography', 'aurora', 'travel', 'nightsky'],
    location: 'Vatnajökull, Iceland',
    likesCount: 342,
    likedByUserIds: ['user_alex', 'user_maya'],
    commentsCount: 18,
    sharesCount: 45,
    savedByUserIds: ['user_alex'],
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
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
        likedByUserIds: ['user_liam']
      },
      {
        id: 'c2',
        postId: 'post_1',
        authorId: 'user_maya',
        authorName: 'Maya Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        content: 'Insane shot!! Adding this spot to my bucket list immediately ✈️',
        createdAt: Date.now() - 1000 * 60 * 15,
        likesCount: 5,
        likedByUserIds: []
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_maya',
    authorName: 'Maya Chen',
    authorHandle: 'mayachen',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    content: 'Just deployed our new real-time WebRTC audio-visualizer pipeline! Low latency peer connections with crystal clarity. Glassmorphism styling makes it look so futuristic 💎⚡️',
    mediaUrls: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80'
    ],
    tags: ['tech', 'webrtc', 'coding', 'glassmorphism'],
    location: 'San Francisco, CA',
    likesCount: 189,
    likedByUserIds: ['user_alex', 'user_elena'],
    commentsCount: 9,
    sharesCount: 22,
    savedByUserIds: [],
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hrs ago
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        authorId: 'user_alex',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        content: 'The glassmorphic reflections look hyper clean. Loving the UI depth!',
        createdAt: Date.now() - 1000 * 60 * 90,
        likesCount: 8,
        likedByUserIds: ['user_maya']
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'user_elena',
    authorName: 'Elena Rostova',
    authorHandle: 'elenarostova',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    content: 'Studio vibes today. Experimenting with modular analog synthesizers and ambient reverbs. New track coming soon 🎧🎵',
    mediaUrls: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&auto=format&fit=crop&q=80'
    ],
    tags: ['music', 'synth', 'sounddesign', 'creative'],
    location: 'Berlin, Germany',
    likesCount: 245,
    likedByUserIds: ['user_alex', 'user_maya', 'user_liam'],
    commentsCount: 14,
    sharesCount: 18,
    savedByUserIds: ['user_alex'],
    createdAt: Date.now() - 1000 * 60 * 360, // 6 hrs ago
    comments: []
  }
];

export const INITIAL_STORIES: UserStory[] = [
  {
    id: 'story_1',
    userId: 'user_maya',
    userName: 'Maya Chen',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset stroll after a long sprint 🌅',
    createdAt: Date.now() - 1000 * 60 * 90,
    seenByUserIds: ['user_alex']
  },
  {
    id: 'story_2',
    userId: 'user_liam',
    userName: 'Liam Vance',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    caption: 'Setting up tripods before the storm hits ❄️',
    createdAt: Date.now() - 1000 * 60 * 180,
    seenByUserIds: []
  },
  {
    id: 'story_3',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    caption: 'Live performance rehearsals! ⚡️',
    createdAt: Date.now() - 1000 * 60 * 240,
    seenByUserIds: []
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_alex_maya',
    isGroup: false,
    participantIds: ['user_alex', 'user_maya'],
    participants: [DEMO_USERS[0], DEMO_USERS[1]],
    unreadCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 5,
    lastMessage: {
      id: 'msg_init_1',
      conversationId: 'conv_alex_maya',
      senderId: 'user_maya',
      senderName: 'Maya Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      content: 'Hey Alex! Are we testing the WebRTC video calling feature now? Let me know whenever you start a call! 📹✨',
      timestamp: Date.now() - 1000 * 60 * 5,
      isRead: true
    }
  },
  {
    id: 'conv_alex_liam',
    isGroup: false,
    participantIds: ['user_alex', 'user_liam'],
    participants: [DEMO_USERS[0], DEMO_USERS[2]],
    unreadCount: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 25,
    lastMessage: {
      id: 'msg_init_2',
      conversationId: 'conv_alex_liam',
      senderId: 'user_liam',
      senderName: 'Liam Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      content: 'I uploaded the raw 4K shots to the shared feed! Take a look when you get a chance.',
      timestamp: Date.now() - 1000 * 60 * 25,
      isRead: false
    }
  },
  {
    id: 'conv_design_circle',
    isGroup: true,
    name: 'Aura Creators Collective 🔮',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    participantIds: ['user_alex', 'user_maya', 'user_liam', 'user_elena'],
    participants: DEMO_USERS,
    unreadCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60,
    lastMessage: {
      id: 'msg_init_3',
      conversationId: 'conv_design_circle',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      content: 'Shared the audio stems for the interactive preview. Let’s do a group huddle later!',
      timestamp: Date.now() - 1000 * 60 * 60,
      isRead: true
    }
  }
];
