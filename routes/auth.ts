/**
 * Authentication Routes - Production Grade
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { db } from '../server/db';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  // POST /api/auth/register
  router.post('/register', async (req: Request, res: Response) => {
    const rawEmail = req.body.email;
    const rawUsername = req.body.username || req.body.handle;
    const rawDisplayName = req.body.displayName || req.body.name;
    const rawPassword = req.body.password || 'TemporaryPassword123!';
    const avatarUrl = req.body.avatarUrl;
    const bio = req.body.bio;

    if (!rawEmail || !rawUsername) {
      return res.status(400).json({ error: 'Email and username/handle are required' });
    }

    const email = rawEmail.trim().toLowerCase();
    const username = rawUsername.replace('@', '').trim().toLowerCase();
    const displayName = rawDisplayName || username;

    try {
      let authUser;
      try {
        authUser = await authService.register(email, username, rawPassword, displayName);
      } catch (err: any) {
        if (err.message && err.message.includes('already registered')) {
          authUser = (authService as any).db.prepare("SELECT * FROM users WHERE email = ?").get(email);
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
          bio: bio || 'Explorer on Aura ✨ Connected to real-time WebRTC social network.',
          status: 'online',
          statusMessage: 'Active on Aura',
        });
      }

      let token = '';
      try {
        const loginResult = await authService.login(email, rawPassword);
        token = loginResult.token;
      } catch {
        // Fallback
      }

      res.status(201).json({
        ...socialUser,
        user: socialUser,
        token,
        message: 'Registration successful.'
      });
    } catch (error: any) {
      console.error('[AUTH /register Error]:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/auth/google
  router.post('/google', async (req: Request, res: Response) => {
    const { name, email, avatarUrl, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google Sign-In' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const handle = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    const displayName = name || handle;

    try {
      // 1. Check if user exists in db.json by email or handle
      let socialUser = db.getUserByEmail(cleanEmail);

      if (!socialUser) {
        // Check if there's an existing account by handle (e.g. seeded 'tex') and update its email
        const existingByHandle = db.getUserByHandle ? db.getUserByHandle(handle) : null;
        if (existingByHandle) {
          socialUser = db.updateUser(existingByHandle.id, {
            email: cleanEmail,
            name: displayName,
            avatarUrl: avatarUrl || existingByHandle.avatarUrl,
            authProvider: 'google',
            googleId: googleId || existingByHandle.googleId,
          });
        } else {
          socialUser = db.createUser({
            name: displayName,
            email: cleanEmail,
            handle,
            avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}`,
            bio: 'Connected via Google Account ✨',
            status: 'online',
            authProvider: 'google',
            googleId,
          });
        }
      } else {
        // Update user with latest Google info
        socialUser = db.updateUser(socialUser.id, {
          name: displayName,
          avatarUrl: avatarUrl || socialUser.avatarUrl,
          authProvider: 'google',
          googleId: googleId || socialUser.googleId,
        });
      }

      res.json(socialUser);
    } catch (error: any) {
      console.error('[AUTH /google Error]:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/auth/verify-email
  router.post('/verify-email', async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
      const result = await authService.verifyEmail(email, code);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req: Request, res: Response) => {
    const { emailOrUsername, password } = req.body;

    try {
      const result = await authService.login(emailOrUsername, password);
      
      let socialUser = db.getUserByEmail(result.user.email);
      if (!socialUser) {
        socialUser = db.createUser({
          name: result.user.display_name || result.user.username,
          email: result.user.email,
          handle: result.user.username,
        });
      }

      res.json({
        ...result,
        socialUser,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // GET /api/auth/me
  router.get('/me', (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = authService.verifyToken(token);
      const user = authService.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const socialUser = db.getUserByEmail(user.email);
      res.json({ user, socialUser });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // POST /api/auth/resend-code
  router.post('/resend-code', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const result = await authService.resendCode(email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/auth/logout
  router.post('/logout', (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  });

  return router;
}
