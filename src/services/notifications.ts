import { soundEffects } from './audio';
import { AppNotification } from '../types';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private listeners: ((notification: AppNotification) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (e) {
      console.warn('Push notification permission error:', e);
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  public subscribe(cb: (notification: AppNotification) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public notify(options: {
    type: AppNotification['type'];
    title: string;
    body: string;
    avatar?: string;
    actionId?: string;
    playSound?: boolean;
  }) {
    const notification: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: options.type,
      title: options.title,
      body: options.body,
      avatar: options.avatar,
      actionId: options.actionId,
      timestamp: Date.now(),
      isRead: false,
    };

    // Play chime based on type
    if (options.playSound !== false) {
      if (options.type === 'chat') {
        soundEffects.playMessageReceived();
      } else if (options.type === 'like') {
        soundEffects.playLikeSparkle();
      }
    }

    // Broadcast to in-app listeners
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });

    // Native browser push notification if permitted and window not focused
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const nativeNotif = new Notification(options.title, {
          body: options.body,
          icon: options.avatar || '/icon.png',
          tag: options.type + '_' + (options.actionId || 'general'),
        });
        nativeNotif.onclick = () => {
          window.focus();
          nativeNotif.close();
        };
      } catch (e) {
        // In iframe context or secure worker fallback
        console.warn('Native notification dispatch fallback:', e);
      }
    }

    return notification;
  }
  // Helper to convert VAPID public key
  private urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Register device for Android / Mobile background Push Notifications
  public async registerPushSubscription(userId: string) {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const res = await fetch("/api/push/vapid-key");
        const { publicKey } = await res.json();
        if (!publicKey) return null;

        const convertedKey = this.urlBase64ToUint8Array(publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: sub.toJSON() }),
      });

      console.log("Device successfully subscribed to background push notifications!");
      return sub;
    } catch (err) {
      console.warn("Background push registration failed:", err);
      return null;
    }
  }

}

export const notificationService = new NotificationService();
