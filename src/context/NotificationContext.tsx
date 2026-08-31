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

const INITIAL_NOTIFICATIONS: AppNotification[] = [];


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
