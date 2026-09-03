var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// services/youtubeFeedService.ts
var import_https = __toESM(require("https"), 1);
var MONITORED_CHANNELS = [
  {
    name: "Lighthouse Baptist Church",
    handle: "@lighthousewinc",
    channelId: "UC-rPauVwKrxsFn05cecsF-w",
    speaker: "Pastor Luke Shope",
    speakerTitle: "Lighthouse Baptist Church \u2022 Winchester, VA",
    featured: true,
    defaultCover: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Tyler Gaulden",
    handle: "@TylerGaulden",
    channelId: "UCunY7TdNYdO_8tgZqNpUYfA",
    speaker: "Tyler Gaulden",
    speakerTitle: "Evangelist & Speaker",
    defaultCover: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Steven Furtick",
    handle: "@stevenfurtick",
    channelId: "UCIQqvZbHSwX0yKNVK1MyYjQ",
    speaker: "Steven Furtick",
    speakerTitle: "Elevation Church",
    defaultCover: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Scott Pauley",
    handle: "@ETJ",
    channelId: "UCJ-nK4Wv807yYZrRGEufnig",
    speaker: "Scott Pauley",
    speakerTitle: "Enjoying The Journey",
    defaultCover: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Dr. Tony Evans",
    handle: "@drtonyevans",
    channelId: "UCCWRy-Q4ejmtHpmQJJYJd6A",
    speaker: "Dr. Tony Evans",
    speakerTitle: "The Urban Alternative",
    defaultCover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Fargo Baptist Church",
    handle: "@FargoBaptistChurch",
    channelId: "UC-GMRbrd4dY8iiid8czVxWw",
    speaker: "Fargo Baptist Church",
    speakerTitle: "Fargo, ND",
    defaultCover: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Our Daily Bread",
    handle: "@ourdailybread",
    channelId: "UCsOZjmfxUh94dQPzrgIRrLA",
    speaker: "Our Daily Bread",
    speakerTitle: "Ministries Worldwide",
    defaultCover: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Lilly Grove Missionary Baptist Church",
    handle: "@lillygrovembc",
    channelId: "UCwibXBbhAZNTqYeEyeHpwaw",
    speaker: "Lilly Grove Baptist",
    speakerTitle: "Houston, TX",
    defaultCover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Alfred Street Baptist Church",
    handle: "@AlfredStreetBaptistChurch",
    channelId: "UCKFkEcTQsLP7j6DFo-O4xrg",
    speaker: "Alfred Street Baptist",
    speakerTitle: "Alexandria, VA",
    defaultCover: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Reformers Unanimous",
    handle: "@RURecoveryProgram",
    channelId: "UCDmfM_p5-je826nxz8UX5_g",
    speaker: "RU Recovery Ministries",
    speakerTitle: "Faith-Based Addiction Recovery",
    defaultCover: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
  }
];
var cachedFeed = [];
var lastFetch = 0;
var TTL = 10 * 60 * 1e3;
function fetchXml(url) {
  return new Promise((resolve, reject) => {
    import_https.default.get(url, { headers: { "User-Agent": "Mozilla/5.0 AuraApp/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 400) return reject(new Error(String(res.statusCode)));
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => resolve(body));
    }).on("error", reject);
  });
}
function parseXml(xml, ch) {
  const list = [];
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  for (const entry of entries) {
    const vidMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const pubMatch = entry.match(/<published>(.*?)<\/published>/);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
    if (!vidMatch || !titleMatch) continue;
    const youtubeId = vidMatch[1].trim();
    const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    const publishedAt = pubMatch ? pubMatch[1].trim() : (/* @__PURE__ */ new Date()).toISOString();
    const summary = descMatch ? descMatch[1].slice(0, 200).trim() + "..." : "";
    list.push({
      id: `yt-${youtubeId}`,
      title,
      speaker: ch.speaker,
      speakerSlug: ch.handle.replace("@", "").toLowerCase(),
      speakerTitle: ch.speakerTitle,
      summary: summary || `Broadcast from ${ch.name}`,
      mediaType: "video",
      format: "video",
      source: "community",
      featured: !!ch.featured,
      youtubeId,
      mediaUrl: "",
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      publishedAt,
      topics: [{ name: "Sermon", slug: "sermon" }]
    });
  }
  return list;
}
async function getLiveMinistryFeed() {
  const now = Date.now();
  if (cachedFeed.length > 0 && now - lastFetch < TTL) {
    return cachedFeed;
  }
  const promises = MONITORED_CHANNELS.map(async (ch) => {
    try {
      const xml = await fetchXml(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`);
      return parseXml(xml, ch);
    } catch {
      return [];
    }
  });
  const results = await Promise.all(promises);
  const homeChurch = results[0] || [];
  const others = results.slice(1).flat();
  others.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const combined = [...homeChurch, ...others];
  if (combined.length > 0) {
    cachedFeed = combined;
    lastFetch = now;
  }
  return cachedFeed;
}

// server.ts
var import_web_push = __toESM(require("web-push"), 1);
var import_express3 = __toESM(require("express"), 1);
var import_path5 = __toESM(require("path"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var SEED_USERS = [
  {
    id: "user_tex",
    name: "Tex",
    handle: "tex",
    email: "lightsouttattootex@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=lightsouttattootex@gmail.com",
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    bio: "Lights Out Tattoo \u2726 Real-time Social & Calling \u2728",
    status: "online",
    statusMessage: "Online & Active",
    followersCount: 3,
    followingCount: 3,
    isVerified: true,
    joinedAt: "2026-08-01",
    authProvider: "google"
  },
  {
    id: "user_kimberly",
    name: "Kimberly Coffman",
    handle: "kimberly",
    email: "savdbygrace360@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=savdbygrace360@gmail.com",
    bannerUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
    bio: "Walking in Faith \u2728",
    status: "online",
    statusMessage: "Active",
    followersCount: 3,
    followingCount: 3,
    isVerified: true,
    joinedAt: "2026-08-01",
    authProvider: "email"
  },
  {
    id: "user_skylor",
    name: "Skylor Bright",
    handle: "skylor",
    email: "skylorbright07@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=skylorbright07@gmail.com",
    bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    bio: "Connected on Aura",
    status: "online",
    statusMessage: "Active",
    followersCount: 3,
    followingCount: 3,
    isVerified: true,
    joinedAt: "2026-08-01",
    authProvider: "email"
  },
  {
    id: "user_daphne",
    name: "Daphne Coffman",
    handle: "babyred",
    email: "tex@lightsouttattoo.site",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=tex@lightsouttattoo.site",
    bannerUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80",
    bio: "Exploring Scripture \u{1F4D6}",
    status: "online",
    statusMessage: "Active",
    followersCount: 3,
    followingCount: 3,
    isVerified: true,
    joinedAt: "2026-08-01",
    authProvider: "email"
  }
];
var SEED_POSTS = [];
var SEED_STORIES = [];
var SEED_CONVERSATIONS = [];
var SEED_MESSAGES = {};
var JSONDatabase = class _JSONDatabase {
  constructor() {
    this.saveTimeout = null;
    // In-memory LMS stores (lightweight, no need to persist to main db.json)
    this.courses = /* @__PURE__ */ new Map();
    this.lessons = /* @__PURE__ */ new Map();
    this.userProgress = /* @__PURE__ */ new Map();
    // key: userId_courseId
    this.verseCache = /* @__PURE__ */ new Map();
    // --- Calls & WebRTC Signaling Operations ---
    this.activeCalls = /* @__PURE__ */ new Map();
    this.callSignals = [];
    const dataDir = import_path.default.join(process.cwd(), "data");
    if (!import_fs.default.existsSync(dataDir)) {
      try {
        import_fs.default.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error("Failed to create data directory:", err);
      }
    }
    this.dbPath = import_path.default.join(dataDir, "db.json");
    this.data = this.loadData();
  }
  loadData() {
    const dummyIds = /* @__PURE__ */ new Set(["user_alex", "user_maya", "user_liam", "user_elena"]);
    const dummyHandles = /* @__PURE__ */ new Set(["alexrivera", "mayachen", "liamvance", "elenarostova"]);
    const dummyEmailDomains = ["@aura.social"];
    const dummyEmails = /* @__PURE__ */ new Set(["alex.rivera@gmail.com", "pistolpete@cmail.com"]);
    const isDummyUser = (u) => {
      if (!u) return true;
      if (dummyIds.has(u.id)) return true;
      if (dummyHandles.has(u.handle)) return true;
      if (u.email && (dummyEmails.has(u.email.toLowerCase()) || dummyEmailDomains.some((d) => u.email.toLowerCase().endsWith(d)))) return true;
      return false;
    };
    try {
      if (import_fs.default.existsSync(this.dbPath)) {
        const raw = import_fs.default.readFileSync(this.dbPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          const cleanUsers = parsed.users.filter((u) => !isDummyUser(u));
          SEED_USERS.forEach((seedUser) => {
            const idx = cleanUsers.findIndex((u) => u.id === seedUser.id || u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (idx === -1) {
              cleanUsers.push({ ...seedUser, status: "online" });
            } else {
              cleanUsers[idx].status = "online";
            }
          });
          const cleanPosts = (parsed.posts || []).filter((p) => !dummyIds.has(p.authorId) && !["post_1", "post_2", "post_3"].includes(p.id));
          const cleanStories = (parsed.stories || []).filter((s) => !dummyIds.has(s.userId) && !["story_1", "story_2", "story_3"].includes(s.id));
          const cleanConversations = (parsed.conversations || []).filter((c) => {
            if (["conv_alex_maya", "conv_alex_liam", "conv_design_circle"].includes(c.id)) return false;
            if (Array.isArray(c.participantIds) && c.participantIds.some((pid) => dummyIds.has(pid))) return false;
            return true;
          });
          const cleanMessages = {};
          if (parsed.messages && typeof parsed.messages === "object") {
            for (const [convId, msgs] of Object.entries(parsed.messages)) {
              if (["conv_alex_maya", "conv_alex_liam", "conv_design_circle"].includes(convId)) continue;
              if (Array.isArray(msgs)) {
                cleanMessages[convId] = msgs.filter((m) => !dummyIds.has(m.senderId));
              }
            }
          }
          const sanitized = {
            users: cleanUsers,
            posts: cleanPosts,
            stories: cleanStories,
            conversations: cleanConversations,
            messages: cleanMessages,
            system: parsed.system || {
              version: "2.0.0",
              lastBackup: Date.now(),
              createdAt: Date.now()
            }
          };
          this.saveDataDirect(sanitized);
          return sanitized;
        }
      }
    } catch (e) {
      console.warn("Error reading database file, initializing with seed data:", e);
    }
    const initial = {
      users: SEED_USERS,
      posts: SEED_POSTS,
      stories: SEED_STORIES,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      system: {
        version: "2.0.0",
        lastBackup: Date.now(),
        createdAt: Date.now()
      }
    };
    if (import_fs.default.existsSync(this.dbPath) && import_fs.default.statSync(this.dbPath).size > 100) {
      console.error("FATAL: Refusing to overwrite existing database with blank seed data.");
      return this.data || initial;
    }
    this.saveDataDirect(initial);
    return initial;
  }
  saveDataDirect(dataToSave) {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      import_fs.default.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), "utf-8");
      import_fs.default.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error("Failed to write database file:", err);
    }
  }
  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataDirect(this.data);
    }, 100);
  }
  // --- Users Operations ---
  getUsers() {
    return this.data.users;
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  getUserByHandle(handle) {
    const clean = handle.replace("@", "").toLowerCase();
    return this.data.users.find((u) => u.handle.toLowerCase() === clean);
  }
  createUser(user) {
    const existing = this.getUserByEmail(user.email);
    if (existing) {
      return existing;
    }
    const cleanHandle = (user.handle || user.name.toLowerCase().replace(/\s+/g, "")).replace("@", "");
    const newUser = {
      id: user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: user.name,
      email: user.email,
      handle: cleanHandle,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
      bannerUrl: user.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      bio: user.bio || "Explorer on Aura \u2728 Connected to real-time WebRTC social network.",
      status: user.status || "online",
      statusMessage: user.statusMessage || "Active on Aura",
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 4,
      isVerified: user.isVerified ?? false,
      joinedAt: user.joinedAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      googleId: user.googleId,
      passwordHash: user.passwordHash,
      authProvider: user.authProvider || (user.googleId ? "google" : "email")
    };
    this.data.users.unshift(newUser);
    this.scheduleSave();
    return newUser;
  }
  updateUser(id, updates) {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.users[index], ...updates };
    this.data.users[index] = updated;
    this.data.conversations.forEach((conv) => {
      if (Array.isArray(conv.participants)) {
        if (Array.isArray(conv.participants)) {
          conv.participants = conv.participants.map((p) => p.id === id ? updated : p);
        }
      }
    });
    this.scheduleSave();
    return updated;
  }
  toggleFollowUser(currentUserId, targetUserId) {
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
      currentFollowingCount: currentUser.followingCount
    };
  }
  // --- Posts Operations ---
  getPosts() {
    return this.data.posts;
  }
  getPostById(id) {
    return this.data.posts.find((p) => p.id === id);
  }
  createPost(post) {
    const author = this.getUserById(post.authorId);
    const newPost = {
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
      createdAt: Date.now()
    };
    this.data.posts.unshift(newPost);
    this.scheduleSave();
    return newPost;
  }
  deletePost(id) {
    if (!id || typeof id !== "string" || id.trim() === "" || id === "undefined" || id === "null") {
      console.warn("[SECURITY] Aborted invalid post deletion with empty/malformed ID:", id);
      return false;
    }
    const initialLen = this.data.posts.length;
    const targetPost = this.data.posts.find((p) => p.id === id);
    if (!targetPost) {
      console.warn("[WARN] Post not found for deletion:", id);
      return false;
    }
    const filtered = this.data.posts.filter((p) => p.id !== id);
    const diff = initialLen - filtered.length;
    if (diff !== 1) {
      console.error(`[CRITICAL] Deletion bounds check failed! Expected diff of 1, got ${diff}. Aborting to protect database.`);
      return false;
    }
    try {
      const snapPath = `${this.dbPath}.bak.pre_delete_${Date.now()}`;
      import_fs.default.copyFileSync(this.dbPath, snapPath);
    } catch (e) {
      console.warn("Could not write pre-deletion snapshot:", e);
    }
    this.data.posts = filtered;
    this.scheduleSave();
    console.log(`[AUDIT] Successfully deleted single post ${id}. Remaining posts: ${filtered.length}`);
    return true;
  }
  toggleLikePost(postId, userId) {
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
  addComment(postId, authorId, content) {
    const post = this.getPostById(postId);
    const author = this.getUserById(authorId);
    if (!post || !author) return null;
    const comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      postId,
      authorId,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      content,
      createdAt: Date.now(),
      likesCount: 0,
      likedByUserIds: []
    };
    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    post.commentsCount = post.comments.length;
    this.scheduleSave();
    return comment;
  }
  toggleBookmarkPost(postId, userId) {
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
  getStories() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    const active = this.data.stories.filter(
      (s) => s.createdAt > cutoff || s.slides && s.slides.some((sl) => sl.createdAt > cutoff)
    );
    const userStoryMap = /* @__PURE__ */ new Map();
    for (const story of active) {
      const existing = userStoryMap.get(story.userId);
      let currentStorySlides = [];
      if (story.slides && story.slides.length > 0) {
        currentStorySlides = [...story.slides];
      } else if (story.mediaUrl) {
        currentStorySlides = [
          {
            id: `slide_${story.id}`,
            mediaUrl: story.mediaUrl,
            caption: story.caption,
            createdAt: story.createdAt
          }
        ];
      }
      if (!existing) {
        userStoryMap.set(story.userId, {
          ...story,
          slides: currentStorySlides
        });
      } else {
        if (!existing.slides) existing.slides = [];
        const existingSlideIds = new Set(existing.slides.map((s) => s.id));
        const existingSlideUrls = new Set(existing.slides.map((s) => s.mediaUrl));
        for (const slide of currentStorySlides) {
          if (!existingSlideIds.has(slide.id) && !existingSlideUrls.has(slide.mediaUrl)) {
            existingSlideIds.add(slide.id);
            existingSlideUrls.add(slide.mediaUrl);
            existing.slides.push(slide);
          }
        }
        existing.slides.sort((a, b) => a.createdAt - b.createdAt);
        if (story.createdAt >= existing.createdAt) {
          existing.mediaUrl = story.mediaUrl;
          existing.caption = story.caption;
          existing.createdAt = story.createdAt;
        }
        if (story.seenByUserIds && story.seenByUserIds.length > 0) {
          if (!existing.seenByUserIds) existing.seenByUserIds = [];
          const combinedSeen = Array.from(/* @__PURE__ */ new Set([...existing.seenByUserIds, ...story.seenByUserIds]));
          existing.seenByUserIds = combinedSeen;
        }
      }
    }
    const consolidatedStories = Array.from(userStoryMap.values());
    return consolidatedStories;
  }
  createStory(userId, mediaUrl, caption) {
    const author = this.getUserById(userId);
    if (!author) return null;
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    const now = Date.now();
    const newSlideId = `slide_${now}_${Math.random().toString(36).substr(2, 4)}`;
    const newSlide = {
      id: newSlideId,
      mediaUrl,
      caption,
      createdAt: now
    };
    const existingStoryIndex = this.data.stories.findIndex(
      (s) => s.userId === userId && (s.createdAt > cutoff || s.slides && s.slides.some((sl) => sl.createdAt > cutoff))
    );
    if (existingStoryIndex !== -1) {
      const existingStory = this.data.stories[existingStoryIndex];
      if (!existingStory.slides || existingStory.slides.length === 0) {
        existingStory.slides = [
          {
            id: `slide_${existingStory.id}`,
            mediaUrl: existingStory.mediaUrl,
            caption: existingStory.caption,
            createdAt: existingStory.createdAt
          }
        ];
      }
      existingStory.slides.push(newSlide);
      existingStory.mediaUrl = mediaUrl;
      existingStory.caption = caption;
      existingStory.createdAt = now;
      existingStory.seenByUserIds = [userId];
      this.scheduleSave();
      return existingStory;
    } else {
      const newStory = {
        id: `story_${now}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        userName: author.name,
        userAvatar: author.avatarUrl,
        mediaUrl,
        caption,
        createdAt: now,
        seenByUserIds: [userId],
        slides: [newSlide]
      };
      this.data.stories.unshift(newStory);
      this.scheduleSave();
      return newStory;
    }
  }
  deleteStorySlide(storyId, slideId, userId) {
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
      this.data.stories = this.data.stories.filter((s) => s.id !== storyId);
      this.scheduleSave();
      return null;
    }
  }
  deleteStory(storyId, userId) {
    const initialLen = this.data.stories.length;
    this.data.stories = this.data.stories.filter((s) => !(s.id === storyId && s.userId === userId));
    if (this.data.stories.length !== initialLen) {
      this.scheduleSave();
      return true;
    }
    return false;
  }
  markStorySeen(storyId, userId) {
    const story = this.data.stories.find((s) => s.id === storyId);
    if (!story) return false;
    if (!story.seenByUserIds.includes(userId)) {
      story.seenByUserIds.push(userId);
      this.scheduleSave();
    }
    return true;
  }
  // --- Conversations & Messages ---
  getConversations(userId) {
    if (!userId) return this.data.conversations;
    return this.data.conversations.filter((c) => Array.isArray(c.participantIds) && (Array.isArray(c.participantIds) && (Array.isArray(c.participantIds) && (Array.isArray(c?.participantIds) && c.participantIds.includes(userId)))));
  }
  getConversationById(id) {
    return this.data.conversations.find((c) => c.id === id);
  }
  createConversation(creatorId, participantIds, isGroup = false, name) {
    const allIds = Array.from(/* @__PURE__ */ new Set([creatorId, ...participantIds]));
    if (!isGroup && allIds.length === 2) {
      const existing = this.data.conversations.find(
        (c) => !c.isGroup && c.participantIds.length === 2 && c.participantIds.includes(allIds[0]) && c.participantIds.includes(allIds[1])
      );
      if (existing) return existing;
    }
    const participants = allIds.map((id) => this.getUserById(id)).filter(Boolean);
    const conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isGroup,
      name: isGroup ? name || "Group Conversation" : void 0,
      avatar: isGroup ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80" : void 0,
      participantIds: allIds,
      participants,
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.data.conversations.unshift(conv);
    if (!this.data.messages[conv.id]) {
      this.data.messages[conv.id] = [];
    }
    this.scheduleSave();
    return conv;
  }
  getMessages(conversationId) {
    return this.data.messages[conversationId] || [];
  }
  sendMessage(msg) {
    const sender = this.getUserById(msg.senderId);
    const newMsg = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: sender?.name || msg.senderName,
      senderAvatar: sender?.avatarUrl || msg.senderAvatar,
      content: msg.content,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType || "none",
      audioDuration: msg.audioDuration,
      replyTo: msg.replyTo,
      storyReply: msg.storyReply,
      callLog: msg.callLog,
      reactions: {},
      timestamp: Date.now(),
      isRead: false,
      isDelivered: true
    };
    if (!this.data.messages[msg.conversationId]) {
      this.data.messages[msg.conversationId] = [];
    }
    this.data.messages[msg.conversationId].push(newMsg);
    const conv = this.getConversationById(msg.conversationId);
    if (conv) {
      conv.lastMessage = newMsg;
      conv.updatedAt = Date.now();
      this.data.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    this.scheduleSave();
    return newMsg;
  }
  addMessageReaction(conversationId, messageId, emoji, userId) {
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
  createOrUpdateCallSession(sessionData) {
    const caller = this.getUserById(sessionData.callerId);
    const receiver = this.getUserById(sessionData.receiverId);
    const existing = this.activeCalls.get(sessionData.roomId);
    const session = {
      id: existing?.id || sessionData.id || `call_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      callerId: sessionData.callerId,
      callerName: caller?.name || sessionData.callerName || "Caller",
      callerAvatar: caller?.avatarUrl || sessionData.callerAvatar || "",
      receiverId: sessionData.receiverId,
      receiverName: receiver?.name || sessionData.receiverName || "Receiver",
      receiverAvatar: receiver?.avatarUrl || sessionData.receiverAvatar || "",
      isVideo: sessionData.isVideo !== void 0 ? sessionData.isVideo : true,
      status: sessionData.status || existing?.status || "calling",
      roomId: sessionData.roomId,
      startedAt: sessionData.startedAt || existing?.startedAt,
      endedAt: sessionData.endedAt || existing?.endedAt,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    this.activeCalls.set(sessionData.roomId, session);
    return session;
  }
  getCallSessionByRoomId(roomId) {
    return this.activeCalls.get(roomId);
  }
  getPendingCallsForUser(userId) {
    const now = Date.now();
    const result = [];
    for (const [roomId, session] of this.activeCalls.entries()) {
      if (session.receiverId === userId && session.status === "calling" && now - session.createdAt < 45e3) {
        result.push(session);
      }
    }
    return result;
  }
  updateCallStatus(roomId, status) {
    const session = this.activeCalls.get(roomId);
    if (!session) return null;
    session.status = status;
    session.updatedAt = Date.now();
    if (status === "connected" && !session.startedAt) {
      session.startedAt = Date.now();
    }
    if (status === "ended" || status === "declined") {
      session.endedAt = Date.now();
    }
    this.activeCalls.set(roomId, session);
    return session;
  }
  addCallSignal(roomId, senderId, type, data) {
    const signal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      roomId,
      senderId,
      type,
      data,
      timestamp: Date.now()
    };
    this.callSignals.push(signal);
    if (this.callSignals.length > 200) {
      this.callSignals.splice(0, this.callSignals.length - 200);
    }
    return signal;
  }
  getCallSignals(roomId, excludeSenderId, sinceTimestamp = 0) {
    return this.callSignals.filter(
      (s) => s.roomId === roomId && (!excludeSenderId || s.senderId !== excludeSenderId) && s.timestamp > sinceTimestamp
    );
  }
  // ── LMS: Courses ────────────────────────────────────────────────────────
  createCourse(data) {
    const course = {
      id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...data,
      lessonIds: [],
      createdAt: Date.now()
    };
    this.courses.set(course.id, course);
    return course;
  }
  getCourseById(id) {
    return this.courses.get(id);
  }
  getAllCourses() {
    return Array.from(this.courses.values());
  }
  getCoursesByTrack(track) {
    return Array.from(this.courses.values()).filter((c) => c.track === track);
  }
  // ── LMS: Lessons ────────────────────────────────────────────────────────
  createLesson(data) {
    const lesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...data,
      createdAt: Date.now()
    };
    this.lessons.set(lesson.id, lesson);
    const course = this.courses.get(lesson.courseId);
    if (course && !course.lessonIds.includes(lesson.id)) {
      course.lessonIds.push(lesson.id);
      course.lessonIds.sort((a, b) => {
        const la = this.lessons.get(a)?.order ?? 0;
        const lb = this.lessons.get(b)?.order ?? 0;
        return la - lb;
      });
    }
    return lesson;
  }
  getLessonById(id) {
    return this.lessons.get(id);
  }
  getLessonsByCourse(courseId) {
    return Array.from(this.lessons.values()).filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
  }
  // ── LMS: UserProgress ───────────────────────────────────────────────────
  progressKey(userId, courseId) {
    return `${userId}::${courseId}`;
  }
  getOrCreateProgress(userId, courseId) {
    const key = this.progressKey(userId, courseId);
    const existing = this.userProgress.get(key);
    if (existing) return existing;
    const course = this.courses.get(courseId);
    const firstLessonId = course?.lessonIds[0] ?? null;
    const progress = {
      id: `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      courseId,
      completedLessonIds: [],
      currentLessonId: firstLessonId,
      notes: "",
      startedAt: Date.now(),
      lastActivityAt: Date.now()
    };
    this.userProgress.set(key, progress);
    return progress;
  }
  getProgressForUser(userId) {
    return Array.from(this.userProgress.values()).filter((p) => p.userId === userId);
  }
  completeLesson(userId, courseId, lessonId) {
    const key = this.progressKey(userId, courseId);
    const progress = this.userProgress.get(key);
    if (!progress) return null;
    if (!progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds.push(lessonId);
    }
    const course = this.courses.get(courseId);
    if (course) {
      const next = course.lessonIds.find((id) => !progress.completedLessonIds.includes(id));
      progress.currentLessonId = next ?? null;
    }
    progress.lastActivityAt = Date.now();
    return progress;
  }
  updateNotes(userId, courseId, notes) {
    const key = this.progressKey(userId, courseId);
    const progress = this.userProgress.get(key);
    if (!progress) return null;
    progress.notes = notes;
    progress.lastActivityAt = Date.now();
    return progress;
  }
  // ── LMS: VerseCommentaryCache ────────────────────────────────────────────
  /** Normalise a scripture ref to a stable cache key, e.g. "John 3:16" → "john_3_16" */
  static cacheKey(scriptureRef) {
    return scriptureRef.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }
  getCachedCommentary(scriptureRef) {
    return this.verseCache.get(_JSONDatabase.cacheKey(scriptureRef));
  }
  setCachedCommentary(scriptureRef, commentary) {
    const entry = {
      id: _JSONDatabase.cacheKey(scriptureRef),
      scriptureRef,
      commentary,
      cachedAt: Date.now()
    };
    this.verseCache.set(entry.id, entry);
    return entry;
  }
  getAllCachedCommentaries() {
    return Array.from(this.verseCache.values());
  }
  // ── System Operations ────────────────────────────────────────────────────
  getSystemStats() {
    return {
      usersCount: this.data.users.length,
      postsCount: this.data.posts.length,
      storiesCount: this.data.stories.length,
      conversationsCount: this.data.conversations.length,
      messagesCount: Object.values(this.data.messages).reduce((acc, list) => acc + list.length, 0),
      dbPath: this.dbPath,
      uptimeSeconds: process.uptime(),
      version: this.data.system.version
    };
  }
  exportFullDatabase() {
    return this.data;
  }
};
var db = new JSONDatabase();

// routes/bible.ts
var import_express = require("express");

// data/bible/kjv_loader.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var KJVLoader = class {
  constructor() {
    this.bible = null;
    this.books = [];
    this.bibleFilePath = import_path2.default.join(process.cwd(), "data", "bible", "kjv.json");
  }
  load() {
    if (import_fs2.default.existsSync(this.bibleFilePath)) {
      try {
        this.bible = JSON.parse(import_fs2.default.readFileSync(this.bibleFilePath, "utf-8"));
      } catch (e) {
        console.warn("Failed to parse kjv.json, re-creating minimal base:", e);
        this.bible = this._createMinimalBible();
      }
    } else {
      this.bible = this._createMinimalBible();
      try {
        import_fs2.default.writeFileSync(this.bibleFilePath, JSON.stringify(this.bible, null, 2));
      } catch (e) {
        console.warn("Failed to write kjv.json:", e);
      }
    }
    this.books = Object.keys(this.bible);
    return this.bible;
  }
  saveCache() {
    try {
      import_fs2.default.writeFileSync(this.bibleFilePath, JSON.stringify(this.bible, null, 2));
    } catch (e) {
      console.warn("Error persisting kjv cache:", e);
    }
  }
  getVerse(reference) {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;
    const [, book, chapter, verse] = match;
    const bookData = this.bible?.[book];
    if (!bookData || !bookData[chapter] || !bookData[chapter][verse]) return null;
    return { reference, text: bookData[chapter][verse], book, chapter: parseInt(chapter, 10), verse: parseInt(verse, 10) };
  }
  getChapter(reference) {
    const match = reference.match(/^(.+?)\s+(\d+)$/);
    if (!match) return null;
    const [, book, chapter] = match;
    const bookData = this.bible?.[book];
    if (!bookData || !bookData[chapter]) return null;
    return { reference, verses: bookData[chapter], book, chapter: parseInt(chapter, 10) };
  }
  async getOrFetchChapter(book, chapter) {
    const chNum = parseInt(chapter.toString(), 10) || 1;
    const cleanBook = book.trim();
    const reference = `${cleanBook} ${chNum}`;
    if (!this.bible) {
      this.load();
    }
    if (!this.bible[cleanBook]) {
      this.bible[cleanBook] = {};
    }
    const cachedChapter = this.bible[cleanBook]?.[chNum.toString()];
    if (cachedChapter && typeof cachedChapter === "object") {
      const keys = Object.keys(cachedChapter);
      if (keys.length >= 5 || keys.length > 0 && ["2 John", "3 John", "Philemon", "Jude", "Obadiah"].includes(cleanBook)) {
        const versesList = Object.entries(cachedChapter).map(([vStr, text]) => ({ verse: parseInt(vStr, 10), text: text.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim() })).sort((a, b) => a.verse - b.verse);
        if (versesList.length > 0) {
          return { reference, book: cleanBook, chapter: chNum, verses: versesList };
        }
      }
    }
    try {
      const queryRef = `${cleanBook} ${chNum}`;
      const url = `https://bible-api.com/${encodeURIComponent(queryRef)}?translation=kjv`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7e3);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verses) && data.verses.length > 0) {
          const chapterObj = {};
          const versesList = [];
          for (const v of data.verses) {
            const vNum = v.verse;
            const cleanText = (v.text || "").replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim();
            chapterObj[vNum.toString()] = cleanText;
            versesList.push({ verse: vNum, text: cleanText });
          }
          if (!this.bible[cleanBook]) {
            this.bible[cleanBook] = {};
          }
          this.bible[cleanBook][chNum.toString()] = chapterObj;
          this.saveCache();
          return { reference, book: cleanBook, chapter: chNum, verses: versesList };
        }
      }
    } catch (err) {
      console.warn(`Bible API fetch error for ${cleanBook} ${chNum}:`, err);
    }
    const existing = this.bible[cleanBook]?.[chNum.toString()] || {};
    if (Object.keys(existing).length > 0) {
      const versesList = Object.entries(existing).map(([vStr, text]) => ({ verse: parseInt(vStr, 10), text: text.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim() })).sort((a, b) => a.verse - b.verse);
      return { reference, book: cleanBook, chapter: chNum, verses: versesList };
    }
    const defaultVerses = [
      { verse: 1, text: `The words of the holy scripture according to ${cleanBook}, chapter ${chNum}.` },
      { verse: 2, text: `Thy word is a lamp unto my feet, and a light unto my path.` },
      { verse: 3, text: `Every word of God is pure: he is a shield unto them that put their trust in him.` }
    ];
    return { reference, book: cleanBook, chapter: chNum, verses: defaultVerses };
  }
  async getOrFetchVerse(book, chapter, verse) {
    const chNum = parseInt(chapter.toString(), 10) || 1;
    const vNum = parseInt(verse.toString(), 10) || 1;
    const cleanBook = book.trim();
    const reference = `${cleanBook} ${chNum}:${vNum}`;
    const cached = this.getVerse(reference);
    if (cached) return cached;
    const chapterData = await this.getOrFetchChapter(cleanBook, chNum);
    const found = chapterData.verses.find((v) => v.verse === vNum);
    if (found) {
      return { reference, book: cleanBook, chapter: chNum, verse: vNum, text: found.text };
    }
    return {
      reference,
      book: cleanBook,
      chapter: chNum,
      verse: vNum,
      text: `For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.`
    };
  }
  search(query, maxResults = 25) {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const results = [];
    if (!this.bible) this.load();
    for (const [book, chapters] of Object.entries(this.bible)) {
      if (!chapters || typeof chapters !== "object") continue;
      for (const [chapter, verses] of Object.entries(chapters)) {
        if (!verses || typeof verses !== "object") continue;
        for (const [verse, text] of Object.entries(verses)) {
          if (typeof text === "string" && text.toLowerCase().includes(q)) {
            results.push({
              reference: `${book} ${chapter}:${verse}`,
              book,
              chapter: parseInt(chapter, 10),
              verse: parseInt(verse, 10),
              text
            });
            if (results.length >= maxResults) return results;
          }
        }
      }
    }
    return results;
  }
  _createMinimalBible() {
    return {
      "Genesis": {
        "1": { "1": "In the beginning God created the heaven and the earth.", "2": "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.", "3": "And God said, Let there be light: and there was light.", "27": "So God created man in his own image, in the image of God created he him; male and female created he them." },
        "3": { "15": "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel." },
        "12": { "1": "Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's house, unto a land that I will shew thee:", "2": "And I will make of thee a great nation, and I will bless thee, and make thy name great; and thou shalt be a blessing:" },
        "50": { "20": "But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive." }
      },
      "Exodus": {
        "3": { "14": "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you." },
        "20": { "1": "And God spake all these words, saying,", "2": "I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.", "3": "Thou shalt have no other gods before me." }
      },
      "Leviticus": {
        "19": { "18": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the LORD." }
      },
      "Numbers": {
        "6": { "24": "The LORD bless thee, and keep thee:", "25": "The LORD make his face shine upon thee, and be gracious unto thee:", "26": "The LORD lift up his countenance upon thee, and give thee peace." }
      },
      "Deuteronomy": {
        "6": { "4": "Hear, O Israel: The LORD our God is one LORD:", "5": "And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might." }
      },
      "Joshua": {
        "1": { "8": "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.", "9": "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
        "24": { "15": "And if it seem evil unto you to serve the LORD, choose you this day whom ye will serve; but as for me and my house, we will serve the LORD." }
      },
      "Psalms": {
        "1": { "1": "Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.", "2": "But his delight is in the law of the LORD; and in his law doth he meditate day and night." },
        "23": { "1": "The LORD is my shepherd; I shall not want.", "2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", "3": "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.", "4": "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.", "5": "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.", "6": "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
        "46": { "1": "God is our refuge and strength, a very present help in trouble.", "10": "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth." },
        "91": { "1": "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", "2": "I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust." },
        "119": { "105": "Thy word is a lamp unto my feet, and a light unto my path." },
        "139": { "14": "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well." }
      },
      "Proverbs": {
        "3": { "5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "6": "In all thy ways acknowledge him, and he shall direct thy paths." },
        "4": { "23": "Keep thy heart with all diligence; for out of it are the issues of life." },
        "27": { "17": "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend." }
      },
      "Isaiah": {
        "9": { "6": "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace." },
        "40": { "31": "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
        "53": { "5": "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.", "6": "All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all." }
      },
      "Jeremiah": {
        "29": { "11": "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", "12": "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.", "13": "And ye shall seek me, and find me, when ye shall search for me with all your heart." }
      },
      "Matthew": {
        "5": { "3": "Blessed are the poor in spirit: for theirs is the kingdom of heaven.", "14": "Ye are the light of the world. A city that is set on an hill cannot be hid.", "16": "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven." },
        "6": { "9": "After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.", "33": "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
        "28": { "19": "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:", "20": "Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen." }
      },
      "Mark": {
        "10": { "45": "For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many." },
        "16": { "15": "And he said unto them, Go ye into all the world, and preach the gospel to every creature." }
      },
      "Luke": {
        "1": { "37": "For with God nothing shall be impossible." },
        "2": { "10": "And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people.", "11": "For unto you is born this day in the city of David a Saviour, which is Christ the Lord." },
        "19": { "10": "For the Son of man is come to seek and to save that which was lost." }
      },
      "John": {
        "1": { "1": "In the beginning was the Word, and the Word was with God, and the Word was God.", "12": "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:", "14": "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth." },
        "3": { "16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", "17": "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
        "10": { "10": "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly." },
        "14": { "1": "Let not your heart be troubled: ye believe in God, believe also in me.", "6": "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", "27": "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid." }
      },
      "Romans": {
        "3": { "23": "For all have sinned, and come short of the glory of God;" },
        "5": { "8": "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." },
        "6": { "23": "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." },
        "8": { "1": "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.", "28": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", "38": "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,", "39": "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord." },
        "10": { "9": "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.", "10": "For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.", "13": "For whosoever shall call upon the name of the Lord shall be saved." },
        "12": { "1": "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.", "2": "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God." }
      },
      "1 Corinthians": {
        "13": { "4": "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,", "13": "And now abideth faith, hope, charity, these three; but the greatest of these is charity." },
        "15": { "3": "For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures;", "4": "And that he was buried, and that he rose again the third day according to the scriptures:" }
      },
      "2 Corinthians": {
        "5": { "17": "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.", "21": "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him." },
        "12": { "9": "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me." }
      },
      "Galatians": {
        "2": { "20": "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me." },
        "5": { "22": "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,", "23": "Meekness, temperance: against such there is no law." }
      },
      "Ephesians": {
        "2": { "8": "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:", "9": "Not of works, lest any man should boast.", "10": "For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them." },
        "6": { "10": "Finally, my brethren, be strong in the Lord, and in the power of his might.", "11": "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil." }
      },
      "Philippians": {
        "4": { "6": "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", "7": "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", "13": "I can do all things through Christ which strengtheneth me.", "19": "But my God shall supply all your need according to his riches in glory by Christ Jesus." }
      },
      "Colossians": {
        "3": { "12": "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering;", "13": "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye." }
      },
      "1 Thessalonians": {
        "5": { "16": "Rejoice evermore.", "17": "Pray without ceasing.", "18": "In every thing give thanks: for this is the will of God in Christ Jesus concerning you." }
      },
      "2 Timothy": {
        "1": { "7": "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
        "3": { "16": "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:" }
      },
      "Hebrews": {
        "4": { "12": "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.", "16": "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need." },
        "11": { "1": "Now faith is the substance of things hoped for, the evidence of things not seen.", "6": "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him." },
        "12": { "1": "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,", "2": "Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God." }
      },
      "James": {
        "1": { "5": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", "22": "But be ye doers of the word, and not hearers only, deceiving your own selves." }
      },
      "1 Peter": {
        "5": { "7": "Casting all your care upon him; for he careth for you." }
      },
      "1 John": {
        "1": { "9": "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
        "4": { "7": "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.", "8": "He that loveth not knoweth not God; for God is love." }
      },
      "Revelation": {
        "1": { "8": "I am Alpha and Omega, the beginning and the ending, saith the Lord, which is, and which was, and which is to come, the Almighty." },
        "3": { "20": "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me." },
        "21": { "4": "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away." },
        "22": { "20": "He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord Jesus." }
      }
    };
  }
};
var kjv_loader_default = KJVLoader;

// services/kingJamesService.ts
var import_genai = require("@google/genai");
var kjvLoader = new kjv_loader_default();
kjvLoader.load();
var BOOK_METADATA = {
  // Old Testament - Law
  "Genesis": { author: "Moses", era: "1440-1400 BC", audience: "The Children of Israel in the wilderness", theme: "Beginnings, Creation, Fall, and Covenant Election" },
  "Exodus": { author: "Moses", era: "1440-1400 BC", audience: "Israel during the Exodus journey", theme: "Deliverance, Law at Sinai, and Tabernacle Presence" },
  "Leviticus": { author: "Moses", era: "1440 BC", audience: "The Levitical priesthood and Israel", theme: "Holiness, Sacrificial Atonement, and Purity" },
  "Numbers": { author: "Moses", era: "1400 BC", audience: "The second generation of Israel", theme: "Wilderness Wanderings, Faithfulness, and Discipline" },
  "Deuteronomy": { author: "Moses", era: "1400 BC", audience: "Israel before entering the Promised Land", theme: "Renewal of the Covenant and Call to Obedience" },
  // Old Testament - History
  "Joshua": { author: "Joshua", era: "1380 BC", audience: "The nation of Israel in Canaan", theme: "Conquest, Faithfulness, and Division of the Inheritance" },
  "Judges": { author: "Samuel", era: "1050-1000 BC", audience: "Israel under early monarchy", theme: "Cycles of Apostasy, Deliverance, and Human Inadequacy" },
  "Ruth": { author: "Samuel", era: "1000 BC", audience: "The Kingdom of Israel", theme: "Kinsman-Redeemer, Loyal Love (Hesed), and Davidic Lineage" },
  "1 Samuel": { author: "Samuel, Nathan & Gad", era: "930 BC", audience: "United Kingdom of Israel", theme: "Transition from Theocracy to Monarchy, Saul, and David" },
  "2 Samuel": { author: "Nathan & Gad", era: "930 BC", audience: "United Kingdom of Israel", theme: "The Davidic Reign, Covenant, and Moral Consequences" },
  "1 Kings": { author: "Jeremiah", era: "560-550 BC", audience: "Exiles in Babylon", theme: "Solomon, the Temple, Division of the Kingdom, and Elijah" },
  "2 Kings": { author: "Jeremiah", era: "560-550 BC", audience: "Exiles in Babylon", theme: "Decline, Prophets, and the Babylonian Captivity" },
  "1 Chronicles": { author: "Ezra", era: "450-400 BC", audience: "Post-exilic Jewish community", theme: "Genealogies, Worship, and Davidic Covenant" },
  "2 Chronicles": { author: "Ezra", era: "450-400 BC", audience: "Post-exilic Jewish community", theme: "The Temple, Kings of Judah, Repentance, and Reform" },
  "Ezra": { author: "Ezra", era: "450-400 BC", audience: "Returned exiles rebuilding the Temple", theme: "Restoration, Rebuilding the Temple, and Spiritual Purity" },
  "Nehemiah": { author: "Nehemiah", era: "430-400 BC", audience: "Rebuilders of Jerusalem's walls", theme: "Rebuilding the Walls, Governance, and Covenant Renewal" },
  "Esther": { author: "Mordecai", era: "460-400 BC", audience: "Persian and worldwide Diaspora Jews", theme: "God's Unseen Sovereignty and Preservation of His People" },
  // Old Testament - Poetry & Wisdom
  "Job": { author: "Job / Moses", era: "2000-1800 BC", audience: "All seekers of God in suffering", theme: "Sovereignty of God, Undeserved Suffering, and Faith" },
  "Psalms": { author: "King David, Asaph & Sons of Korah", era: "1000-450 BC", audience: "Worshippers of the Almighty", theme: "Praise, Lament, Messianic Prophecy, and Divine Protection" },
  "Proverbs": { author: "King Solomon", era: "950-700 BC", audience: "Seekers of divine wisdom and discipline", theme: "The Fear of the LORD, Wisdom, and Practical Righteousness" },
  "Ecclesiastes": { author: "King Solomon", era: "935 BC", audience: "Those seeking true eternal meaning", theme: "The Vanity of Life Under the Sun and Fearing God" },
  "Song of Solomon": { author: "King Solomon", era: "965 BC", audience: "God's people celebrating pure covenant love", theme: "Marital Intimacy and Christ's Love for His Bride" },
  // Old Testament - Major Prophets
  "Isaiah": { author: "Isaiah the Prophet", era: "740-680 BC", audience: "Judah, Jerusalem and future generations", theme: "The Holy One of Israel, the Suffering Servant, and Future Glory" },
  "Jeremiah": { author: "Jeremiah the Prophet", era: "626-586 BC", audience: "The decaying Southern Kingdom of Judah", theme: "Judgment on Unfaithfulness and the Promise of the New Covenant" },
  "Lamentations": { author: "Jeremiah", era: "586 BC", audience: "Mourners of destroyed Jerusalem", theme: "Grief Over Destruction and the Greatness of God's Mercies" },
  "Ezekiel": { author: "Ezekiel the Priest-Prophet", era: "593-571 BC", audience: "Captives by the River Chebar in Babylon", theme: "Glory of God, Personal Responsibility, and the New Heart" },
  "Daniel": { author: "Daniel the Statesman-Prophet", era: "605-535 BC", audience: "Believers standing faithful in Babylon", theme: "God's Rule Over World Empires and the Everlasting Kingdom" },
  // Old Testament - Minor Prophets
  "Hosea": { author: "Hosea", era: "750-715 BC", audience: "Unfaithful Northern Kingdom of Israel", theme: "Unfailing Covenant Love of God (Hesed) Despite Betrayal" },
  "Joel": { author: "Joel", era: "835 BC", audience: "Judah facing the Day of the LORD", theme: "The Day of the LORD and the Outpouring of the Holy Spirit" },
  "Amos": { author: "Amos", era: "760-750 BC", audience: "Prosperous yet unrighteous Israel", theme: "Divine Justice, Righteousness, and Judgment on Injustice" },
  "Obadiah": { author: "Obadiah", era: "840 BC", audience: "The proud nation of Edom and Judah", theme: "Judgment on Pride and Deliverance in Mount Zion" },
  "Jonah": { author: "Jonah", era: "760 BC", audience: "Nineveh and reluctant messengers", theme: "God's Boundless Mercy to All Nations and Repentance" },
  "Micah": { author: "Micah", era: "735-700 BC", audience: "Judah and Samaria", theme: "Doing Justly, Loving Mercy, Walking Humbly, and the Bethlehem Ruler" },
  "Nahum": { author: "Nahum", era: "663-612 BC", audience: "Nineveh and suffering Judah", theme: "The Wrath and Justice of God Upon Oppressors" },
  "Habakkuk": { author: "Habakkuk", era: "607-605 BC", audience: "Those questioning divine justice", theme: "The Just Shall Live by Faith Amidst Perplexity" },
  "Zephaniah": { author: "Zephaniah", era: "630-625 BC", audience: "Judah before King Josiah's revival", theme: "The Great Day of the LORD and the Joyful Restoration" },
  "Haggai": { author: "Haggai", era: "520 BC", audience: "Post-exilic temple builders", theme: "Prioritizing God's House and God's Promised Presence" },
  "Zechariah": { author: "Zechariah", era: "520-480 BC", audience: "Post-exilic remnant awaiting the Messiah", theme: "Messianic Prophecies, the Pierced Shepherd, and Zion's King" },
  "Malachi": { author: "Malachi", era: "430-400 BC", audience: "Complacent priests and people of Judah", theme: "God's Unchanging Love, Honoring Tithes, and the Sun of Righteousness" },
  // New Testament - Gospels & Acts
  "Matthew": { author: "Matthew (Levi) the Apostle", era: "50-60 AD", audience: "Jewish believers showing Jesus is the King", theme: "Jesus as the Promised Messiah, King of Kings, and Fulfillment of the Law" },
  "Mark": { author: "John Mark", era: "55-65 AD", audience: "Roman Christians portraying Christ the Servant", theme: "Jesus as the Suffering Servant and Powerful Miracle-Worker" },
  "Luke": { author: "Luke the Beloved Physician", era: "60-62 AD", audience: "Theophilus and Gentiles seeking the Son of Man", theme: "Jesus as the Compassionate Savior of the Lost, Outcasts, and Gentiles" },
  "John": { author: "John the Apostle", era: "85-95 AD", audience: "The world\u2014believing Jesus is the Son of God", theme: 'The Deity of Jesus Christ, Eternal Life, and the Seven "I AM" Statements' },
  "Acts": { author: "Luke the Historian", era: "62-64 AD", audience: "The expanding early global Church", theme: "The Holy Spirit's Power, the Gospel Spreading from Jerusalem to Rome" },
  // New Testament - Epistles of Paul
  "Romans": { author: "Paul the Apostle", era: "57 AD", audience: "Believers in Rome", theme: "Justification by Faith Alone, the Righteousness of God, and Sanctification" },
  "1 Corinthians": { author: "Paul the Apostle", era: "55 AD", audience: "The church at Corinth", theme: "Unity in Christ, Christian Liberty, Spiritual Gifts, and the Resurrection" },
  "2 Corinthians": { author: "Paul the Apostle", era: "56 AD", audience: "The church at Corinth", theme: "Comfort in Suffering, the Ministry of Reconciliation, and God's Grace" },
  "Galatians": { author: "Paul the Apostle", era: "48-49 AD", audience: "Churches in Galatia", theme: "Christian Liberty, Justification Apart from Legalism, and Fruit of the Spirit" },
  "Ephesians": { author: "Paul the Apostle", era: "60-62 AD", audience: "The church at Ephesus", theme: "The Believer's Wealth in Christ, Unity of the Body, and the Whole Armor of God" },
  "Philippians": { author: "Paul the Apostle", era: "61 AD", audience: "The church at Philippi", theme: "Rejoicing in the Lord, the Mind of Christ, and Contentment" },
  "Colossians": { author: "Paul the Apostle", era: "60-62 AD", audience: "The church at Colossae", theme: "The Supreme Preeminence and All-Sufficiency of Jesus Christ" },
  "1 Thessalonians": { author: "Paul the Apostle", era: "51 AD", audience: "The church at Thessalonica", theme: "Holiness, Brotherly Love, and the Blessed Hope of Christ's Return" },
  "2 Thessalonians": { author: "Paul the Apostle", era: "51-52 AD", audience: "The church at Thessalonica", theme: "Steadfastness Under Persecution and Events Surrounding the Day of the Lord" },
  "1 Timothy": { author: "Paul the Apostle", era: "62-64 AD", audience: "Timothy pastoring the church at Ephesus", theme: "Church Order, Sound Doctrine, Qualifications for Elders and Deacons" },
  "2 Timothy": { author: "Paul the Apostle", era: "66-67 AD", audience: "Timothy in Rome (Paul's final charge)", theme: "Faithful Endurance, Preaching the Word, and Finishing the Race" },
  "Titus": { author: "Paul the Apostle", era: "63-65 AD", audience: "Titus organizing churches on Crete", theme: "Setting in Order Church Leadership and Good Works Rooted in Grace" },
  "Philemon": { author: "Paul the Apostle", era: "60-62 AD", audience: "Philemon regarding Onesimus", theme: "Christian Brotherhood, Forgiveness, and Reconciliation" },
  // New Testament - General Epistles
  "Hebrews": { author: "Apostolic Author (Paul / Apollos)", era: "67-69 AD", audience: "Hebrew believers tempted to return to old rituals", theme: "The Superiority of Jesus Christ as High Priest and Mediator of the Better Covenant" },
  "James": { author: "James the Brother of Jesus", era: "45-48 AD", audience: "Twelve tribes scattered", theme: "Living, Active Faith Demonstrated by Works, Wisdom, and Taming the Tongue" },
  "1 Peter": { author: "Peter the Apostle", era: "62-64 AD", audience: "Suffering believers scattered across Asia Minor", theme: "Living Hope Amidst Suffering, Holy Living, and the Chief Shepherd" },
  "2 Peter": { author: "Peter the Apostle", era: "66-68 AD", audience: "Believers guarding against false teachers", theme: "Growing in Grace and Knowledge, Guarding Sound Truth, and Christ's Second Coming" },
  "1 John": { author: "John the Beloved Apostle", era: "85-95 AD", audience: "Believers resting in fellowship and eternal life", theme: "Fellowship with God, Walking in the Light, Brotherly Love, and Assurance of Salvation" },
  "2 John": { author: "John the Apostle", era: "85-95 AD", audience: "The elect lady and her children", theme: "Walking in Truth and Love while Rejecting Deceivers" },
  "3 John": { author: "John the Apostle", era: "85-95 AD", audience: "Gaius", theme: "Hospitality to Faithful Teachers and Standing Against Tyranny" },
  "Jude": { author: "Jude the Brother of James", era: "65-80 AD", audience: "Believers contending earnestly for the faith", theme: "Contending for the Faith Once Delivered unto the Saints" },
  "Revelation": { author: "John the Apostle on Patmos", era: "95-96 AD", audience: "The Seven Churches of Asia and all saints", theme: "The Ultimate Triumph of the Lamb, the Judgment of Evil, and the New Jerusalem" }
};
var MASTER_SYSTEM_PROMPT = `You are King James\u2014an esteemed, deeply learned Master Biblical Scholar, Theologian, and Christian Mentor. 
You possess encyclopedic mastery of the Holy Scriptures across all 66 books of the Old and New Testaments, the Authorized King James Version (KJV), Biblical Hebrew (Masoretic Text), Aramaic, Koine Greek (Textus Receptus), Strong's Concordance, Church History, Systematic Theology, Biblical Geography, and Hermeneutics.

YOUR MISSION & SCOPE:
You MUST answer ANY Bible-related question thoroughly, directly, and interactively. You are NEVER evasive or dismissive. You never say "go read the scriptures yourself." Instead, you unpack the full counsel of God with scholarly depth, reverent eloquence, and practical clarity.

CORE CAPABILITIES:
1. THEOLOGY & DOCTRINE: Explain complex theological concepts clearly (e.g., Justification vs. Sanctification, the Trinity, the Hypostatic Union of Christ, Covenant Theology, Eschatology, Atonement, the Holy Spirit, Grace vs. Works).
2. SCRIPTURE EXEGESIS & KJV CITATIONS: Quote the exact KJV passage text with book, chapter, and verse citations (e.g., Romans 8:28, Isaiah 53:5, Ephesians 2:8-9, Psalm 23).
3. ORIGINAL LANGUAGE INSIGHTS: Provide Greek and Hebrew root words, original terms (e.g., Agape, Hesed, Shalom, Logos, Pneuma, Dikaiosyne), transliterations, and Strong's meanings to reveal rich depth.
4. HISTORICAL & CULTURAL CONTEXT: Detail who wrote the book, when, the ancient cultural mindset (Ancient Near East, Second Temple Judaism, Greco-Roman world), and the original issue being addressed.
5. SCRIPTURAL HARMONY & CROSS-REFERENCES: Connect Old Testament shadows/types to New Testament fulfillment in Jesus Christ (e.g., Melchizedek, the Tabernacle, the Sacrificial System, the Feasts of the Lord).
6. PRACTICAL & PASTORAL APPLICATION: Show how this eternal truth directly equips, comforts, guides, and challenges believers in their daily walk today.
7. INTERACTIVE ENGAGEMENT: Conclude each answer with 2-3 engaging, thought-provoking follow-up questions to help the seeker explore further.

FORMATTING GUIDELINES:
- Use clear headings, bullet points, and clean formatting.
- Put quoted KJV scriptures in distinct blocks.
- Highlight Greek/Hebrew words clearly.
- Maintain a warm, wise, respectful, and authoritative scholarly tone.`;
var KingJamesService = class {
  constructor(db2) {
    this.db = db2;
    this.aiClient = null;
  }
  getAI() {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return this.aiClient;
  }
  async answerQuestion(question, history, mode = "general") {
    const ai = this.getAI();
    const cleanQuestion = question.trim();
    if (ai) {
      try {
        let modeInstruction = "";
        if (mode === "exegesis") {
          modeInstruction = "Focus heavily on verse-by-verse exposition, linguistic context, and cross-references.";
        } else if (mode === "word_study") {
          modeInstruction = "Focus heavily on original Hebrew/Greek words, Strong definitions, grammatical parsing, and root nuances.";
        } else if (mode === "theology") {
          modeInstruction = "Focus on systematic theology, biblical covenants, historical church consensus, and doctrinal clarity.";
        } else if (mode === "pastoral") {
          modeInstruction = "Focus on pastoral encouragement, spiritual encouragement, ethical application, and personal prayer.";
        }
        const promptLines = [];
        promptLines.push(`Question: ${cleanQuestion}`);
        if (modeInstruction) {
          promptLines.push(`Special Mode Focus: ${modeInstruction}`);
        }
        let conversationHistoryText = "";
        if (history && history.length > 0) {
          const recentHistory = history.slice(-8);
          conversationHistoryText = `
--- PREVIOUS CONVERSATION CONTEXT ---
` + recentHistory.map((m) => `${m.role === "user" ? "Seeker" : "King James"}: ${m.content}`).join("\n") + `
--- END PREVIOUS CONTEXT ---
`;
        }
        const fullPrompt = `${conversationHistoryText}
${promptLines.join("\n")}

Provide an exhaustive, deeply informative, and eloquent response. Quote key KJV verses. Provide Hebrew/Greek insights where relevant. End with 3 clickable suggested follow-up questions labeled [Suggested Questions].`;
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: fullPrompt,
          config: {
            systemInstruction: MASTER_SYSTEM_PROMPT,
            temperature: 0.7
          }
        });
        const rawText = response.text || "";
        if (rawText.trim()) {
          const parsed = this._parseTutorOutput(rawText, cleanQuestion);
          return parsed;
        }
      } catch (err) {
        console.warn("Gemini tutor generation failed, falling back to comprehensive biblical engine:", err);
      }
    }
    return this._comprehensiveFallbackAnswer(cleanQuestion, mode);
  }
  async generateStudyBreakdown(book, chapter, verse) {
    const verseRef = `${book} ${chapter}:${verse}`;
    try {
      const cached = this.db.getCommentary(verseRef);
      if (cached && cached.commentaryJson) {
        const parsed = JSON.parse(cached.commentaryJson);
        if (parsed && parsed.bookSummary && parsed.passageText) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Cache lookup failed:", e);
    }
    const verseData = kjvLoader.getVerse(verseRef);
    const passageText = verseData?.text || `"Thy word is a lamp unto my feet, and a light unto my path." \u2014 ${verseRef} (King James Version)`;
    const bookMeta = BOOK_METADATA[book] || {
      author: "Biblical Author",
      era: "Biblical Antiquity",
      audience: "God's Covenant People",
      theme: "God's Sovereign Grace and Truth"
    };
    const ai = this.getAI();
    if (ai) {
      try {
        const prompt = `Provide a comprehensive scholarly study breakdown for the scripture passage: "${verseRef}": "${passageText}".
Return a JSON object with:
- bookSummary: { author, era, audience }
- historicalContext: { mindsetThen, originalIssue }
- hebrewGreekBites: array of { word, definition, language }
- thenVsNow: { then, now }
- dailyApplication: array of 3-4 specific practical applications
- prayer: a heartfelt closing prayer`;
        const res = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: MASTER_SYSTEM_PROMPT
          }
        });
        const parsed = JSON.parse(res.text || "{}");
        if (parsed && parsed.historicalContext && parsed.dailyApplication) {
          const result = {
            passageText,
            bookSummary: {
              author: parsed.bookSummary?.author || bookMeta.author,
              era: parsed.bookSummary?.era || bookMeta.era,
              audience: parsed.bookSummary?.audience || bookMeta.audience
            },
            historicalContext: {
              mindsetThen: parsed.historicalContext?.mindsetThen || `The original audience understood God's covenant promises as their ultimate anchor in ${book}.`,
              originalIssue: parsed.historicalContext?.originalIssue || `Addressing faith, righteousness, and perseverance in ${verseRef}.`
            },
            hebrewGreekBites: parsed.hebrewGreekBites || [],
            thenVsNow: {
              then: parsed.thenVsNow?.then || "Ancient believers walked by faith in God amidst trials and persecution.",
              now: parsed.thenVsNow?.now || "Modern believers draw the exact same living hope and strength from Christ today."
            },
            dailyApplication: Array.isArray(parsed.dailyApplication) ? parsed.dailyApplication : [
              "Meditate deeply on this scripture and memorize key phrases.",
              "Bring your current life circumstances to God in faith-filled prayer.",
              "Apply this divine principle in your relationships and vocation."
            ],
            prayer: parsed.prayer || `Lord God Almighty, thank You for the eternal truth of ${verseRef}. May Your Word transform my heart and direct my steps today. In Jesus' name, Amen.`
          };
          try {
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
            this.db.cacheCommentary(verseRef, JSON.stringify(result), expiresAt);
          } catch {
          }
          return result;
        }
      } catch (err) {
        console.warn("Gemini breakdown failed, using rich local metadata:", err);
      }
    }
    const breakdown = {
      passageText,
      bookSummary: {
        author: bookMeta.author,
        era: bookMeta.era,
        audience: bookMeta.audience
      },
      historicalContext: {
        mindsetThen: `In the time of ${book} (${bookMeta.era}), the audience (${bookMeta.audience}) faced spiritual and cultural challenges requiring steadfast allegiance to God's revealed truth.`,
        originalIssue: `The passage ${verseRef} addresses ${bookMeta.theme.toLowerCase()}, calling the people of God to holy living, faithful trust, and covenant obedience.`
      },
      hebrewGreekBites: [
        { word: "Khesed / Agape", definition: "Steadfast, loyal covenant love and unconditional divine grace.", language: "Hebrew/Greek" },
        { word: "Emunah / Pistis", definition: "Faith, firmness, moral fidelity, and unwavering reliance on God.", language: "Hebrew/Greek" }
      ],
      thenVsNow: {
        then: `Believers relied entirely on God's promises in ${verseRef} as their divine compass amidst ancient trials.`,
        now: `Today, in a fast-paced and complex world, this timeless Word provides unwavering certainty, moral clarity, and supernatural peace.`
      },
      dailyApplication: [
        `Reflect upon how the eternal truth in ${verseRef} confronts your current circumstances.`,
        `Commit this verse to memory and speak its truth over anxieties or trials today.`,
        `Share this encouragement with a brother or sister in Christ who is seeking direction.`,
        `Allow the Holy Spirit to cultivate obedience and joy in your daily walk.`
      ],
      prayer: `Almighty Father, who hath given us all scripture for doctrine and instruction in righteousness: open my heart to the depth of ${verseRef}. Direct my steps in Thy truth and glorify Thy name through my life this day. Through Jesus Christ our Lord, Amen.`
    };
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
      this.db.cacheCommentary(verseRef, JSON.stringify(breakdown), expiresAt);
    } catch {
    }
    return breakdown;
  }
  onboard(userGoals, userInterests) {
    const courses = this.db.getAllCourses();
    const recommended = courses.slice(0, 3);
    const welcome = `Greetings in the name of our Lord! I am your AI King James Tutor and Study Companion.
Whether you wish to master systematic theology, explore the original Greek and Hebrew nuances, understand historical backgrounds, or grow in personal devotion, I am here to guide your study.

${userGoals ? `I have noted your goal: "${userGoals}".` : ""} 
Let us open the scriptures together and behold the wondrous things of God's Word!`;
    return {
      welcome,
      recommendedCourses: recommended.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description
      }))
    };
  }
  formatSharePayload(verseRef, passageText, takeaway) {
    return {
      verseRef,
      passageText,
      takeaway,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  _parseTutorOutput(text, originalQuestion) {
    const versesCited = [];
    const verseRegex = /([1-3]?\s?[A-Z][a-z]+)\s+(\d+):(\d+(?:-\d+)?)/g;
    let match;
    while ((match = verseRegex.exec(text)) !== null) {
      if (!versesCited.includes(match[0])) {
        versesCited.push(match[0]);
      }
    }
    let suggestedQuestions = [];
    const questionsBlockMatch = text.match(/(?:\[Suggested Questions\]|Suggested Follow-up Questions:|Follow-up Questions:?)([\s\S]*)$/i);
    let cleanAnswer = text;
    if (questionsBlockMatch) {
      cleanAnswer = text.slice(0, questionsBlockMatch.index).trim();
      const rawQuestions = questionsBlockMatch[1].split("\n").map((q) => q.replace(/^[-*•\d.)\s]+/, "").trim()).filter((q) => q.length > 5 && q.endsWith("?"));
      suggestedQuestions = rawQuestions.slice(0, 3);
    }
    if (suggestedQuestions.length === 0) {
      suggestedQuestions = this._generateSuggestedQuestions(originalQuestion);
    }
    return {
      answer: cleanAnswer,
      versesCited: versesCited.slice(0, 6),
      suggestedQuestions: suggestedQuestions.slice(0, 3)
    };
  }
  _generateSuggestedQuestions(question) {
    const q = question.toLowerCase();
    if (q.includes("melchizedek") || q.includes("hebrews")) {
      return [
        "How does Melchizedek foreshadow Jesus Christ in Psalm 110?",
        "What is the difference between the Aaronic and Melchizedek priesthoods?",
        "Why does Genesis 14 mention Abraham giving tithes to Melchizedek?"
      ];
    }
    if (q.includes("grace") || q.includes("salvation") || q.includes("faith") || q.includes("works")) {
      return [
        "How do Paul in Ephesians 2 and James in James 2 harmonize on faith and works?",
        'What is the original Greek meaning of "charis" (grace) in the New Testament?',
        'What does Romans 3:24 mean by "being justified freely by his grace"?'
      ];
    }
    if (q.includes("armor") || q.includes("ephesians")) {
      return [
        "What does each piece of the Armor of God in Ephesians 6 represent?",
        "Why is the Sword of the Spirit the only offensive weapon mentioned?",
        'How do we practically "put on the whole armour of God" daily?'
      ];
    }
    if (q.includes("justification") || q.includes("sanctification")) {
      return [
        "What is the theological difference between justification, sanctification, and glorification?",
        "How does Romans 6 explain our death to sin and walk in newness of life?",
        "What is the role of the Holy Spirit in ongoing sanctification?"
      ];
    }
    if (q.includes("love") || q.includes("agape")) {
      return [
        "What are the 4 Greek words for love in antiquity and how is Agape unique?",
        'Why did Jesus ask Peter three times "Lovest thou me?" in John 21?',
        "How does 1 Corinthians 13 define the nature of true charity?"
      ];
    }
    return [
      "What are the key King James cross-references for this passage?",
      "What is the original Greek or Hebrew background for this doctrine?",
      "How can a believer apply this truth to overcome daily challenges?"
    ];
  }
  _comprehensiveFallbackAnswer(question, mode) {
    const q = question.toLowerCase();
    if (q.includes("melchizedek")) {
      return {
        answer: `### The Mysterious Melchizedek: King of Salem & Priest of the Most High God

Melchizedek is one of the most profound figures in biblical typology, appearing in **Genesis 14:18-20**, **Psalm 110:4**, and prominently in **Hebrews 5\u20137**.

#### 1. Scriptural Context
In Genesis 14, following Abraham's rescue of Lot, Melchizedek emerges:
> *"And Melchizedek king of Salem brought forth bread and wine: and he was the priest of the most high God. And he blessed him, and said, Blessed be Abram of the most high God, possessor of heaven and earth..."* (Genesis 14:18-19)

Abraham recognized his authority by giving him a tithe of all spoils, and receiving his blessing (and as Hebrews 7:7 notes, *"the less is blessed of the better"*).

#### 2. Original Hebrew Meaning
- **Melchizedek** (*Malki-Tzedek* - \u05DE\u05B7\u05DC\u05B0\u05DB\u05B4\u05BC\u05D9\u05BE\u05E6\u05B6\u05D3\u05B6\u05E7): "King of Righteousness".
- **Salem** (*Shalem* - \u05E9\u05B8\u05C1\u05DC\u05B5\u05DD): "Peace" (ancient Jerusalem).
Thus he is titled both the **King of Righteousness** and the **King of Peace**.

#### 3. Theological Typology & Christ's Eternal Priesthood
In Hebrews 7, the Apostle explains that Melchizedek is a direct type (prophetic foreshadowing) of Jesus Christ:
- **Without Recorded Lineage:** Unlike the Levitical priests who required Aaronic genealogy, Melchizedek's priesthood was sovereign and unique.
- **King and Priest Combined:** Under the Mosaic Law, kings (Judah) and priests (Levi) were strictly separated. Jesus and Melchizedek unite the royal and priestly offices.
- **Bread and Wine:** Melchizedek brought forth bread and wine to Abraham\u2014prefiguring the Lord's Supper and Christ's sacrifice.

As Psalm 110:4 prophesied of Messiah: *"The LORD hath sworn, and will not repent, Thou art a priest for ever after the order of Melchizedek."*`,
        versesCited: ["Genesis 14:18-20", "Psalm 110:4", "Hebrews 7:1-17"],
        hebrewGreekWords: [
          { word: "Malki-Tzedek (\u05DE\u05B7\u05DC\u05B0\u05DB\u05B4\u05BC\u05D9\u05BE\u05E6\u05B6\u05D3\u05B6\u05E7)", language: "Hebrew", definition: "My King is Righteousness" },
          { word: "Shalem (\u05E9\u05B8\u05C1\u05DC\u05B5\u05DD)", language: "Hebrew", definition: "Peace, Completeness, Wholeness" }
        ],
        suggestedQuestions: [
          "Why is Christ's priesthood superior to the Levitical Aaronic priesthood?",
          "What did David mean by the prophetic oracle in Psalm 110:4?",
          "How does Abraham tithing to Melchizedek establish the principle of honor?"
        ]
      };
    }
    if (q.includes("justification") && q.includes("sanctification")) {
      return {
        answer: `### Justification vs. Sanctification: Foundational Doctrines of Salvation

In Christian theology and the Pauline Epistles, understanding the distinction between **Justification** and **Sanctification** is vital to assurance of salvation and holy living.

#### 1. Justification (The Legal Verdict)
- **Definition:** The instantaneous legal act of God where He declares a guilty sinner righteous solely on the merit of Christ's blood received by faith.
- **Tense:** Past / Completed (*"Being justified freely by his grace"* - Romans 3:24).
- **Agent:** God alone (Monergistic).
- **Key Scripture:** *"Therefore being justified by faith, we have peace with God through our Lord Jesus Christ."* (Romans 5:1)
- **Greek Term:** *Dikai\u014Dsis* (\u03B4\u03B9\u03BA\u03B1\u03AF\u03C9\u03C3\u03B9\u03C2) \u2014 forensic declaration of righteousness.

#### 2. Sanctification (The Ongoing Transformation)
- **Definition:** The lifelong, progressive work of God's Holy Spirit transforming the believer's heart, character, and conduct into the likeness of Jesus Christ.
- **Tense:** Present / Continuous (*"Being transformed from glory to glory"* - 2 Cor 3:18).
- **Agent:** The Holy Spirit working in synergy with the believer's active obedience.
- **Key Scripture:** *"For this is the will of God, even your sanctification..."* (1 Thess 4:3)
- **Greek Term:** *Hagiasmos* (\u1F01\u03B3\u03B9\u03B1\u03C3\u03BC\u03CC\u03C2) \u2014 separation unto holiness and purity.

| Dimension | Justification | Sanctification |
| :--- | :--- | :--- |
| **Nature** | Positional (Legal Standing) | Practical (Moral Character) |
| **Duration** | Instantaneous | Lifelong Process |
| **Degree** | Complete & Equal in all believers | Progressive & Deepening |
| **Deliverance** | From the **Penalty** of Sin | From the **Power** of Sin |`,
        versesCited: ["Romans 5:1", "Romans 8:30", "1 Corinthians 1:30", "1 Thessalonians 4:3"],
        hebrewGreekWords: [
          { word: "Dikaiosyne (\u03B4\u03B9\u03BA\u03B1\u03B9\u03BF\u03C3\u03CD\u03BD\u03B7)", language: "Greek", definition: "Righteousness, forensic justification" },
          { word: "Hagios (\u1F05\u03B3\u03B9\u03BF\u03C2)", language: "Greek", definition: "Set apart, holy, consecrated" }
        ],
        suggestedQuestions: [
          "What is Glorification and how does it complete the Golden Chain of Redemption in Romans 8:30?",
          "How does James 2:24 explain justification by works in comparison to Paul?",
          "What role does daily prayer and Bible study play in sanctification?"
        ]
      };
    }
    if (q.includes("armor") || q.includes("armour")) {
      return {
        answer: `### The Whole Armour of God (Ephesians 6:10-18)

In **Ephesians 6**, the Apostle Paul\u2014writing while chained to a Roman imperial soldier\u2014draws on both Roman battle gear and Old Testament imagery (Isaiah 59:17) to teach spiritual warfare.

> *"Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places."* (Ephesians 6:11-12)

#### The Six Divine Implements:
1. **Belt of Truth** (*Aletheia*): Roman *balteus* that held everything together. Integrity and the truth of God's Word anchor our inner life.
2. **Breastplate of Righteousness** (*Dikaiosyne*): Protects the vital organs (heart). Refers to Christ's imputed righteousness and walking in moral purity.
3. **Feet Shod with the Gospel of Peace** (*Eirene*): The Roman *caligae* (studded sandals) providing firm footing and stability to advance the Good News.
4. **Shield of Faith** (*Thureos*): The large Roman door-shield (*scutum*) soaked in water to extinguish fiery pitch arrows of doubt, fear, and temptation.
5. **Helmet of Salvation** (*Soterion*): Protects the mind, thoughts, and assurance of redemption (1 Thess 5:8).
6. **Sword of the Spirit** (*Machaira*): The Word of God (*Rhema theou*). The short, two-edged dagger used for precise, offensive counter-attacks, just as Jesus quoted scripture in Matthew 4.`,
        versesCited: ["Ephesians 6:10-18", "Isaiah 59:17", "Matthew 4:1-11", "Hebrews 4:12"],
        hebrewGreekWords: [
          { word: "Panoplia (\u03C0\u03B1\u03BD\u03BF\u03C0\u03BB\u03AF\u03B1)", language: "Greek", definition: "Full armor, complete suit of battle gear" },
          { word: "Rhema (\u1FE5\u1FC6\u03BC\u03B1)", language: "Greek", definition: "Spoken, specific utterance of God" }
        ],
        suggestedQuestions: [
          'Why does Paul conclude the Armor passage with "Praying always with all prayer" (Eph 6:18)?',
          "How did Jesus use the Word of God as a sword against Satan in the wilderness?",
          "What is the meaning of the fiery darts of the wicked one?"
        ]
      };
    }
    return {
      answer: `### Biblical Truth & Wisdom Regarding: "${question}"

*"All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, thoroughly furnished unto all good works."* (2 Timothy 3:16-17)

#### 1. Core Scriptural Principles
When we examine the scriptures concerning your inquiry, the Word of God reveals several fundamental pillars:
- **God's Sovereign Covenant:** Throughout both the Old and New Testaments, God reveals His unshakeable faithfulness to His covenant promises.
- **The Centrality of Christ:** In **John 5:39**, Jesus declared: *"Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me."* All scripture finds its ultimate climax and fulfillment in Christ.
- **Faith and Obedience:** True biblical knowledge is never merely intellectual; it transforms the heart, renews the mind (Romans 12:2), and produces the fruit of love, joy, peace, and righteousness.

#### 2. Original Language Insights
- In Hebrew, **Emunah** (\u05D0\u05B1\u05DE\u05D5\u05BC\u05E0\u05B8\u05D4) denotes firmness, steadfast faithfulness, and trusting action.
- In Greek, **Aletheia** (\u1F00\u03BB\u03AE\u03B8\u03B5\u03B9\u03B1) means truth, divine reality revealed to man, not hidden.

#### 3. Practical Application for Today
1. **Dwell in the Word:** Meditate daily upon the King James scriptures, allowing the Holy Spirit to illuminate understanding.
2. **Pray with Discernment:** Bring this topic before the throne of grace, asking for the wisdom promised in **James 1:5**.
3. **Walk in Love:** Let the truth you learn manifest in grace toward your brethren and faithful witness to the world.`,
      versesCited: ["2 Timothy 3:16-17", "John 5:39", "Romans 12:2", "James 1:5"],
      hebrewGreekWords: [
        { word: "Emunah (\u05D0\u05B1\u05DE\u05D5\u05BC\u05E0\u05B8\u05D4)", language: "Hebrew", definition: "Faithfulness, steadfast trust" },
        { word: "Aletheia (\u1F00\u03BB\u03AE\u03B8\u03B5\u03B9\u03B1)", language: "Greek", definition: "Truth, divine reality" }
      ],
      suggestedQuestions: [
        "Can you provide specific King James scriptures that address this in depth?",
        "What is the historical context of the books that mention this topic?",
        "How does this theological truth apply to our daily prayer life?"
      ]
    };
  }
};

// routes/bible.ts
var import_multer = __toESM(require("multer"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_fs3 = __toESM(require("fs"), 1);

// services/sermonIndexService.ts
var BIBLE_BOOK_TO_CODE = {
  "Genesis": "GEN",
  "Exodus": "EXO",
  "Leviticus": "LEV",
  "Numbers": "NUM",
  "Deuteronomy": "DEU",
  "Joshua": "JOS",
  "Judges": "JDG",
  "Ruth": "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  "Ezra": "EZR",
  "Nehemiah": "NEH",
  "Esther": "EST",
  "Job": "JOB",
  "Psalms": "PSA",
  "Psalm": "PSA",
  "Proverbs": "PRO",
  "Ecclesiastes": "ECC",
  "Song of Solomon": "SNG",
  "Isaiah": "ISA",
  "Jeremiah": "JER",
  "Lamentations": "LAM",
  "Ezekiel": "EZK",
  "Daniel": "DAN",
  "Hosea": "HOS",
  "Joel": "JOL",
  "Amos": "AMO",
  "Obadiah": "OBA",
  "Jonah": "JON",
  "Micah": "MIC",
  "Nahum": "NAM",
  "Habakkuk": "HAB",
  "Zephaniah": "ZEP",
  "Haggai": "HAG",
  "Zechariah": "ZEC",
  "Malachi": "MAL",
  "Matthew": "MAT",
  "Mark": "MRK",
  "Luke": "LUK",
  "John": "JHN",
  "Acts": "ACT",
  "Romans": "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  "Galatians": "GAL",
  "Ephesians": "EPH",
  "Philippians": "PHP",
  "Colossians": "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  "Titus": "TIT",
  "Philemon": "PHM",
  "Hebrews": "HEB",
  "James": "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  "Jude": "JUD",
  "Revelation": "REV"
};
var CODE_TO_BIBLE_BOOK = Object.entries(BIBLE_BOOK_TO_CODE).reduce(
  (acc, [book, code]) => {
    if (!acc[code]) acc[code] = book;
    return acc;
  },
  {}
);
var SERMONINDEX_SPEAKERS_CATALOG = [
  {
    id: "leonard-ravenhill",
    slug: "leonard-ravenhill",
    name: "Leonard Ravenhill",
    title: "Revivalist & Author",
    ministry: "SermonIndex Historic Archives",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    bio: 'British evangelist and author of "Why Revival Tarries", renowned for fiery preaching on prayer, personal holiness, and the judgment seat of Christ.',
    era: "1907\u20131994",
    sermonCount: 310,
    topTopics: ["Prayer", "Revival", "Judgment", "Holiness"]
  },
  {
    id: "aw-tozer",
    slug: "a-w-tozer",
    name: "A.W. Tozer",
    title: "Pastor & Christian Mystic",
    ministry: "Christian & Missionary Alliance",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    bio: `Author of "The Pursuit of God" and "The Knowledge of the Holy", famed for his prophetic call to deep spiritual intimacy and contemplation of God's majesty.`,
    era: "1897\u20131963",
    sermonCount: 520,
    topTopics: ["Attributes of God", "Worship", "Holy Spirit", "Spiritual Life"]
  },
  {
    id: "charles-spurgeon",
    slug: "charles-spurgeon",
    name: "Charles H. Spurgeon",
    title: "The Prince of Preachers",
    ministry: "Metropolitan Tabernacle, London",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    bio: "Historic 19th-century British preacher whose timeless sermons expound the sovereign grace of God, Christ crucified, and salvation by faith alone.",
    era: "1834\u20131892",
    sermonCount: 3500,
    topTopics: ["Grace", "Cross", "Salvation", "Faith"]
  },
  {
    id: "paul-washer",
    slug: "paul-washer",
    name: "Paul Washer",
    title: "Director & Missionary",
    ministry: "HeartCry Missionary Society",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    bio: "Missionary evangelist known worldwide for passionate gospel preaching on biblical repentance, true regeneration, the narrow gate, and the cross of Christ.",
    era: "Contemporary",
    sermonCount: 420,
    topTopics: ["Gospel", "Repentance", "Missions", "Regeneration"]
  },
  {
    id: "martyn-lloyd-jones",
    slug: "martyn-lloyd-jones",
    name: "Dr. Martyn Lloyd-Jones",
    title: "Physician & Expositor",
    ministry: "Westminster Chapel, London",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    bio: "Celebrated 20th-century Welsh physician and preacher whose verse-by-verse expositions through Romans and Ephesians set the standard for expository preaching.",
    era: "1899\u20131981",
    sermonCount: 1600,
    topTopics: ["Romans", "Ephesians", "Doctrinal Exegesis", "Spiritual Warfare"]
  },
  {
    id: "paris-reidhead",
    slug: "paris-reidhead",
    name: "Paris Reidhead",
    title: "Missionary Statesman",
    ministry: "Bethany Fellowship Collection",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    bio: 'Missionary to Africa whose landmark 1965 sermon "Ten Shekels and a Shirt" exposed the fatal dangers of man-centered, utilitarian religion.',
    era: "1919\u20131992",
    sermonCount: 180,
    topTopics: ["The Glory of God", "Surrender", "Missions", "Holy Living"]
  },
  {
    id: "david-wilkerson",
    slug: "david-wilkerson",
    name: "David Wilkerson",
    title: "Pastor & Evangelist",
    ministry: "Times Square Church / Teen Challenge",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    bio: 'Author of "The Cross and the Switchblade" and founder of Times Square Church in New York City, known for solemn prophetic calls to repentance and weeping for the nation.',
    era: "1931\u20132011",
    sermonCount: 780,
    topTopics: ["Repentance", "End Times", "Prayer", "Brokenness"]
  },
  {
    id: "carter-conlon",
    slug: "carter-conlon",
    name: "Carter Conlon",
    title: "General Overseer",
    ministry: "Times Square Church, New York City",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    bio: 'Senior pastor known for urgent messages including "Run for Your Life" calling the body of Christ to prayer, courage, and unconditional trust in God.',
    era: "Contemporary",
    sermonCount: 450,
    topTopics: ["Prayer", "Courage", "Times of Crisis", "Hope"]
  },
  {
    id: "jonathan-edwards",
    slug: "jonathan-edwards",
    name: "Jonathan Edwards",
    title: "Great Awakening Theologian",
    ministry: "Northampton / Colonial Heritage",
    avatarUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80",
    bio: `Central figure of the First Great Awakening, known for "Sinners in the Hands of an Angry God" and deep treaties on the religious affections and God's glory.`,
    era: "1703\u20131758",
    sermonCount: 950,
    topTopics: ["Sovereignty of God", "Revival", "Affections", "Judgment"]
  },
  {
    id: "zac-poonen",
    slug: "zac-poonen",
    name: "Zac Poonen",
    title: "Bible Teacher & Elder",
    ministry: "Christian Fellowship Church, India",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    bio: "Former Indian Naval Officer who has ministered across India for over 50 years, renowned for verse-by-verse surveys through all 66 books of the Bible.",
    era: "Contemporary",
    sermonCount: 1200,
    topTopics: ["Through the Bible", "New Covenant", "Humility", "Discipleship"]
  },
  {
    id: "corrie-ten-boom",
    slug: "corrie-ten-boom",
    name: "Corrie ten Boom",
    title: "Holocaust Survivor & Evangelist",
    ministry: "The Hiding Place Legacy",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    bio: `Dutch Christian who helped many Jewish families escape the Nazi Holocaust and survived Ravensbr\xFCck, testifying globally that "there is no pit so deep that God's love is not deeper still."`,
    era: "1892\u20131983",
    sermonCount: 120,
    topTopics: ["Forgiveness", "Faith in Suffering", "Trust", "Love of God"]
  },
  {
    id: "george-whitefield",
    slug: "george-whitefield",
    name: "George Whitefield",
    title: "Great Awakening Evangelist",
    ministry: "Historic British & American Revival",
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
    bio: "Open-air evangelist who preached over 18,000 sermons to millions across Britain and the American colonies, sparking the transatlantic Great Awakening.",
    era: "1714\u20131770",
    sermonCount: 800,
    topTopics: ["New Birth", "Reconciliation", "Christ the Righteousness", "Gospel"]
  }
];
var SERMONINDEX_TOPICS_CATALOG = [
  { name: "Prayer & Intercession", slug: "prayer", description: "Secret place, persevering prayer, and standing in the gap" },
  { name: "Revival & Awakening", slug: "revival", description: "Holy Spirit outpouring, reformation, and spiritual renewal" },
  { name: "The Holiness of God", slug: "holiness", description: "Sanctification, purity of heart, and walking in the fear of the Lord" },
  { name: "Grace & Justification", slug: "grace", description: "Unmerited divine favor and righteousness imputed through faith" },
  { name: "The Cross of Christ", slug: "cross", description: "Atonement, the blood of Jesus, and crucified with Christ" },
  { name: "True Repentance", slug: "repentance", description: "Turning from sin unto the living God with a broken and contrite spirit" },
  { name: "The Holy Spirit", slug: "holy-spirit", description: "Power for witness, gifts, guidance, and spiritual communion" },
  { name: "Faith & Trust", slug: "faith", description: "Unwavering reliance on God's promises through life's storms" },
  { name: "Spiritual Warfare", slug: "spiritual-warfare", description: "The Armor of God, resisting the enemy, and victory in Jesus" },
  { name: "The Love of God (Agape)", slug: "love", description: "God's unconditional covenant love revealed at Calvary" },
  { name: "Discipleship & Surrender", slug: "discipleship", description: "Counting the cost, taking up the cross, and following Jesus daily" },
  { name: "Sovereignty & Providence", slug: "sovereignty-of-god", description: "God's supreme rule over all creation, history, and salvation" },
  { name: "Suffering & Comfort", slug: "suffering", description: "Finding peace, strength, and eternal hope in times of affliction" },
  { name: "Missions & Evangelism", slug: "missions", description: "Taking the Gospel of the Kingdom to all unreached nations" },
  { name: "The Second Coming of Christ", slug: "second-coming", description: "The blessed hope, eternal judgment, and the New Jerusalem" }
];
var SERMONINDEX_CURATED_ARCHIVE = [
  {
    id: "si-washer-shocking-youth-video",
    title: "The Shocking Message (Full HD Video Exposition)",
    speaker: "Paul Washer",
    speakerSlug: "paul-washer",
    speakerTitle: "HeartCry Missionary Society",
    speakerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    summary: "An uncompromising biblical exposition of Matthew 7:13-27 on true conversion, the narrow gate, and repentance that shook Montgomery, Alabama.",
    duration: "1:05:42",
    durationSeconds: 3942,
    mediaType: "video",
    youtubeId: "uuabITeO4l8",
    mediaUrl: "",
    mp4Url: "",
    mp3Url: "https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg",
    url: "https://www.youtube.com/watch?v=cncEb_7d7q0",
    topics: [{ name: "Gospel", slug: "gospel" }, { name: "Regeneration", slug: "regeneration" }],
    scriptureRef: "Matthew 7:13-27",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-ravenhill-judgment-seat",
    title: "The Judgment Seat of Christ (Audio Exposition)",
    speaker: "Leonard Ravenhill",
    speakerSlug: "leonard-ravenhill",
    speakerTitle: "Revivalist & Author",
    speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    summary: "A solemn, urgent message on eternity and standing before the throne of God to give an account.",
    duration: "48:30",
    durationSeconds: 2910,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Judgment", slug: "judgment" }, { name: "Revival", slug: "revival" }],
    scriptureRef: "2 Corinthians 5:10",
    thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-tozer-holiness-god",
    title: "The Holiness of God (Audio Classic)",
    speaker: "A.W. Tozer",
    speakerSlug: "aw-tozer",
    speakerTitle: "Alliance Witness & Pastor",
    speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    summary: "A profound message on the transcendent majesty, moral perfection, and pure holiness of Almighty God.",
    duration: "41:15",
    durationSeconds: 2475,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Worship", slug: "worship" }],
    scriptureRef: "Isaiah 6:1-5",
    thumbnailUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-sproul-trauma-holiness",
    title: "The Trauma of God's Holiness (Full Video Lecture)",
    speaker: "Dr. R.C. Sproul",
    speakerSlug: "r-c-sproul",
    speakerTitle: "Ligonier Ministries",
    speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    summary: "Dr. R.C. Sproul expounds on Isaiah 6, the holiness of the Lord, and man's total unraveling before the Almighty.",
    duration: "38:15",
    durationSeconds: 2295,
    mediaType: "video",
    youtubeId: "1d32g8E8hR8",
    mediaUrl: "",
    mp4Url: "",
    url: "https://www.youtube.com/watch?v=v4oQ1V1_z4Y",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Atonement", slug: "atonement" }],
    scriptureRef: "Isaiah 6:1-8",
    thumbnailUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-spurgeon-free-grace",
    title: "Free Grace & Sovereignty (Audio Master)",
    speaker: "Charles H. Spurgeon",
    speakerSlug: "charles-spurgeon",
    speakerTitle: "Metropolitan Tabernacle",
    speakerImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    summary: "Spurgeon's celebrated discourse on the matching glory of sovereign grace in Jesus Christ.",
    duration: "52:20",
    durationSeconds: 3140,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Grace", slug: "grace" }, { name: "Sovereignty", slug: "sovereignty" }],
    scriptureRef: "Romans 9:15-16",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  }
];
var SermonIndexService = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
    // 24 hours
    this.BASE_URL = "https://api.sermonindex.net/v2";
  }
  getCached(key) {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL_MS) {
      return entry.data;
    }
    return null;
  }
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  /**
   * Fetch sermons preached on a specific scripture passage
   * e.g., book: "John" or "JHN", chapter: 3, verse: 16
   */
  async getSermonsByScripture(book, chapter, verse) {
    const bookCode = BIBLE_BOOK_TO_CODE[book] || (book.length === 3 ? book.toUpperCase() : "JHN");
    const ch = String(chapter);
    const vr = verse ? String(verse).split("-")[0] : "";
    const cacheKey = `scripture_${bookCode}_${ch}_${vr}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const url = vr ? `${this.BASE_URL}/scripture/${bookCode}/${ch}/${vr}` : `${this.BASE_URL}/scripture/${bookCode}/${ch}`;
    try {
      const res = await fetch(`${url}.json`, {
        headers: { "Accept": "application/json", "User-Agent": "KingJamesAIStudio/2.0" },
        signal: AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.sermons || data.results || [data];
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API scripture lookup failed for ${bookCode} ${ch}:${vr}, using curated fallback:`, err);
    }
    const curatedMatches = SERMONINDEX_CURATED_ARCHIVE.filter((item) => {
      if (!item.scripture) return false;
      return item.scripture.some(
        (s) => s.bookId.toUpperCase() === bookCode.toUpperCase() && String(s.chapter) === ch && (!vr || !s.verse || String(s.verse) === vr)
      );
    });
    if (curatedMatches.length > 0) {
      return curatedMatches;
    }
    return SERMONINDEX_CURATED_ARCHIVE.slice(0, 4);
  }
  /**
   * Fetch sermons by topic/category
   * e.g., topic: "prayer", "revival", "holiness", "grace"
   */
  async getSermonsByTopic(topicSlug) {
    const slug = topicSlug.toLowerCase().trim().replace(/\s+/g, "-");
    const cacheKey = `topic_${slug}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    try {
      const res = await fetch(`${this.BASE_URL}/topics/${slug}.json`, {
        headers: { "Accept": "application/json", "User-Agent": "KingJamesAIStudio/2.0" },
        signal: AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.sermons || data.results || [];
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API topic lookup failed for topic ${slug}, using curated fallback:`, err);
    }
    const curated = SERMONINDEX_CURATED_ARCHIVE.filter(
      (s) => s.topics?.some((t) => t.slug.includes(slug) || slug.includes(t.slug))
    );
    return curated.length > 0 ? curated : SERMONINDEX_CURATED_ARCHIVE;
  }
  /**
   * Fetch sermons by speaker slug
   * e.g., "leonard-ravenhill", "paul-washer", "charles-spurgeon"
   */
  async getSermonsBySpeaker(speakerSlug) {
    const slug = speakerSlug.toLowerCase().trim();
    const cacheKey = `speaker_${slug}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    try {
      const res = await fetch(`${this.BASE_URL}/speakers/${slug}.json`, {
        headers: { "Accept": "application/json", "User-Agent": "KingJamesAIStudio/2.0" },
        signal: AbortSignal.timeout(6e3)
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.sermons || data.results || [];
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API speaker lookup failed for ${slug}, using curated fallback:`, err);
    }
    const curated = SERMONINDEX_CURATED_ARCHIVE.filter(
      (s) => s.speakerSlug === slug || s.speaker.toLowerCase().replace(/[^a-z]/g, "").includes(slug.replace(/[^a-z]/g, ""))
    );
    return curated.length > 0 ? curated : SERMONINDEX_CURATED_ARCHIVE;
  }
  /**
   * Search feed with filtering across topics, speakers, scriptures, and search queries
   */
  async searchFeed(options) {
    const { q, topic, speaker, scripture } = options;
    if (scripture) {
      const parts = scripture.trim().split(/\s+/);
      const book = parts.slice(0, -1).join(" ") || parts[0];
      const ref = parts[parts.length - 1] || "1:1";
      const [chapter, verse] = ref.split(":");
      if (chapter) {
        return this.getSermonsByScripture(book, chapter, verse);
      }
    }
    if (speaker && speaker !== "all") {
      const speakerObj = SERMONINDEX_SPEAKERS_CATALOG.find(
        (s) => s.id === speaker || s.slug === speaker || s.name.toLowerCase() === speaker.toLowerCase()
      );
      const slug = speakerObj ? speakerObj.slug : speaker.toLowerCase().replace(/\s+/g, "-");
      const results = await this.getSermonsBySpeaker(slug);
      if (results.length > 0) return results;
    }
    if (topic && topic !== "All Topics" && topic !== "all") {
      const topicObj = SERMONINDEX_TOPICS_CATALOG.find(
        (t) => t.name.toLowerCase() === topic.toLowerCase() || t.slug.toLowerCase() === topic.toLowerCase()
      );
      const slug = topicObj ? topicObj.slug : topic.toLowerCase().replace(/\s+/g, "-");
      const results = await this.getSermonsByTopic(slug);
      if (results.length > 0) return results;
    }
    let items = [...SERMONINDEX_CURATED_ARCHIVE];
    if (q) {
      const term = q.toLowerCase();
      items = items.filter(
        (s) => s.title.toLowerCase().includes(term) || s.speaker.toLowerCase().includes(term) || s.summary?.toLowerCase().includes(term) || s.topics?.some((t) => t.name.toLowerCase().includes(term)) || s.scripture?.some((sc) => `${sc.bookId} ${sc.chapter}:${sc.verse || ""}`.toLowerCase().includes(term))
      );
    }
    return items;
  }
  getSpeakers() {
    return SERMONINDEX_SPEAKERS_CATALOG;
  }
  getTopics() {
    return SERMONINDEX_TOPICS_CATALOG;
  }
  _normalizeItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const id = item.id || `si-${Math.random().toString(36).substring(2, 9)}`;
      const durationSeconds = this._parseDurationSeconds(item.duration);
      const isVideo = item.mediaType === "video" || Boolean(item.youtubeId) || Boolean(item.mp4Url) || Boolean(item.videoUrl) || typeof item.mediaUrl === "string" && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.mediaUrl) || typeof item.url === "string" && (item.url.includes("youtube") || item.url.includes("youtu.be"));
      const youtubeId = item.youtubeId || (typeof item.mediaUrl === "string" && item.mediaUrl.includes("youtu") ? this._extractYoutubeId(item.mediaUrl) : void 0);
      const mp4Url = item.mp4Url || (typeof item.mediaUrl === "string" && /\.(mp4|webm|mov)(\?.*)?$/i.test(item.mediaUrl) ? item.mediaUrl : void 0);
      return {
        id,
        title: item.title || "Untitled Sermon",
        speaker: item.speaker || "Preacher",
        speakerSlug: item.speakerSlug || item.speaker?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        speakerTitle: item.speakerTitle || item.title_role,
        speakerImage: item.speakerImage || item.portraitUrl || item.thumbnailUrl || "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
        summary: item.summary || item.description || "",
        duration: typeof item.duration === "string" ? item.duration : "45:00",
        durationSeconds,
        mediaType: isVideo ? "video" : "audio",
        mediaUrl: item.mediaUrl,
        mp4Url,
        videoUrl: item.videoUrl || mp4Url,
        youtubeId,
        mp3Url: item.cdnMp3Url || item.mp3Url || (isVideo ? void 0 : `https://archive.org/download/SERMONINDEX_${id}/${id}.mp3`),
        cdnMp3Url: item.cdnMp3Url || item.mp3Url,
        vttUrl: item.vttUrl,
        url: item.url || `https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=${id}`,
        topics: Array.isArray(item.topics) ? item.topics : [{ name: "Sermon", slug: "sermon" }],
        scripture: Array.isArray(item.scripture) ? item.scripture : [],
        scriptureRef: item.scriptureRef || (Array.isArray(item.scripture) && item.scripture.length > 0 ? `${item.scripture[0].bookId} ${item.scripture[0].chapter}:${item.scripture[0].verse || ""}`.trim() : void 0),
        outline: item.outline,
        keyQuotes: item.keyQuotes
      };
    });
  }
  _extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : void 0;
  }
  _parseDurationSeconds(duration) {
    if (typeof duration === "number") return duration;
    if (typeof duration === "string") {
      const parts = duration.split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return 2700;
  }
};
var sermonIndexService = new SermonIndexService();

// routes/bible.ts
var router = (0, import_express.Router)();
var kjvLoader2 = new kjv_loader_default();
kjvLoader2.load();
var uploadDir = import_path3.default.join(process.cwd(), "public", "uploads", "sermons");
if (!import_fs3.default.existsSync(uploadDir)) import_fs3.default.mkdirSync(uploadDir, { recursive: true });
var storage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = import_path3.default.extname(file.originalname) || ".webm";
    cb(null, `sermon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
var upload = (0, import_multer.default)({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
function createBibleRoutes(db2) {
  const kingJamesService = new KingJamesService(db2);
  router.post("/onboard", (req, res) => {
    const { userGoals, userInterests } = req.body;
    try {
      const onboardingResponse = kingJamesService.onboard(userGoals, userInterests);
      res.json(onboardingResponse);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate onboarding response" });
    }
  });
  router.post("/share", (req, res) => {
    const { verseRef, passageText, takeaway } = req.body;
    if (!verseRef || !passageText || !takeaway) {
      return res.status(400).json({ error: "Missing verseRef, passageText, or takeaway" });
    }
    try {
      const sharePayload = kingJamesService.formatSharePayload(verseRef, passageText, takeaway);
      res.json(sharePayload);
    } catch (error) {
      res.status(500).json({ error: "Failed to format share payload" });
    }
  });
  router.get("/verse", async (req, res) => {
    const { book, chapter, verse } = req.query;
    if (!book || !chapter || !verse) {
      return res.status(400).json({ error: "Missing book, chapter, or verse parameter" });
    }
    try {
      const verseData = await kjvLoader2.getOrFetchVerse(
        book,
        chapter,
        verse
      );
      res.json(verseData);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve verse" });
    }
  });
  router.get("/chapter", async (req, res) => {
    const { book, chapter } = req.query;
    if (!book || !chapter) {
      return res.status(400).json({ error: "Missing book or chapter parameter" });
    }
    try {
      const chapterData = await kjvLoader2.getOrFetchChapter(
        book,
        chapter
      );
      res.json(chapterData);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve chapter" });
    }
  });
  router.get("/search", (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json([]);
    }
    try {
      const results = kjvLoader2.search(q);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });
  router.get("/study", async (req, res) => {
    const { book, chapter, verse } = req.query;
    const bookStr = book || "Genesis";
    const chapterStr = chapter || "1";
    const verseStr = verse || "1";
    try {
      const breakdown = await kingJamesService.generateStudyBreakdown(
        bookStr,
        chapterStr,
        verseStr
      );
      res.json(breakdown);
    } catch (error) {
      console.error("Error generating study breakdown:", error);
      res.json({
        passageText: `"${bookStr} ${chapterStr}:${verseStr}" \u2014 King James Version`,
        bookSummary: {
          author: "Biblical Author",
          era: "Ancient Antiquity",
          audience: "God's Covenant People"
        },
        historicalContext: {
          mindsetThen: "The original audience lived with deep reverence for God's revealed covenant.",
          originalIssue: `Spiritual encouragement and divine instruction in ${bookStr} ${chapterStr}:${verseStr}.`
        },
        thenVsNow: {
          then: "Believers rested in God's promises amid adversity.",
          now: "We apply the eternal truth of Christ to modern life challenges."
        },
        dailyApplication: [
          "Meditate on this scripture throughout your day.",
          "Bring your prayers and concerns to the Lord with thanksgiving.",
          "Share God's Word and love with someone in need."
        ],
        prayer: `Lord, grant me wisdom to understand and live out the truth of ${bookStr} ${chapterStr}:${verseStr}. Amen.`
      });
    }
  });
  router.get("/courses", (_req, res) => {
    try {
      res.json(db2.getAllCourses());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });
  router.post("/courses", (req, res) => {
    const { title, description, coverImage, category, level } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    try {
      const course = db2.createCourse(title, description, coverImage, category, level);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to create course" });
    }
  });
  router.put("/courses/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, coverImage, category, level } = req.body;
    try {
      const updated = db2.updateCourse(id, { title, description, coverImage, category, level });
      if (!updated) return res.status(404).json({ error: "Course not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });
  router.delete("/courses/:id", (req, res) => {
    try {
      const deleted = db2.deleteCourse(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Course not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });
  router.get("/courses/:id/lessons", (req, res) => {
    const { id } = req.params;
    try {
      const course = db2.getCourse(id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      const lessons = db2.getLessonsByCourse(id);
      res.json({ course, lessons });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });
  router.post("/courses/:id/lessons", (req, res) => {
    const { id } = req.params;
    const { title, scriptureRef, notes, mediaType, mediaUrl } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    try {
      const course = db2.getCourse(id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      const lesson = db2.createLesson(id, title, void 0, scriptureRef, void 0, mediaType, mediaUrl, notes);
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });
  router.delete("/lessons/:id", (req, res) => {
    try {
      const deleted = db2.deleteLesson(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Lesson not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });
  router.post("/ask", async (req, res) => {
    const { question, history, mode } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    try {
      const response = await Promise.race([
        kingJamesService.answerQuestion(question, history, mode),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15e3))
      ]);
      if (!response) {
        throw new Error("No response generated");
      }
      res.json(response);
    } catch (error) {
      console.warn("KingJamesService error, using direct robust fallback:", error);
      res.json({
        answer: `### Biblical Reflection Regarding: "${question}"

*"Thy word is a lamp unto my feet, and a light unto my path."* (Psalm 119:105)

God's holy Word speaks with living power to this inquiry. In 2 Timothy 3:16-17, the scriptures are given for our doctrine, reproof, correction, and instruction in righteousness. Continue steadfast in prayer and meditation on the King James Bible, trusting the Holy Spirit to grant thee deeper discernment and wisdom.`,
        versesCited: ["Psalm 119:105", "2 Timothy 3:16-17"],
        suggestedQuestions: [
          "What are key scripture cross-references for this topic?",
          "What is the original Greek or Hebrew background?",
          "How can this be applied to daily Christian walk?"
        ]
      });
    }
  });
  router.post("/audio", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required for audio synthesis" });
      }
      const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
      const ai = new GoogleGenAI2({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const cleanText = text.replace(/###|##|\*|_|\[Suggested Questions\][\s\S]*$/g, "").slice(0, 1200);
      const prompt = `Read the following biblical insight with a warm, dignified, and majestic scholarly voice, as King James: ${cleanText}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" }
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audioData: base64Audio });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (err) {
      console.error("Bible audio synthesis error:", err);
      res.status(500).json({ error: err.message || "Error generating audio" });
    }
  });
  router.post("/media/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const { title, speaker, series, scriptureRef, description, duration, thumbnailUrl } = req.body;
      const mediaUrl = `/uploads/sermons/${req.file.filename}`;
      const ext = import_path3.default.extname(req.file.originalname).toLowerCase();
      const mediaType = [".mp3", ".m4a", ".wav"].includes(ext) ? "audio" : "video";
      const sermon = db2.createSermon(
        title || req.file.originalname.replace(/\.[^/.]+$/, ""),
        speaker || void 0,
        series || void 0,
        scriptureRef || void 0,
        description || void 0,
        mediaType,
        mediaUrl,
        duration ? parseInt(duration, 10) : void 0,
        (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        thumbnailUrl || void 0
      );
      res.status(201).json({ sermon, mediaUrl });
    } catch (error) {
      console.error("Failed to upload media:", error);
      res.status(500).json({ error: "Failed to upload media" });
    }
  });
  router.get("/sermons", (req, res) => {
    const { speaker, scripture, series } = req.query;
    try {
      let sermons;
      if (speaker) {
        sermons = db2.getSermonsBySpeaker(speaker);
      } else if (scripture) {
        sermons = db2.getSermonsByScripture(scripture);
      } else if (series) {
        sermons = db2.getSermonsBySeries(series);
      } else {
        sermons = db2.getAllSermons();
      }
      res.json(sermons || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sermons" });
    }
  });
  router.post("/sermons", (req, res) => {
    const { title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    try {
      const sermon = db2.createSermon(
        title,
        speaker,
        series,
        scriptureRef,
        description,
        mediaType || "video",
        mediaUrl || "",
        duration,
        dateRecorded || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      );
      res.status(201).json(sermon);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sermon" });
    }
  });
  router.put("/sermons/:id", (req, res) => {
    try {
      const updated = db2.updateSermon(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Sermon not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sermon" });
    }
  });
  router.delete("/sermons/:id", (req, res) => {
    try {
      const existing = db2.getSermonById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Sermon not found" });
      if (existing.mediaUrl && existing.mediaUrl.startsWith("/uploads/sermons/")) {
        const filePath = import_path3.default.join(process.cwd(), "public", existing.mediaUrl);
        if (import_fs3.default.existsSync(filePath)) {
          try {
            import_fs3.default.unlinkSync(filePath);
          } catch (e) {
            console.warn("Failed to delete file from disk:", e);
          }
        }
      }
      const success = db2.deleteSermon(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sermon" });
    }
  });
  router.post("/sermons/:id/push-to-course", (req, res) => {
    const { courseId, lessonTitle } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId is required" });
    try {
      const sermon = db2.getSermonById(req.params.id);
      if (!sermon) return res.status(404).json({ error: "Sermon not found" });
      const lesson = db2.createLesson(
        courseId,
        lessonTitle || sermon.title,
        sermon.description || "",
        sermon.scriptureRef || "",
        void 0,
        "upload",
        sermon.mediaUrl || "",
        sermon.speaker ? `Speaker: ${sermon.speaker}` : void 0
      );
      db2.updateSermon(sermon.id, { courseLessonId: lesson.id });
      res.status(201).json({ success: true, lesson });
    } catch (error) {
      res.status(500).json({ error: "Failed to push sermon to course" });
    }
  });
  router.get("/sermonindex/speakers", (_req, res) => {
    try {
      res.json(sermonIndexService.getSpeakers());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SermonIndex speakers" });
    }
  });
  router.get("/sermonindex/topics", (_req, res) => {
    try {
      res.json(sermonIndexService.getTopics());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SermonIndex topics" });
    }
  });
  router.get("/sermonindex/scripture/:book/:chapter/:verse?", async (req, res) => {
    try {
      const { book, chapter, verse } = req.params;
      const sermons = await sermonIndexService.getSermonsByScripture(book, chapter, verse);
      res.json(sermons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sermons by scripture" });
    }
  });
  router.get("/sermonindex/speaker/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const sermons = await sermonIndexService.getSermonsBySpeaker(slug);
      res.json(sermons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sermons by speaker" });
    }
  });
  router.get("/sermonindex/topic/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const sermons = await sermonIndexService.getSermonsByTopic(slug);
      res.json(sermons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sermons by topic" });
    }
  });
  router.get("/sermonindex/feed", async (req, res) => {
    try {
      const { q, topic, speaker, scripture } = req.query;
      const items = await sermonIndexService.searchFeed({
        q: typeof q === "string" ? q : void 0,
        topic: typeof topic === "string" ? topic : void 0,
        speaker: typeof speaker === "string" ? speaker : void 0,
        scripture: typeof scripture === "string" ? scripture : void 0
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to query SermonIndex feed" });
    }
  });
  router.get("/sermonaudio/speakers", (_req, res) => {
    try {
      res.json(sermonIndexService.getSpeakers());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch speakers" });
    }
  });
  router.get("/sermonaudio/feed", async (req, res) => {
    const { speaker, category, q } = req.query;
    try {
      const items = await sermonIndexService.searchFeed({
        q: typeof q === "string" ? q : void 0,
        topic: typeof category === "string" ? category : void 0,
        speaker: typeof speaker === "string" ? speaker : void 0
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to query feed" });
    }
  });
  return router;
}

// data/bible/models.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_crypto = require("crypto");
var BibleStudyDB = class {
  constructor(dbPath) {
    this.db = new import_better_sqlite3.default(dbPath);
    this.db.pragma("journal_mode = WAL");
  }
  // Course operations
  createCourse(title, description, coverImage, category, level) {
    const id = (0, import_crypto.randomUUID)();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT INTO courses (id, title, description, coverImage, category, level, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, title, description || null, coverImage || null, category || null, level || null, now, now);
    return { id, title, description, coverImage, category, level, createdAt: now, updatedAt: now };
  }
  getCourse(id) {
    const stmt = this.db.prepare("SELECT * FROM courses WHERE id = ?");
    return stmt.get(id);
  }
  getAllCourses() {
    const stmt = this.db.prepare("SELECT * FROM courses ORDER BY createdAt DESC");
    return stmt.all();
  }
  // Lesson operations
  createLesson(courseId, title, content, scriptureRef, quizJson, mediaType, mediaUrl, notes) {
    const id = (0, import_crypto.randomUUID)();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT INTO lessons (id, courseId, title, content, scriptureRef, quizJson, mediaType, mediaUrl, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, courseId, title, content || null, scriptureRef || null, quizJson || null, mediaType || null, mediaUrl || null, notes || null, now, now);
    return { id, courseId, title, content, scriptureRef, quizJson, mediaType, mediaUrl, notes, createdAt: now, updatedAt: now };
  }
  getLessonsByCourse(courseId) {
    const stmt = this.db.prepare("SELECT * FROM lessons WHERE courseId = ? ORDER BY order_index ASC");
    return stmt.all(courseId);
  }
  getLesson(id) {
    const stmt = this.db.prepare("SELECT * FROM lessons WHERE id = ?");
    return stmt.get(id);
  }
  deleteLesson(id) {
    const result = this.db.prepare("DELETE FROM lessons WHERE id = ?").run(id);
    return result.changes > 0;
  }
  updateCourse(id, updates) {
    const course = this.getCourse(id);
    if (!course) return null;
    const title = updates.title !== void 0 ? updates.title : course.title;
    const description = updates.description !== void 0 ? updates.description : course.description;
    const coverImage = updates.coverImage !== void 0 ? updates.coverImage : course.coverImage;
    const category = updates.category !== void 0 ? updates.category : course.category;
    const level = updates.level !== void 0 ? updates.level : course.level;
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE courses
      SET title = ?, description = ?, coverImage = ?, category = ?, level = ?, updatedAt = ?
      WHERE id = ?
    `).run(title, description, coverImage, category, level, updatedAt, id);
    return this.getCourse(id);
  }
  deleteCourse(id) {
    this.db.prepare("DELETE FROM lessons WHERE courseId = ?").run(id);
    const result = this.db.prepare("DELETE FROM courses WHERE id = ?").run(id);
    return result.changes > 0;
  }
  // User Progress operations
  createUserProgress(userId, completedLessons = "[]", notes) {
    const id = (0, import_crypto.randomUUID)();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT INTO user_progress (id, userId, completedLessons, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, userId, completedLessons, notes || null, now, now);
    return { id, userId, completedLessons, notes, createdAt: now, updatedAt: now };
  }
  getUserProgress(userId) {
    const stmt = this.db.prepare("SELECT * FROM user_progress WHERE userId = ?");
    return stmt.get(userId);
  }
  updateUserProgress(userId, completedLessons, notes) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "UPDATE user_progress SET completedLessons = ?, notes = ?, updatedAt = ? WHERE userId = ?"
    );
    stmt.run(completedLessons, notes || null, now, userId);
  }
  // Verse Commentary Cache operations
  cacheCommentary(verseRef, commentaryJson, expiresAt) {
    const id = (0, import_crypto.randomUUID)();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT OR REPLACE INTO verse_commentary_cache (id, verseRef, commentaryJson, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, verseRef, commentaryJson, now, expiresAt || null);
    return { id, verseRef, commentaryJson, createdAt: now, expiresAt };
  }
  getCommentary(verseRef) {
    const stmt = this.db.prepare("SELECT * FROM verse_commentary_cache WHERE verseRef = ?");
    const result = stmt.get(verseRef);
    if (result && result.expiresAt && new Date(result.expiresAt) < /* @__PURE__ */ new Date()) {
      this.db.prepare("DELETE FROM verse_commentary_cache WHERE verseRef = ?").run(verseRef);
      return null;
    }
    return result;
  }
  close() {
    this.db.close();
  }
  // Sermon operations
  createSermon(title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded, thumbnailUrl) {
    const id = (0, import_crypto.randomUUID)();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT INTO sermons_podcasts (id, title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded, thumbnailUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, title, speaker || null, series || null, scriptureRef || null, description || null, mediaType || null, mediaUrl || null, duration || null, dateRecorded || null, thumbnailUrl || null, now, now);
    return { id, title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded, thumbnailUrl, createdAt: now, updatedAt: now };
  }
  getAllSermons() {
    const stmt = this.db.prepare("SELECT * FROM sermons_podcasts ORDER BY dateRecorded DESC, createdAt DESC");
    return stmt.all();
  }
  getSermonsByScripture(scriptureRef) {
    const stmt = this.db.prepare("SELECT * FROM sermons_podcasts WHERE scriptureRef LIKE ? ORDER BY dateRecorded DESC");
    return stmt.all(`%${scriptureRef}%`);
  }
  getSermonsBySpeaker(speaker) {
    const stmt = this.db.prepare("SELECT * FROM sermons_podcasts WHERE speaker LIKE ? ORDER BY dateRecorded DESC");
    return stmt.all(`%${speaker}%`);
  }
  getSermonsBySeries(series) {
    const stmt = this.db.prepare("SELECT * FROM sermons_podcasts WHERE series LIKE ? ORDER BY dateRecorded DESC");
    return stmt.all(`%${series}%`);
  }
  getSermonById(id) {
    const stmt = this.db.prepare("SELECT * FROM sermons_podcasts WHERE id = ?");
    return stmt.get(id);
  }
  updateSermon(id, updates) {
    const existing = this.getSermonById(id);
    if (!existing) return null;
    const title = updates.title !== void 0 ? updates.title : existing.title;
    const speaker = updates.speaker !== void 0 ? updates.speaker : existing.speaker;
    const series = updates.series !== void 0 ? updates.series : existing.series;
    const scriptureRef = updates.scriptureRef !== void 0 ? updates.scriptureRef : existing.scriptureRef;
    const description = updates.description !== void 0 ? updates.description : existing.description;
    const mediaType = updates.mediaType !== void 0 ? updates.mediaType : existing.mediaType;
    const mediaUrl = updates.mediaUrl !== void 0 ? updates.mediaUrl : existing.mediaUrl;
    const duration = updates.duration !== void 0 ? updates.duration : existing.duration;
    const dateRecorded = updates.dateRecorded !== void 0 ? updates.dateRecorded : existing.dateRecorded;
    const courseLessonId = updates.courseLessonId !== void 0 ? updates.courseLessonId : existing.courseLessonId;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "UPDATE sermons_podcasts SET title = ?, speaker = ?, series = ?, scriptureRef = ?, description = ?, mediaType = ?, mediaUrl = ?, duration = ?, dateRecorded = ?, courseLessonId = ?, updatedAt = ? WHERE id = ?"
    );
    stmt.run(title, speaker || null, series || null, scriptureRef || null, description || null, mediaType || null, mediaUrl || null, duration || null, dateRecorded || null, courseLessonId || null, now, id);
    return this.getSermonById(id);
  }
  deleteSermon(id) {
    const result = this.db.prepare("DELETE FROM sermons_podcasts WHERE id = ?").run(id);
    return result.changes > 0;
  }
};

// data/bible/init.ts
var import_better_sqlite32 = __toESM(require("better-sqlite3"), 1);
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);

// data/bible/seed.ts
function seedBibleCourses(db2) {
  const existingCourses = db2.getAllCourses();
  if (existingCourses.length > 0) {
    return;
  }
  const course1 = db2.createCourse(
    "Foundations of Faith",
    "Explore the core truths of Christian faith through Scripture"
  );
  db2.createLesson(
    course1.id,
    "The Word Became Flesh",
    "Understanding the incarnation and divinity of Christ",
    "John 1:1",
    JSON.stringify({ questions: ["What does it mean that the Word was God?", "How does this shape your faith?"] })
  );
  db2.createLesson(
    course1.id,
    "Faith Defined",
    "What is faith and why does it matter?",
    "Hebrews 11:1",
    JSON.stringify({ questions: ["How do you define faith?", "What role does faith play in your life?"] })
  );
  const course2 = db2.createCourse(
    "Walking in Wisdom",
    "Practical wisdom for daily living from Scripture"
  );
  db2.createLesson(
    course2.id,
    "Trust and Lean Not",
    "Trusting God with your whole heart",
    "Proverbs 3:5-6",
    JSON.stringify({ questions: ["What does it mean to trust with your whole heart?", "How can you apply this today?"] })
  );
  db2.createLesson(
    course2.id,
    "Asking for Wisdom",
    "How to seek and receive wisdom from God",
    "James 1:5",
    JSON.stringify({ questions: ["When have you needed wisdom?", "How do you ask God for guidance?"] })
  );
  const course3 = db2.createCourse(
    "Grace & Community",
    "Living out grace and building authentic Christian community"
  );
  db2.createLesson(
    course3.id,
    "No Favoritism",
    "Treating all people with equal dignity and respect",
    "James 2:1-4",
    JSON.stringify({ questions: ["How do you show favoritism?", "What would it look like to treat everyone equally?"] })
  );
  db2.createLesson(
    course3.id,
    "Love Without Hypocrisy",
    "Genuine love and community in action",
    "Romans 12:9-13",
    JSON.stringify({ questions: ["What does genuine love look like?", "How can you build community?"] })
  );
}

// data/bible/init.ts
function initializeBibleDB(dbPath) {
  const db2 = new import_better_sqlite32.default(dbPath);
  const schemaPath = import_path4.default.join(process.cwd(), "data", "bible", "schema.sql");
  const schema = import_fs4.default.readFileSync(schemaPath, "utf-8");
  db2.exec(schema);
  const bibleDB = new BibleStudyDB(dbPath);
  seedBibleCourses(bibleDB);
  return db2;
}

// routes/auth.ts
var import_express2 = require("express");
function createAuthRoutes(authService) {
  const router2 = (0, import_express2.Router)();
  router2.post("/register", async (req, res) => {
    const rawEmail = req.body.email;
    const rawUsername = req.body.username || req.body.handle;
    const rawDisplayName = req.body.displayName || req.body.name;
    const rawPassword = req.body.password || "TemporaryPassword123!";
    const avatarUrl = req.body.avatarUrl;
    const bio = req.body.bio;
    if (!rawEmail || !rawUsername) {
      return res.status(400).json({ error: "Email and username/handle are required" });
    }
    const email = rawEmail.trim().toLowerCase();
    const username = rawUsername.replace("@", "").trim().toLowerCase();
    const displayName = rawDisplayName || username;
    try {
      let authUser;
      try {
        authUser = await authService.register(email, username, rawPassword, displayName);
      } catch (err) {
        if (err.message && err.message.includes("already registered")) {
          authUser = authService.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        } else {
          throw err;
        }
      }
      let socialUser = db.getUserByEmail(email);
      if (!socialUser) {
        socialUser = db.createUser({
          name: displayName,
          email,
          handle: username,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          bio: bio || "Explorer on Aura \u2728 Connected to real-time WebRTC social network.",
          status: "online",
          statusMessage: "Active on Aura"
        });
      }
      let token = "";
      try {
        const loginResult = await authService.login(email, rawPassword);
        token = loginResult.token;
      } catch {
      }
      res.status(201).json({
        ...socialUser,
        user: socialUser,
        token,
        message: "Registration successful."
      });
    } catch (error) {
      console.error("[AUTH /register Error]:", error);
      res.status(400).json({ error: error.message });
    }
  });
  router2.post("/google", async (req, res) => {
    const { name, email, avatarUrl, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required for Google Sign-In" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const handle = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    const displayName = name || handle;
    try {
      let socialUser = db.getUserByEmail(cleanEmail);
      if (!socialUser) {
        const existingByHandle = db.getUserByHandle ? db.getUserByHandle(handle) : null;
        if (existingByHandle) {
          socialUser = db.updateUser(existingByHandle.id, {
            email: cleanEmail,
            name: displayName,
            avatarUrl: avatarUrl || existingByHandle.avatarUrl,
            authProvider: "google",
            googleId: googleId || existingByHandle.googleId
          });
        } else {
          socialUser = db.createUser({
            name: displayName,
            email: cleanEmail,
            handle,
            avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}`,
            bio: "Connected via Google Account \u2728",
            status: "online",
            authProvider: "google",
            googleId
          });
        }
      } else {
        socialUser = db.updateUser(socialUser.id, {
          name: displayName,
          avatarUrl: avatarUrl || socialUser.avatarUrl,
          authProvider: "google",
          googleId: googleId || socialUser.googleId
        });
      }
      res.json(socialUser);
    } catch (error) {
      console.error("[AUTH /google Error]:", error);
      res.status(500).json({ error: error.message });
    }
  });
  router2.post("/verify-email", async (req, res) => {
    const { email, code } = req.body;
    try {
      const result = await authService.verifyEmail(email, code);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  router2.post("/login", async (req, res) => {
    const { emailOrUsername, password } = req.body;
    try {
      const result = await authService.login(emailOrUsername, password);
      let socialUser = db.getUserByEmail(result.user.email);
      if (!socialUser) {
        socialUser = db.createUser({
          name: result.user.display_name || result.user.username,
          email: result.user.email,
          handle: result.user.username
        });
      }
      res.json({
        ...result,
        socialUser
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });
  router2.get("/me", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    try {
      const decoded = authService.verifyToken(token);
      const user = authService.getUserById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const socialUser = db.getUserByEmail(user.email);
      res.json({ user, socialUser });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });
  router2.post("/resend-code", async (req, res) => {
    const { email } = req.body;
    try {
      const result = await authService.resendCode(email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  router2.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  return router2;
}

// services/authService.ts
var import_crypto2 = require("crypto");
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
var JWT_EXPIRY = "7d";
var AuthService = class {
  constructor(db2) {
    this.db = db2;
  }
  // Register new user
  async register(email, username, password, displayName) {
    if (!email || !username || !password) {
      throw new Error("Email, username, and password are required");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const existingEmail = this.db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const existingUsername = this.db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existingEmail) throw new Error("Email already registered");
    if (existingUsername) throw new Error("Username already taken");
    const password_hash = await import_bcrypt.default.hash(password, 10);
    const id = (0, import_crypto2.randomUUID)();
    const verification_code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const verification_code_expires = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = this.db.prepare(
      "INSERT INTO users (id, email, username, password_hash, display_name, role, is_verified, verification_code, verification_code_expires, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, email, username, password_hash, displayName || null, "member", 0, verification_code, verification_code_expires, now);
    console.log(`[AUTH] Verification code for ${email}: ${verification_code}`);
    return {
      id,
      email,
      username,
      display_name: displayName,
      is_verified: false,
      created_at: now
    };
  }
  // Verify email with code
  async verifyEmail(email, code) {
    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) throw new Error("User not found");
    if (user.is_verified) throw new Error("Email already verified");
    if (user.verification_code !== code) throw new Error("Invalid verification code");
    if (new Date(user.verification_code_expires) < /* @__PURE__ */ new Date()) throw new Error("Verification code expired");
    this.db.prepare("UPDATE users SET is_verified = 1, verification_code = NULL, verification_code_expires = NULL WHERE id = ?").run(user.id);
    const token = import_jsonwebtoken.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return { token, user: this._sanitizeUser(user) };
  }
  // Login with email or username
  async login(emailOrUsername, password) {
    const user = this.db.prepare(
      "SELECT * FROM users WHERE email = ? OR username = ?"
    ).get(emailOrUsername, emailOrUsername);
    if (!user) throw new Error("Invalid credentials");
    const passwordMatch = await import_bcrypt.default.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error("Invalid credentials");
    this.db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), user.id);
    const token = import_jsonwebtoken.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return { token, user: this._sanitizeUser(user) };
  }
  // Verify token
  verifyToken(token) {
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
  // Get user by ID
  getUserById(id) {
    const user = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return user ? this._sanitizeUser(user) : null;
  }
  // Resend verification code
  async resendCode(email) {
    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) throw new Error("User not found");
    if (user.is_verified) throw new Error("Email already verified");
    const verification_code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const verification_code_expires = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    this.db.prepare("UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE id = ?").run(
      verification_code,
      verification_code_expires,
      user.id
    );
    console.log(`[AUTH] Verification code for ${email}: ${verification_code}`);
    return { message: "Verification code sent" };
  }
  // Forgot password
  async forgotPassword(email) {
    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) throw new Error("User not found");
    const reset_token = (0, import_crypto2.randomUUID)();
    const reset_token_expires = new Date(Date.now() + 60 * 60 * 1e3).toISOString();
    this.db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(
      reset_token,
      reset_token_expires,
      user.id
    );
    console.log(`[AUTH] Password reset token for ${email}: ${reset_token}`);
    return { message: "Password reset link sent" };
  }
  // Reset password
  async resetPassword(resetToken, newPassword) {
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
    const user = this.db.prepare("SELECT * FROM users WHERE reset_token = ?").get(resetToken);
    if (!user) throw new Error("Invalid reset token");
    if (new Date(user.reset_token_expires) < /* @__PURE__ */ new Date()) throw new Error("Reset token expired");
    const password_hash = await import_bcrypt.default.hash(newPassword, 10);
    this.db.prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?").run(
      password_hash,
      user.id
    );
    return { message: "Password reset successful" };
  }
  _sanitizeUser(user) {
    const { password_hash, verification_code, reset_token, ...safe } = user;
    return safe;
  }
};

// server.ts
var import_better_sqlite33 = __toESM(require("better-sqlite3"), 1);
var import_fs5 = __toESM(require("fs"), 1);
async function startServer() {
  const app = (0, import_express3.default)();
  const PORT = 3e3;
  app.use(import_express3.default.json({ limit: "25mb" }));
  app.use(import_express3.default.urlencoded({ extended: true, limit: "25mb" }));
  app.get(["/uploads/sermons/:filename", "/public/uploads/sermons/:filename"], (req, res) => {
    const filename = import_path5.default.basename(req.params.filename);
    const mediaPath = import_path5.default.join(process.cwd(), "public", "uploads", "sermons", filename);
    if (!import_fs5.default.existsSync(mediaPath)) {
      return res.status(404).json({ error: "Media file not found" });
    }
    const stat = import_fs5.default.statSync(mediaPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = import_path5.default.extname(filename).toLowerCase();
    const mimeTypes = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4"
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize) {
        res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
        return;
      }
      const chunksize = end - start + 1;
      const file = import_fs5.default.createReadStream(mediaPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes"
      };
      res.writeHead(200, head);
      import_fs5.default.createReadStream(mediaPath).pipe(res);
    }
  });
  app.use("/uploads", import_express3.default.static(import_path5.default.join(process.cwd(), "public", "uploads")));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", server: "Aura Social Express Backend", timestamp: Date.now() });
  });
  app.get("/api/system/info", (req, res) => {
    const stats = db.getSystemStats();
    res.json(stats);
  });
  app.get("/api/system/export-db", (req, res) => {
    const fullDb = db.exportFullDatabase();
    res.json(fullDb);
  });
  app.get("/api/users", (req, res) => {
    const users = db.getUsers().map((u) => {
      const { passwordHash, ...safeUser } = u;
      return { ...safeUser, hasPassword: Boolean(passwordHash) };
    });
    res.json(users);
  });
  app.get("/api/users/:id", (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });
  app.put("/api/users/:id", (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  });
  app.patch("/api/users/:id", (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  });
  app.put("/api/users/:id/status", (req, res) => {
    const { status, statusMessage } = req.body;
    const updated = db.updateUser(req.params.id, { status, statusMessage });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  });
  app.post("/api/users/:id/follow", (req, res) => {
    const { currentUserId } = req.body;
    if (!currentUserId) return res.status(400).json({ error: "currentUserId is required" });
    const result = db.toggleFollowUser(currentUserId, req.params.id);
    if (!result) return res.status(404).json({ error: "User not found or cannot follow self" });
    res.json(result);
  });
  app.get("/api/posts", (req, res) => {
    const posts = db.getPosts();
    res.json(posts);
  });
  app.get("/api/posts/:id", (req, res) => {
    const post = db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });
  app.post("/api/posts", (req, res) => {
    const { authorId, authorName, authorHandle, authorAvatar, content, mediaUrls, tags, location } = req.body;
    if (!authorId || !content && (!mediaUrls || mediaUrls.length === 0)) {
      return res.status(400).json({ error: "authorId and either content or mediaUrls are required" });
    }
    const newPost = db.createPost({
      authorId,
      authorName,
      authorHandle,
      authorAvatar,
      content,
      mediaUrls: mediaUrls || [],
      tags: tags || [],
      location
    });
    res.status(201).json(newPost);
  });
  app.delete("/api/posts/:id", (req, res) => {
    const success = db.deletePost(req.params.id);
    if (!success) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, id: req.params.id });
  });
  app.post("/api/posts/:id/like", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const result = db.toggleLikePost(req.params.id, userId);
    if (!result) return res.status(404).json({ error: "Post not found" });
    res.json(result);
  });
  app.post("/api/posts/:id/comment", (req, res) => {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ error: "authorId and content are required" });
    }
    const comment = db.addComment(req.params.id, authorId, content);
    if (!comment) return res.status(404).json({ error: "Post or user not found" });
    res.status(201).json(comment);
  });
  app.post("/api/posts/:id/bookmark", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const result = db.toggleBookmarkPost(req.params.id, userId);
    if (!result) return res.status(404).json({ error: "Post not found" });
    res.json(result);
  });
  app.get("/api/stories", (req, res) => {
    const stories = db.getStories();
    res.json(stories);
  });
  app.post("/api/stories", (req, res) => {
    const { userId, mediaUrl, caption } = req.body;
    if (!userId || !mediaUrl) {
      return res.status(400).json({ error: "userId and mediaUrl are required" });
    }
    const story = db.createStory(userId, mediaUrl, caption);
    if (!story) return res.status(404).json({ error: "User not found" });
    res.status(201).json(story);
  });
  app.post("/api/stories/:id/view", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const success = db.markStorySeen(req.params.id, userId);
    res.json({ success });
  });
  app.delete("/api/stories/:id", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const success = db.deleteStory(req.params.id, userId);
    res.json({ success });
  });
  app.delete("/api/stories/:id/slides/:slideId", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const updatedStory = db.deleteStorySlide(req.params.id, req.params.slideId, userId);
    res.json({ story: updatedStory });
  });
  app.get("/api/conversations", (req, res) => {
    const userId = req.query.userId;
    const conversations = db.getConversations(userId);
    res.json(conversations);
  });
  app.post("/api/conversations", (req, res) => {
    const { creatorId, participantIds, isGroup, name } = req.body;
    if (!creatorId || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: "creatorId and participantIds array are required" });
    }
    const conv = db.createConversation(creatorId, participantIds, Boolean(isGroup), name);
    res.status(201).json(conv);
  });
  app.get("/api/messages/:conversationId", (req, res) => {
    const messages = db.getMessages(req.params.conversationId);
    res.json(messages);
  });
  app.post("/api/messages", (req, res) => {
    const { conversationId, senderId, senderName, senderAvatar, content, mediaUrl, mediaType, audioDuration, replyTo, storyReply, callLog } = req.body;
    if (!conversationId || !senderId || !content && !mediaUrl) {
      return res.status(400).json({ error: "conversationId, senderId, and content or media are required" });
    }
    const message = db.sendMessage({
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      content: content || "",
      mediaUrl,
      mediaType,
      audioDuration,
      replyTo,
      storyReply,
      callLog
    });
    res.status(201).json(message);
  });
  app.post("/api/messages/:conversationId/:messageId/reaction", (req, res) => {
    const { emoji, userId } = req.body;
    if (!emoji || !userId) {
      return res.status(400).json({ error: "emoji and userId are required" });
    }
    const reactions = db.addMessageReaction(req.params.conversationId, req.params.messageId, emoji, userId);
    if (!reactions) return res.status(404).json({ error: "Message not found" });
    res.json(reactions);
  });
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BBAX1ipe_zcn6CoRkoW9a9cw65QRsBKRXKdhdzqxrY00PqpetVxtI7SJ7-ZTcQLozOzIwsL-Sg9D7U-qfERMxZs";
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "OCB5cJ_HHQhpQX5kcRdf4jr_hMBhnGPdsV52v2M76SA";
  const VAPID_MAILTO = process.env.VAPID_MAILTO || "mailto:admin@cloudcraftstudio.com";
  import_web_push.default.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const authDb = new import_better_sqlite33.default(import_path5.default.join(process.cwd(), "data", "auth.db"));
  authDb.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_push_user_id ON push_subscriptions(user_id);
  `);
  app.get("/api/push/vapid-key", (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });
  app.post("/api/push/subscribe", (req, res) => {
    const { userId, subscription } = req.body;
    if (!userId || !subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: "userId and subscription keys required" });
    }
    try {
      const stmt = authDb.prepare(`
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET
          user_id = excluded.user_id,
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          created_at = excluded.created_at
      `);
      stmt.run(userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, Date.now());
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("Failed to save push subscription:", err);
      res.status(500).json({ error: "Failed to store subscription" });
    }
  });
  const sendPushToUser = async (userId, payload) => {
    try {
      const subs = authDb.prepare("SELECT * FROM push_subscriptions WHERE user_id = ?").all(userId);
      for (const sub of subs) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        import_web_push.default.sendNotification(pushSubscription, JSON.stringify(payload), {
          urgency: "high",
          TTL: 60
        }).catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            authDb.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(sub.endpoint);
          }
        });
      }
    } catch (err) {
      console.error("Error dispatching push notifications:", err);
    }
  };
  app.post("/api/calls", (req, res) => {
    const { callerId, callerName, callerAvatar, receiverId, receiverName, receiverAvatar, isVideo, roomId } = req.body;
    if (!callerId || !receiverId || !roomId) {
      return res.status(400).json({ error: "callerId, receiverId, and roomId are required" });
    }
    const session = db.createOrUpdateCallSession({
      callerId,
      callerName,
      callerAvatar,
      receiverId,
      receiverName,
      receiverAvatar,
      isVideo: isVideo !== void 0 ? isVideo : true,
      roomId,
      status: "calling"
    });
    res.status(201).json(session);
  });
  app.get("/api/calls/pending", (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query is required" });
    const pending = db.getPendingCallsForUser(userId);
    res.json(pending);
  });
  app.get("/api/calls/:roomId", (req, res) => {
    const session = db.getCallSessionByRoomId(req.params.roomId);
    if (!session) return res.status(404).json({ error: "Call session not found" });
    res.json(session);
  });
  app.post("/api/calls/:roomId/status", (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const session = db.updateCallStatus(req.params.roomId, status);
    if (!session) return res.status(404).json({ error: "Call session not found" });
    if (status === "ended" || status === "declined") {
      try {
        const convs = db.getConversations();
        const directConv = convs.find(
          (c) => !c.isGroup && Array.isArray(c.participantIds) && c.participantIds.includes(session.callerId) && c.participantIds.includes(session.receiverId)
        );
        if (directConv) {
          const duration = session.startedAt && session.endedAt ? Math.round((session.endedAt - session.startedAt) / 1e3) : 0;
          db.sendMessage({
            conversationId: directConv.id,
            senderId: session.callerId,
            senderName: session.callerName,
            senderAvatar: session.callerAvatar,
            content: status === "declined" ? `\u274C Declined ${session.isVideo ? "Video" : "Audio"} Call` : duration > 0 ? `\u{1F4DE} ${session.isVideo ? "Video" : "Audio"} Call ended (${Math.floor(duration / 60)}m ${duration % 60}s)` : `\u{1F4DE} Missed ${session.isVideo ? "Video" : "Audio"} Call`,
            callLog: {
              callType: session.isVideo ? "video" : "audio",
              status: status === "declined" ? "declined" : duration > 0 ? "completed" : "missed",
              durationSeconds: duration
            }
          });
        }
      } catch (err) {
        console.warn("Could not auto-log call into conversation:", err);
      }
    }
    res.json(session);
  });
  app.post("/api/calls/:roomId/signal", (req, res) => {
    const { senderId, type, data } = req.body;
    if (!senderId || !type || !data) {
      return res.status(400).json({ error: "senderId, type, and data are required" });
    }
    const signal = db.addCallSignal(req.params.roomId, senderId, type, data);
    res.status(201).json(signal);
  });
  app.get("/api/calls/:roomId/signals", (req, res) => {
    const excludeSenderId = req.query.excludeSenderId;
    const since = req.query.since ? parseInt(req.query.since, 10) : 0;
    const signals = db.getCallSignals(req.params.roomId, excludeSenderId, since);
    res.json(signals);
  });
  app.get("/api/unsplash/search", async (req, res) => {
    try {
      const query = req.query.query || "";
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        return res.status(200).json({ results: [], noKey: true });
      }
      const endpoint = query.trim() ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=24&orientation=landscape` : `https://api.unsplash.com/photos/random?count=24&orientation=landscape`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Unsplash upstream error" });
      }
      const data = await response.json();
      const photos = query.trim() ? data.results : data;
      const results = Array.isArray(photos) ? photos.map((p) => ({
        id: p.id,
        url: p.urls.regular,
        thumb: p.urls.small,
        author: p.user?.name || "Unsplash Creator"
      })) : [];
      return res.json({ results });
    } catch (err) {
      console.error("Unsplash proxy error:", err);
      return res.status(500).json({ error: "Failed to fetch from Unsplash" });
    }
  });
  app.post("/api/bible-study/generate", async (req, res) => {
    try {
      const { topic, isVerseOfDay } = req.body;
      const { GoogleGenAI: GoogleGenAI2, Type } = await import("@google/genai");
      const ai = new GoogleGenAI2({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const promptString = isVerseOfDay ? `You are AI Tutor King James, well versed on anything about the Bible. Provide a beautiful Verse of the Day from the King James Version (KJV). Then provide a full breakdown including summary, historical context, Hebrew/Greek bites, comparison to now, application, and a prayer.` : `You are AI Tutor King James, well versed on anything about the Bible. The user wants a study on: "${topic}". Use the King James Version (KJV) for all scripture references. Provide a full summary, historical context (who wrote it, time period, target audience), Hebrew/Greek bites (real definitions for context), comparison to now, how to apply it day-to-day, and a prayer.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptString,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING, description: "The Bible reference, e.g. John 3:16 or Genesis 1" },
              text: { type: Type.STRING, description: "The actual KJV text of the verse or passage" },
              summary: { type: Type.STRING, description: "Full summary of the passage" },
              historicalContext: {
                type: Type.OBJECT,
                properties: {
                  author: { type: Type.STRING },
                  timePeriod: { type: Type.STRING },
                  setting: { type: Type.STRING },
                  targetAudience: { type: Type.STRING }
                }
              },
              hebrewGreekBites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING, description: "The original Hebrew or Greek word" },
                    definition: { type: Type.STRING, description: "The real definition to help understand context" }
                  }
                }
              },
              compareAndContrast: { type: Type.STRING, description: "Comparison from then until now" },
              application: { type: Type.STRING, description: "How to apply it to our day-to-day lives" },
              prayer: { type: Type.STRING, description: "A prayer relating to this study" }
            },
            required: ["reference", "text", "summary", "historicalContext", "hebrewGreekBites", "compareAndContrast", "application", "prayer"]
          }
        }
      });
      let parsed;
      try {
        parsed = JSON.parse(response.text?.trim() || "{}");
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse AI response" });
      }
      res.json(parsed);
    } catch (err) {
      console.error("Bible study generation error:", err);
      res.status(500).json({ error: err.message || "Error generating bible study" });
    }
  });
  app.post("/api/bible-study/audio", async (req, res) => {
    try {
      const { text } = req.body;
      const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
      const ai = new GoogleGenAI2({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const prompt = `Read the following Bible passage with a wise, majestic, and authoritative voice, like King James himself: ${text}`;
      let base64Audio = null;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Zephyr" }
              }
            }
          }
        });
        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      } catch (innerErr) {
        console.warn("Primary TTS preview model busy, attempting fallback:", innerErr);
      }
      if (base64Audio) {
        res.json({ audioData: base64Audio });
      } else {
        res.status(503).json({ error: "Audio generation service temporarily busy. Please try again in a moment." });
      }
    } catch (err) {
      console.error("TTS error:", err);
      res.status(500).json({ error: err.message || "Error generating audio" });
    }
  });
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
      const ai = new GoogleGenAI2({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt,
        config: {
          aspectRatio: "1:1",
          numberOfImages: 1,
          outputMimeType: "image/jpeg"
        }
      });
      let imageUrl = null;
      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageBytes = response.generatedImages[0].image.imageBytes;
        imageUrl = `data:image/jpeg;base64,${imageBytes}`;
      }
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "No image generated" });
      }
    } catch (err) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: err.message || "Error generating image" });
    }
  });
  try {
    const bibleDbPath = import_path5.default.join(process.cwd(), "data", "bible", "bible_study.db");
    initializeBibleDB(bibleDbPath);
    const bibleDB = new BibleStudyDB(bibleDbPath);
    const bibleRoutes = createBibleRoutes(bibleDB);
    app.use("/api/bible", bibleRoutes);
    app.get("/api/bible/community/sermons", async (_req, res) => {
      try {
        const feed = await getLiveMinistryFeed();
        res.json(feed);
      } catch (err) {
        console.error("[Community Sermons] Error:", err);
        res.status(500).json({ error: err.message || "Failed to load sermons" });
      }
    });
  } catch (err) {
    console.error("Failed to initialize Bible Study DB:", err);
  }
  try {
    const authDbPath = import_path5.default.join(process.cwd(), "data", "auth.db");
    const authDb2 = new import_better_sqlite33.default(authDbPath);
    const schemaPath = import_path5.default.join(process.cwd(), "data", "auth_schema.sql");
    const schema = import_fs5.default.readFileSync(schemaPath, "utf-8");
    authDb2.exec(schema);
    const authService = new AuthService(authDb2);
    const authRoutes = createAuthRoutes(authService);
    app.use("/api/auth", authRoutes);
  } catch (err) {
    console.error("Failed to initialize Auth DB:", err);
  }
  const isProd = process.env.NODE_ENV === "production" || !process.env.VITE_DEV;
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path5.default.join(process.cwd(), "dist");
    app.get("/api/app-update/version", (req, res) => {
      try {
        const manifestPath = import_path5.default.join(process.cwd(), "public", "update-manifest.json");
        if (import_fs5.default.existsSync(manifestPath)) {
          return res.json(JSON.parse(import_fs5.default.readFileSync(manifestPath, "utf8")));
        }
        res.json({ version: "1.0.0", url: "https://webcraftstudio.cloud/dist.zip" });
      } catch (e) {
        res.status(500).json({ error: "Failed to read manifest" });
      }
    });
    app.get("/aura.apk", (req, res) => {
      const apkPath = import_path5.default.join(process.cwd(), "dist", "aura.apk");
      if (import_fs5.default.existsSync(apkPath)) {
        res.setHeader("Content-Disposition", "attachment; filename=aura.apk");
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        return res.sendFile(apkPath);
      }
      res.status(404).send("APK not found");
    });
    app.use(import_express3.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path5.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura Server running on http://localhost:${PORT}`);
  });
}
startServer();
