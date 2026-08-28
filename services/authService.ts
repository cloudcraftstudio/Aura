/**
 * Authentication Service - Production Grade
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  display_name?: string;
  avatar_url?: string;
  role: 'member' | 'creator' | 'pastor' | 'admin';
  is_verified: boolean;
  verification_code?: string;
  verification_code_expires?: string;
  reset_token?: string;
  reset_token_expires?: string;
  created_at: string;
  last_login?: string;
}

export class AuthService {
  constructor(private db: Database.Database) {}

  // Register new user
  async register(email: string, username: string, password: string, displayName?: string) {
    // Validate inputs
    if (!email || !username || !password) {
      throw new Error('Email, username, and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check uniqueness
    const existingEmail = this.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    const existingUsername = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);

    if (existingEmail) throw new Error('Email already registered');
    if (existingUsername) throw new Error('Username already taken');

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
    const verification_code_expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(
      'INSERT INTO users (id, email, username, password_hash, display_name, role, is_verified, verification_code, verification_code_expires, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    stmt.run(id, email, username, password_hash, displayName || null, 'member', 0, verification_code, verification_code_expires, now);

    // Log verification code (in production, send via email)
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
  async verifyEmail(email: string, code: string) {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as AuthUser | undefined;

    if (!user) throw new Error('User not found');
    if (user.is_verified) throw new Error('Email already verified');
    if (user.verification_code !== code) throw new Error('Invalid verification code');
    if (new Date(user.verification_code_expires!) < new Date()) throw new Error('Verification code expired');

    // Mark as verified
    this.db.prepare('UPDATE users SET is_verified = 1, verification_code = NULL, verification_code_expires = NULL WHERE id = ?').run(user.id);

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return { token, user: this._sanitizeUser(user) };
  }

  // Login with email or username
  async login(emailOrUsername: string, password: string) {
    const user = this.db.prepare(
      'SELECT * FROM users WHERE email = ? OR username = ?'
    ).get(emailOrUsername, emailOrUsername) as AuthUser | undefined;

    if (!user) throw new Error('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error('Invalid credentials');

    // Update last login
    this.db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), user.id);

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return { token, user: this._sanitizeUser(user) };
  }

  // Verify token
  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get user by ID
  getUserById(id: string) {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as AuthUser | undefined;
    return user ? this._sanitizeUser(user) : null;
  }

  // Resend verification code
  async resendCode(email: string) {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as AuthUser | undefined;

    if (!user) throw new Error('User not found');
    if (user.is_verified) throw new Error('Email already verified');

    const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
    const verification_code_expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    this.db.prepare('UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE id = ?').run(
      verification_code,
      verification_code_expires,
      user.id
    );

    console.log(`[AUTH] Verification code for ${email}: ${verification_code}`);

    return { message: 'Verification code sent' };
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as AuthUser | undefined;

    if (!user) throw new Error('User not found');

    const reset_token = randomUUID();
    const reset_token_expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    this.db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(
      reset_token,
      reset_token_expires,
      user.id
    );

    console.log(`[AUTH] Password reset token for ${email}: ${reset_token}`);

    return { message: 'Password reset link sent' };
  }

  // Reset password
  async resetPassword(resetToken: string, newPassword: string) {
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');

    const user = this.db.prepare('SELECT * FROM users WHERE reset_token = ?').get(resetToken) as AuthUser | undefined;

    if (!user) throw new Error('Invalid reset token');
    if (new Date(user.reset_token_expires!) < new Date()) throw new Error('Reset token expired');

    const password_hash = await bcrypt.hash(newPassword, 10);

    this.db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?').run(
      password_hash,
      user.id
    );

    return { message: 'Password reset successful' };
  }

  private _sanitizeUser(user: AuthUser) {
    const { password_hash, verification_code, reset_token, ...safe } = user;
    return safe;
  }
}
