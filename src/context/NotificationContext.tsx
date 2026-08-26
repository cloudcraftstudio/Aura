import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { notificationService } from '../services/notifications';
import { offlineStorage, STORAGE_KEYS } from '../services/offlineStorage';
import { soundEffects } from '../services/audio';
import { DEMO_USERS } from '../data/mockData';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const NOTIFICATIONS_STORAGE_KEY = 'aura_persistent_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_init_1',
    type: 'like',
    title: 'Liam Vance liked your photo',
    body: 'Liked your northern lights snapshot 🌌✨',
    avatar: DEMO_USERS[2]?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    actionId: 'post_1',
    timestamp: Date.now() - 1000 * 60 * 12,
    isRead: false,
  },
  {
    id: 'notif_init_2',
    type: 'comment',
    title: 'Maya Chen commented on your post',
    body: '"The glassmorphic reflections look hyper clean. Loving the UI depth!"',
    avatar: DEMO_USERS[1]?.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    actionId: 'post_2',
    timestamp: Date.now() - 1000 * 60 * 45,
    isRead: false,
  },
  {
    id: 'notif_init_3',
    type: 'chat',
    title: 'New message from Liam Vance',
    body: 'I uploaded the raw 4K shots to the shared feed! Take a look when you get a chance.',
    avatar: DEMO_USERS[2]?.avatarUrl,
    actionId: 'conv_alex_liam',
    timestamp: Date.now() - 1000 * 60 * 120,
    isRead: false,
  },
  {
    id: 'notif_init_4',
    type: 'call',
    title: 'Completed WebRTC HD Call',
    body: 'Call with Maya Chen lasted 4m 18s with crystal-clear 1080p stream.',
    avatar: DEMO_USERS[1]?.avatarUrl,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    isRead: true,
  },
  {
    id: 'notif_init_5',
    type: 'system',
    title: 'Welcome to Aura Social & Calling',
    body: 'Explore the live feed, share 24-hour stories, or start an encrypted WebRTC call!',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    isRead: true,
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return offlineStorage.load<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Save to offline storage whenever notifications change
  useEffect(() => {
    offlineStorage.save(NOTIFICATIONS_STORAGE_KEY, notifications);
  }, [notifications]);

  // Subscribe to real-time notification events
  useEffect(() => {
    const unsub = notificationService.subscribe((incoming) => {
      setNotifications((prev) => {
        // Prevent exact duplicate notifications
        if (prev.some((n) => n.id === incoming.id)) {
          return prev;
        }
        return [incoming, ...prev];
      });
    });

    return () => unsub();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const openNotifications = () => {
    soundEffects.playTap();
    setIsNotificationsOpen(true);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      soundEffects.playTap();
    } catch {}
  };

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
    try {
      soundEffects.playTap();
    } catch {}
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      soundEffects.playLikeSparkle();
    } catch {}
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      soundEffects.playTap();
    } catch {}
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      soundEffects.playTap();
    } catch {}
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif = notificationService.notify({
      type: notif.type,
      title: notif.title,
      body: notif.body,
      avatar: notif.avatar,
      actionId: notif.actionId,
      playSound: true,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationsOpen,
        setIsNotificationsOpen,
        openNotifications,
        closeNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
