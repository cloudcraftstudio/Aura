/**
 * Authentication Routes - Production Grade
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  // POST /api/auth/register
  router.post('/register', async (req: Request, res: Response) => {
    const { email, username, password, displayName } = req.body;

    try {
      const user = await authService.register(email, username, password, displayName);
      res.status(201).json({ user, message: 'Registration successful. Check your email for verification code.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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
      res.json(result);
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

      res.json({ user });
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
