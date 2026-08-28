/**
 * Auth API Integration - Minimal wrapper for new auth endpoints
 */

const API_BASE = '/api/auth';

export interface AuthToken {
  token: string;
  user: any;
}

export const authAPI = {
  async register(email: string, username: string, password: string, displayName?: string) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, displayName })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async verifyEmail(email: string, code: string): Promise<AuthToken> {
    const res = await fetch(`${API_BASE}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async login(emailOrUsername: string, password: string): Promise<AuthToken> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async getMe(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      localStorage.removeItem('auth_token');
      return null;
    }
    return res.json();
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
  },

  async resendCode(email: string) {
    const res = await fetch(`${API_BASE}/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async resetPassword(resetToken: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};
