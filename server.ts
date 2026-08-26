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
    const users = db.getUsers();
    res.json(users);
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, handle, avatarUrl, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const user = db.createUser({ name, email, handle, avatarUrl, bio });
    res.status(201).json(user);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, userId } = req.body;
    let user;
    if (userId) {
      user = db.getUserById(userId);
    } else if (email) {
      user = db.getUserByEmail(email);
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  app.post('/api/auth/google', (req, res) => {
    const { name, email, avatarUrl, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    let user = db.getUserByEmail(email);
    if (!user) {
      user = db.createUser({
        name: name || email.split('@')[0],
        email,
        handle: email.split('@')[0].toLowerCase(),
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        googleId,
      });
    } else if (avatarUrl && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) {
      user = db.updateUser(user.id, { avatarUrl }) || user;
    }
    res.json(user);
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
    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content are required' });
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
