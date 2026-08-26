import { OfflineSyncQueueItem } from '../types';

const STORAGE_KEYS = {
  POSTS: 'aura_cached_posts',
  CONVERSATIONS: 'aura_cached_conversations',
  STORIES: 'aura_cached_stories',
  CURRENT_USER: 'aura_active_user',
  SYNC_QUEUE: 'aura_sync_queue',
  NOTIFICATIONS: 'aura_notifications',
  BOOKMARKS: 'aura_bookmarks',
};

class OfflineStorageService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private onlineListeners: ((online: boolean) => void)[] = [];
  private broadcast: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true));
      window.addEventListener('offline', () => this.handleConnectionChange(false));

      try {
        if ('BroadcastChannel' in window) {
          this.broadcast = new BroadcastChannel('aura_sync_channel');
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  private handleConnectionChange(online: boolean) {
    this.isOnline = online;
    this.onlineListeners.forEach((cb) => cb(online));
    if (online) {
      this.processSyncQueue();
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public onConnectionChange(cb: (online: boolean) => void) {
    this.onlineListeners.push(cb);
    return () => {
      this.onlineListeners = this.onlineListeners.filter((l) => l !== cb);
    };
  }

  public broadcastEvent(type: string, payload: any) {
    try {
      if (this.broadcast) {
        this.broadcast.postMessage({ type, payload, timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Broadcast error:', e);
    }
  }

  public onBroadcastEvent(cb: (event: { type: string; payload: any }) => void) {
    if (!this.broadcast) return () => {};
    const handler = (e: MessageEvent) => {
      if (e.data) cb(e.data);
    };
    this.broadcast.addEventListener('message', handler);
    return () => {
      if (this.broadcast) {
        this.broadcast.removeEventListener('message', handler);
      }
    };
  }

  // Local storage caching methods
  public save<T>(key: string, data: T): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn(`Error saving key ${key}:`, e);
    }
  }

  public load<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
    }
    return fallback;
  }

  // Offline queue operations
  public enqueueSyncAction(type: OfflineSyncQueueItem['type'], payload: any): OfflineSyncQueueItem {
    const queue = this.getSyncQueue();
    const item: OfflineSyncQueueItem = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(item);
    this.save(STORAGE_KEYS.SYNC_QUEUE, queue);
    return item;
  }

  public getSyncQueue(): OfflineSyncQueueItem[] {
    return this.load<OfflineSyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  public removeSyncItem(id: string) {
    const queue = this.getSyncQueue().filter((item) => item.id !== id);
    this.save(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  public async processSyncQueue(processor?: (item: OfflineSyncQueueItem) => Promise<boolean>) {
    const queue = this.getSyncQueue();
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remaining: OfflineSyncQueueItem[] = [];

    for (const item of queue) {
      try {
        if (processor) {
          const success = await processor(item);
          if (success) {
            processedCount++;
          } else {
            item.retryCount++;
            if (item.retryCount < 5) remaining.push(item);
          }
        } else {
          // Default acknowledgment
          processedCount++;
        }
      } catch (e) {
        item.retryCount++;
        if (item.retryCount < 5) remaining.push(item);
      }
    }

    this.save(STORAGE_KEYS.SYNC_QUEUE, remaining);
    return processedCount;
  }
}

export const offlineStorage = new OfflineStorageService();
export { STORAGE_KEYS };
