import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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
    res.json({ ...safeUser, hasPassword: Boolean(passwordHash) });
  });

  app.post('/api/auth/check-email', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.getUserByEmail(email.trim());
    if (!user) {
      return res.json({ exists: false });
    }
    res.json({
      exists: true,
      hasPassword: Boolean(user.passwordHash),
      name: user.name,
      avatarUrl: user.avatarUrl,
      handle: user.handle,
      authProvider: user.authProvider || 'email',
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, handle, avatarUrl, bio, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const user = db.createUser({
      name,
      email: cleanEmail,
      handle,
      avatarUrl,
      bio,
      passwordHash: password ? String(password) : undefined,
      authProvider: 'email',
    });
    const { passwordHash, ...safeUser } = user;
    res.status(201).json({ ...safeUser, hasPassword: Boolean(passwordHash) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, userId, password } = req.body;
    let user;
    if (userId) {
      user = db.getUserById(userId);
    } else if (email) {
      user = db.getUserByEmail(email.trim().toLowerCase());
    }
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or ID' });
    }

    // If user has a password set, require and verify the password
    if (user.passwordHash) {
      if (!password) {
        return res.status(401).json({ error: 'Password is required for this protected account', requiresPassword: true });
      }
      if (String(user.passwordHash) !== String(password)) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.', requiresPassword: true });
      }
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ ...safeUser, hasPassword: Boolean(passwordHash) });
  });

  app.post('/api/auth/google', (req, res) => {
    const { name, email, avatarUrl, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.getUserByEmail(cleanEmail);
    if (!user) {
      user = db.createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        handle: cleanEmail.split('@')[0].toLowerCase(),
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        googleId,
        authProvider: 'google',
      });
    } else {
      // Retain existing profile customizations, but update googleId or avatar if blank
      const updates: any = {};
      if (googleId && !user.googleId) updates.googleId = googleId;
      if (!user.authProvider) updates.authProvider = 'google';
      if (Object.keys(updates).length > 0) {
        user = db.updateUser(user.id, updates) || user;
      }
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ ...safeUser, hasPassword: Boolean(passwordHash) });
  });

  app.post('/api/auth/set-password', (req, res) => {
    const { userId, newPassword, currentPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.passwordHash && user.passwordHash !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const updated = db.updateUser(userId, { passwordHash: String(newPassword) });
    if (!updated) return res.status(500).json({ error: 'Failed to set password' });
    const { passwordHash, ...safeUser } = updated;
    res.json({ ...safeUser, hasPassword: true });
  });

  app.put('/api/users/:id', (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
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
            c.participantIds.includes(session.callerId) &&
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
        model: 'gemini-3.6-flash',
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

      // Prompt the model to speak with authority/wisdom
      const prompt = `Read the following Bible passage with a wise, majestic, and authoritative voice, like King James himself: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr has a deep authoritative tone
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audioData: base64Audio });
      } else {
        res.status(500).json({ error: 'No audio generated' });
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

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
