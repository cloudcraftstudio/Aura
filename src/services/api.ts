import { UserProfile, SocialPost, UserStory, Conversation, ChatMessage, PostComment } from '../types';

const API_BASE = '/api';

class ApiService {
  private isServerAvailable: boolean = true;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      this.isServerAvailable = true;
      return (await res.json()) as T;
    } catch (err) {
      console.warn(`Server API call failed for ${endpoint}, using local state fallback`, err);
      this.isServerAvailable = false;
      return null;
    }
  }

  // --- Users & Auth ---
  public async getUsers(): Promise<UserProfile[] | null> {
    return this.request<UserProfile[]>('/users');
  }

  public async getUser(id: string): Promise<UserProfile | null> {
    return this.request<UserProfile>(`/users/${id}`);
  }

  public async checkEmail(email: string): Promise<{ exists: boolean; hasPassword?: boolean; name?: string; avatarUrl?: string; handle?: string; authProvider?: string } | null> {
    return this.request<{ exists: boolean; hasPassword?: boolean; name?: string; avatarUrl?: string; handle?: string; authProvider?: string }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async register(name: string, email: string, handle?: string, avatarUrl?: string, bio?: string, password?: string): Promise<UserProfile | null> {
    return this.request<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, handle, avatarUrl, bio, password }),
    });
  }

  public async login(emailOrUserId: string, password?: string): Promise<UserProfile | null> {
    const isEmail = emailOrUserId.includes('@');
    return this.request<UserProfile>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(isEmail ? { email: emailOrUserId, password } : { userId: emailOrUserId, password }),
    });
  }

  public async setPassword(userId: string, newPassword: string, currentPassword?: string): Promise<UserProfile | null> {
    return this.request<UserProfile>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword, currentPassword }),
    });
  }

  public async googleAuth(name: string, email: string, avatarUrl?: string, googleId?: string): Promise<UserProfile | null> {
    return this.request<UserProfile>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ name, email, avatarUrl, googleId }),
    });
  }

  public async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    return this.request<UserProfile>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async setUserStatus(id: string, status: string, statusMessage?: string): Promise<UserProfile | null> {
    return this.request<UserProfile>(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, statusMessage }),
    });
  }

  // --- Posts ---
  public async getPosts(): Promise<SocialPost[] | null> {
    return this.request<SocialPost[]>('/posts');
  }

  public async createPost(postData: Partial<SocialPost>): Promise<SocialPost | null> {
    return this.request<SocialPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  public async deletePost(postId: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/posts/${postId}`, {
      method: 'DELETE',
    });
    return Boolean(res?.success);
  }

  public async likePost(postId: string, userId: string): Promise<{ likesCount: number; likedByUserIds: string[] } | null> {
    return this.request<{ likesCount: number; likedByUserIds: string[] }>(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  public async addComment(postId: string, authorId: string, content: string): Promise<PostComment | null> {
    return this.request<PostComment>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ authorId, content }),
    });
  }

  public async bookmarkPost(postId: string, userId: string): Promise<{ savedByUserIds: string[] } | null> {
    return this.request<{ savedByUserIds: string[] }>(`/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // --- Stories ---
  public async getStories(): Promise<UserStory[] | null> {
    return this.request<UserStory[]>('/stories');
  }

  public async createStory(userId: string, mediaUrl: string, caption?: string): Promise<UserStory | null> {
    return this.request<UserStory>('/stories', {
      method: 'POST',
      body: JSON.stringify({ userId, mediaUrl, caption }),
    });
  }

  public async markStorySeen(storyId: string, userId: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/stories/${storyId}/view`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return Boolean(res?.success);
  }

  // --- Conversations & Messages ---
  public async getConversations(userId?: string): Promise<Conversation[] | null> {
    return this.request<Conversation[]>(`/conversations${userId ? `?userId=${userId}` : ''}`);
  }

  public async createConversation(creatorId: string, participantIds: string[], isGroup?: boolean, name?: string): Promise<Conversation | null> {
    return this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ creatorId, participantIds, isGroup, name }),
    });
  }

  public async getMessages(conversationId: string): Promise<ChatMessage[] | null> {
    return this.request<ChatMessage[]>(`/messages/${conversationId}`);
  }

  public async sendMessage(messageData: Partial<ChatMessage>): Promise<ChatMessage | null> {
    return this.request<ChatMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  public async addReaction(conversationId: string, messageId: string, emoji: string, userId: string): Promise<Record<string, string[]> | null> {
    return this.request<Record<string, string[]>>(`/messages/${conversationId}/${messageId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ emoji, userId }),
    });
  }

  // --- System ---
  public async getSystemInfo(): Promise<any> {
    return this.request<any>('/system/info');
  }

  public async exportDatabase(): Promise<any> {
    return this.request<any>('/system/export-db');
  }
}

export const api = new ApiService();
