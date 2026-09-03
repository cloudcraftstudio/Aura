import { getLiveMinistryFeed } from "./services/youtubeFeedService";
import webpush from "web-push";
import express from 'express';
import path from 'path';
import { db } from './server/db';
import { createBibleRoutes } from './routes/bible';
import { BibleStudyDB } from './data/bible/models';
import { initializeBibleDB } from './data/bible/init';
import { createAuthRoutes } from './routes/auth';
import { AuthService } from './services/authService';
import Database from 'better-sqlite3';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Serve uploaded sermon files
  
  // Stream uploaded videos & audio with HTTP 206 Partial Content (Byte Range Support)
  app.get(["/uploads/sermons/:filename", "/public/uploads/sermons/:filename"], (req, res) => {
    const filename = path.basename(req.params.filename);
    const mediaPath = path.join(process.cwd(), "public", "uploads", "sermons", filename);

    if (!fs.existsSync(mediaPath)) {
      return res.status(404).json({ error: "Media file not found" });
    }

    const stat = fs.statSync(mediaPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
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
      const file = fs.createReadStream(mediaPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      };
      res.writeHead(200, head);
      fs.createReadStream(mediaPath).pipe(res);
    }
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES FIRST ---

  // Health & System
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Aura Social Express Backend', timestamp: Date.now() });
  });

  app.get('/api/system/info', (req, res) => {
    const stats = db.getSystemStats();
    res.json(stats);
  });

  app.get('/api/system/export-db', (req, res) => {
    const fullDb = db.exportFullDatabase();
    res.json(fullDb);
  });

  // --- Auth & Users API ---
  app.get('/api/users', (req, res) => {
    const users = db.getUsers().map((u) => {
      const { passwordHash, ...safeUser } = u;
      return { ...safeUser, hasPassword: Boolean(passwordHash) };
    });
    res.json(users);
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put('/api/users/:id', (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  });

  app.patch('/api/users/:id', (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  });

  app.put('/api/users/:id/status', (req, res) => {
    const { status, statusMessage } = req.body;
    const updated = db.updateUser(req.params.id, { status, statusMessage });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  });

  app.post('/api/users/:id/follow', (req, res) => {
    const { currentUserId } = req.body;
    if (!currentUserId) return res.status(400).json({ error: 'currentUserId is required' });
    const result = db.toggleFollowUser(currentUserId, req.params.id);
    if (!result) return res.status(404).json({ error: 'User not found or cannot follow self' });
    res.json(result);
  });

  // --- Posts & Feed API ---
  app.get('/api/posts', (req, res) => {
    const posts = db.getPosts();
    res.json(posts);
  });

  app.get('/api/posts/:id', (req, res) => {
    const post = db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  });

  app.post('/api/posts', (req, res) => {
    const { authorId, authorName, authorHandle, authorAvatar, content, mediaUrls, tags, location } = req.body;
    
    // A post must have an author, and either some text content OR some media
    if (!authorId || (!content && (!mediaUrls || mediaUrls.length === 0))) {
      return res.status(400).json({ error: 'authorId and either content or mediaUrls are required' });
    }
    
    const newPost = db.createPost({
      authorId,
      authorName,
      authorHandle,
      authorAvatar,
      content,
      mediaUrls: mediaUrls || [],
      tags: tags || [],
      location,
    });
    res.status(201).json(newPost);
  });

  app.delete('/api/posts/:id', (req, res) => {
    const success = db.deletePost(req.params.id);
    if (!success) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true, id: req.params.id });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = db.toggleLikePost(req.params.id, userId);
    if (!result) return res.status(404).json({ error: 'Post not found' });
    res.json(result);
  });

  app.post('/api/posts/:id/comment', (req, res) => {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content are required' });
    }
    const comment = db.addComment(req.params.id, authorId, content);
    if (!comment) return res.status(404).json({ error: 'Post or user not found' });
    res.status(201).json(comment);
  });

  app.post('/api/posts/:id/bookmark', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = db.toggleBookmarkPost(req.params.id, userId);
    if (!result) return res.status(404).json({ error: 'Post not found' });
    res.json(result);
  });

  // --- Stories API ---
  app.get('/api/stories', (req, res) => {
    const stories = db.getStories();
    res.json(stories);
  });

  app.post('/api/stories', (req, res) => {
    const { userId, mediaUrl, caption } = req.body;
    if (!userId || !mediaUrl) {
      return res.status(400).json({ error: 'userId and mediaUrl are required' });
    }
    const story = db.createStory(userId, mediaUrl, caption);
    if (!story) return res.status(404).json({ error: 'User not found' });
    res.status(201).json(story);
  });

  app.post('/api/stories/:id/view', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const success = db.markStorySeen(req.params.id, userId);
    res.json({ success });
  });

  app.delete('/api/stories/:id', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const success = db.deleteStory(req.params.id, userId);
    res.json({ success });
  });

  app.delete('/api/stories/:id/slides/:slideId', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const updatedStory = db.deleteStorySlide(req.params.id, req.params.slideId, userId);
    res.json({ story: updatedStory });
  });

  // --- Conversations & Messages API ---
  app.get('/api/conversations', (req, res) => {
    const userId = req.query.userId as string | undefined;
    const conversations = db.getConversations(userId);
    res.json(conversations);
  });

  app.post('/api/conversations', (req, res) => {
    const { creatorId, participantIds, isGroup, name } = req.body;
    if (!creatorId || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'creatorId and participantIds array are required' });
    }
    const conv = db.createConversation(creatorId, participantIds, Boolean(isGroup), name);
    res.status(201).json(conv);
  });

  app.get('/api/messages/:conversationId', (req, res) => {
    const messages = db.getMessages(req.params.conversationId);
    res.json(messages);
  });

  app.post('/api/messages', (req, res) => {
    const { conversationId, senderId, senderName, senderAvatar, content, mediaUrl, mediaType, audioDuration, replyTo, storyReply, callLog } = req.body;
    if (!conversationId || !senderId || (!content && !mediaUrl)) {
      return res.status(400).json({ error: 'conversationId, senderId, and content or media are required' });
    }
    const message = db.sendMessage({
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      content: content || '',
      mediaUrl,
      mediaType,
      audioDuration,
      replyTo,
      storyReply,
      callLog,
    });
    res.status(201).json(message);
  });

  app.post('/api/messages/:conversationId/:messageId/reaction', (req, res) => {
    const { emoji, userId } = req.body;
    if (!emoji || !userId) {
      return res.status(400).json({ error: 'emoji and userId are required' });
    }
    const reactions = db.addMessageReaction(req.params.conversationId, req.params.messageId, emoji, userId);
    if (!reactions) return res.status(404).json({ error: 'Message not found' });
    res.json(reactions);
  });


  // --- Web Push / Notification Setup ---
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BBAX1ipe_zcn6CoRkoW9a9cw65QRsBKRXKdhdzqxrY00PqpetVxtI7SJ7-ZTcQLozOzIwsL-Sg9D7U-qfERMxZs";
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "OCB5cJ_HHQhpQX5kcRdf4jr_hMBhnGPdsV52v2M76SA";
  const VAPID_MAILTO = process.env.VAPID_MAILTO || "mailto:admin@cloudcraftstudio.com";

  webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const authDb = new Database(path.join(process.cwd(), "data", "auth.db"));
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

  // Return Public Key to Client
  app.get("/api/push/vapid-key", (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  // Save Subscription from Client Device
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

  // Helper to send push to a user
  const sendPushToUser = async (userId: string, payload: any) => {
    try {
      const subs = authDb.prepare("SELECT * FROM push_subscriptions WHERE user_id = ?").all(userId) as any[];
      for (const sub of subs) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };
        webpush.sendNotification(pushSubscription, JSON.stringify(payload), {
          urgency: "high",
          TTL: 60,
        }).catch((err: any) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            authDb.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(sub.endpoint);
          }
        });
      }
    } catch (err) {
      console.error("Error dispatching push notifications:", err);
    }
  };

  // --- Calls & WebRTC Signaling API ---
  app.post('/api/calls', (req, res) => {
    const { callerId, callerName, callerAvatar, receiverId, receiverName, receiverAvatar, isVideo, roomId } = req.body;
    if (!callerId || !receiverId || !roomId) {
      return res.status(400).json({ error: 'callerId, receiverId, and roomId are required' });
    }
    const session = db.createOrUpdateCallSession({
      callerId,
      callerName,
      callerAvatar,
      receiverId,
      receiverName,
      receiverAvatar,
      isVideo: isVideo !== undefined ? isVideo : true,
      roomId,
      status: 'calling',
    });
    res.status(201).json(session);
  });

  app.get('/api/calls/pending', (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId query is required' });
    const pending = db.getPendingCallsForUser(userId);
    res.json(pending);
  });

  app.get('/api/calls/:roomId', (req, res) => {
    const session = db.getCallSessionByRoomId(req.params.roomId);
    if (!session) return res.status(404).json({ error: 'Call session not found' });
    res.json(session);
  });

  app.post('/api/calls/:roomId/status', (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const session = db.updateCallStatus(req.params.roomId, status);
    if (!session) return res.status(404).json({ error: 'Call session not found' });

    // If call completed, declined or missed, optionally log in direct conversation
    if (status === 'ended' || status === 'declined') {
      try {
        const convs = db.getConversations();
        const directConv = convs.find(
          (c) =>
            !c.isGroup &&
            Array.isArray(c.participantIds) && c.participantIds.includes(session.callerId) &&
            c.participantIds.includes(session.receiverId)
        );
        if (directConv) {
          const duration = session.startedAt && session.endedAt ? Math.round((session.endedAt - session.startedAt) / 1000) : 0;
          db.sendMessage({
            conversationId: directConv.id,
            senderId: session.callerId,
            senderName: session.callerName,
            senderAvatar: session.callerAvatar,
            content: status === 'declined'
              ? `❌ Declined ${session.isVideo ? 'Video' : 'Audio'} Call`
              : duration > 0
              ? `📞 ${session.isVideo ? 'Video' : 'Audio'} Call ended (${Math.floor(duration / 60)}m ${duration % 60}s)`
              : `📞 Missed ${session.isVideo ? 'Video' : 'Audio'} Call`,
            callLog: {
              callType: session.isVideo ? 'video' : 'audio',
              status: status === 'declined' ? 'declined' : duration > 0 ? 'completed' : 'missed',
              durationSeconds: duration,
            },
          });
        }
      } catch (err) {
        console.warn('Could not auto-log call into conversation:', err);
      }
    }

    res.json(session);
  });

  app.post('/api/calls/:roomId/signal', (req, res) => {
    const { senderId, type, data } = req.body;
    if (!senderId || !type || !data) {
      return res.status(400).json({ error: 'senderId, type, and data are required' });
    }
    const signal = db.addCallSignal(req.params.roomId, senderId, type, data);
    res.status(201).json(signal);
  });

  app.get('/api/calls/:roomId/signals', (req, res) => {
    const excludeSenderId = req.query.excludeSenderId as string | undefined;
    const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;
    const signals = db.getCallSignals(req.params.roomId, excludeSenderId, since);
    res.json(signals);
  });

  // --- Unsplash Image Proxy ---
  app.get('/api/unsplash/search', async (req, res) => {
    try {
      const query = (req.query.query as string) || '';
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        return res.status(200).json({ results: [], noKey: true });
      }

      const endpoint = query.trim()
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=24&orientation=landscape`
        : `https://api.unsplash.com/photos/random?count=24&orientation=landscape`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Unsplash upstream error' });
      }

      const data = await response.json();
      const photos = query.trim() ? data.results : data;
      const results = Array.isArray(photos)
        ? photos.map((p: any) => ({
            id: p.id,
            url: p.urls.regular,
            thumb: p.urls.small,
            author: p.user?.name || 'Unsplash Creator',
          }))
        : [];

      return res.json({ results });
    } catch (err: any) {
      console.error('Unsplash proxy error:', err);
      return res.status(500).json({ error: 'Failed to fetch from Unsplash' });
    }
  });

  // --- AI TUTOR (KING JAMES) API ---
  app.post('/api/bible-study/generate', async (req, res) => {
    try {
      const { topic, isVerseOfDay } = req.body;
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const promptString = isVerseOfDay
        ? `You are AI Tutor King James, well versed on anything about the Bible. Provide a beautiful Verse of the Day from the King James Version (KJV). Then provide a full breakdown including summary, historical context, Hebrew/Greek bites, comparison to now, application, and a prayer.`
        : `You are AI Tutor King James, well versed on anything about the Bible. The user wants a study on: "${topic}". Use the King James Version (KJV) for all scripture references. Provide a full summary, historical context (who wrote it, time period, target audience), Hebrew/Greek bites (real definitions for context), comparison to now, how to apply it day-to-day, and a prayer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptString,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING, description: 'The Bible reference, e.g. John 3:16 or Genesis 1' },
              text: { type: Type.STRING, description: 'The actual KJV text of the verse or passage' },
              summary: { type: Type.STRING, description: 'Full summary of the passage' },
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
                    word: { type: Type.STRING, description: 'The original Hebrew or Greek word' },
                    definition: { type: Type.STRING, description: 'The real definition to help understand context' }
                  }
                }
              },
              compareAndContrast: { type: Type.STRING, description: 'Comparison from then until now' },
              application: { type: Type.STRING, description: 'How to apply it to our day-to-day lives' },
              prayer: { type: Type.STRING, description: 'A prayer relating to this study' }
            },
            required: ["reference", "text", "summary", "historicalContext", "hebrewGreekBites", "compareAndContrast", "application", "prayer"]
          }
        }
      });
      
      let parsed;
      try {
        parsed = JSON.parse(response.text?.trim() || '{}');
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
      res.json(parsed);
    } catch (err: any) {
      console.error('Bible study generation error:', err);
      res.status(500).json({ error: err.message || 'Error generating bible study' });
    }
  });

  app.post('/api/bible-study/audio', async (req, res) => {
    try {
      const { text } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
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
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
            },
          },
        });
        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      } catch (innerErr) {
        console.warn("Primary TTS preview model busy, attempting fallback:", innerErr);
      }

      if (base64Audio) {
        res.json({ audioData: base64Audio });
      } else {
        res.status(503).json({ error: 'Audio generation service temporarily busy. Please try again in a moment.' });
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      res.status(500).json({ error: err.message || 'Error generating audio' });
    }
  });

  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
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
        res.status(500).json({ error: 'No image generated' });
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      res.status(500).json({ error: err.message || 'Error generating image' });
    }
  });

  // --- BIBLE STUDY ROUTES ---
  try {
    const bibleDbPath = path.join(process.cwd(), 'data', 'bible', 'bible_study.db');
    initializeBibleDB(bibleDbPath);
    const bibleDB = new BibleStudyDB(bibleDbPath);
    const bibleRoutes = createBibleRoutes(bibleDB);
    app.use('/api/bible', bibleRoutes);

    // Live Sync for Contemporary & Community Ministries (Lighthouse Baptist Church, etc.)
    app.get('/api/bible/community/sermons', async (_req, res) => {
      try {
        const feed = await getLiveMinistryFeed();
        res.json(feed);
      } catch (err: any) {
        console.error('[Community Sermons] Error:', err);
        res.status(500).json({ error: err.message || 'Failed to load sermons' });
      }
    });
  } catch (err) {
    console.error('Failed to initialize Bible Study DB:', err);
  }

  // --- AUTH ROUTES ---
  try {
    const authDbPath = path.join(process.cwd(), 'data', 'auth.db');
    const authDb = new Database(authDbPath);
    
    // Initialize auth schema
    const schemaPath = path.join(process.cwd(), 'data', 'auth_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    authDb.exec(schema);
    
    const authService = new AuthService(authDb);
    const authRoutes = createAuthRoutes(authService);
    app.use('/api/auth', authRoutes);
  } catch (err) {
    console.error('Failed to initialize Auth DB:', err);
  }

  // --- VITE MIDDLEWARE SETUP ---
  const isProd = process.env.NODE_ENV === "production" || !process.env.VITE_DEV;
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // App OTA Update Endpoint
  app.get("/api/app-update/version", (req, res) => {
    try {
      const manifestPath = path.join(process.cwd(), "public", "update-manifest.json");
      if (fs.existsSync(manifestPath)) {
        return res.json(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
      }
      res.json({ version: "1.0.0", url: "https://webcraftstudio.cloud/dist.zip" });
    } catch (e) {
      res.status(500).json({ error: "Failed to read manifest" });
    }
  });

  // APK Download Route
  app.get("/aura.apk", (req, res) => {
    const apkPath = path.join(process.cwd(), "dist", "aura.apk");
    if (fs.existsSync(apkPath)) {
      res.setHeader("Content-Disposition", "attachment; filename=aura.apk");
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      return res.sendFile(apkPath);
    }
    res.status(404).send("APK not found");
  });

  app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Server running on http://localhost:${PORT}`);
  });
}

startServer();
