import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  X,
  Heart,
  MessageSquare,
  Phone,
  Sparkles,
  UserPlus,
  ExternalLink,
  Circle,
  Eye,
  EyeOff,
  Filter,
  Volume2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Avatar } from '../common/Avatar';
import { AppNotification } from '../../types';
import { soundEffects } from '../../services/audio';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const { setActiveConversationId, conversations } = useChat();
  const { notificationStatus, requestNotificationPermission, sendTestNotification } = usePermissions();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'interactions' | 'chats'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === 'unread') return !notif.isRead;
      if (activeFilter === 'interactions') return notif.type === 'like' || notif.type === 'comment' || notif.type === 'follow';
      if (activeFilter === 'chats') return notif.type === 'chat' || notif.type === 'call';
      return true;
    });
  }, [notifications, activeFilter]);

  if (!isOpen) return null;

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }

    if (notif.type === 'chat' && notif.actionId) {
      setActiveConversationId(notif.actionId);
      window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'chat' } }));
      onClose();
    } else if (notif.type === 'chat') {
      window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'chat' } }));
      onClose();
    } else if (notif.type === 'like' || notif.type === 'comment') {
      window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'feed' } }));
      onClose();
    } else if (notif.type === 'call') {
      window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'chat' } }));
      onClose();
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          </div>
        );
      case 'comment':
        return (
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        );
      case 'chat':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        );
      case 'call':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
        );
      case 'follow':
        return (
          <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div
      id="notifications-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-16 sm:pt-4 bg-black/80 backdrop-blur-2xl animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        id="notifications-center-panel"
        className="w-full max-w-lg rounded-3xl bg-[#080c20]/95 backdrop-blur-3xl border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh] text-white overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white shadow-md shadow-blue-500/30 animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Activity, interactions, chats & read receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={markAllAsRead}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                id="clear-all-notifs-btn"
                onClick={clearAllNotifications}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 border border-white/10 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[#050818]/60 flex-shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'unread'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('interactions')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'interactions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Likes & Comments
          </button>

          <button
            onClick={() => setActiveFilter('chats')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'chats'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Chats & Calls
          </button>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-0">
          {/* Notification Permission Status Banner if not granted */}
          {notificationStatus !== 'granted' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2.5 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">Browser Notifications Off</p>
                  <p className="text-[10px] text-slate-300 truncate">Enable to get sound & push alerts for incoming calls</p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md flex-shrink-0 transition-all active:scale-95"
              >
                Allow Alerts
              </button>
            </div>
          )}

          {notificationStatus === 'granted' && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] mb-2">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Push & Chimes Enabled</span>
              </span>
              <button
                type="button"
                onClick={sendTestNotification}
                className="text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-medium"
              >
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>Test Alert</span>
              </button>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">No notifications found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {activeFilter === 'unread'
                  ? "You've read all your notifications! Great job staying caught up."
                  : 'You will receive alerts when people comment, like, send messages, or start calls.'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notif) => {
                let timeAgo = 'Just now';
                try {
                  timeAgo = formatDistanceToNow(notif.timestamp, { addSuffix: true });
                } catch {}

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.18 }}
                    id={`notif-item-${notif.id}`}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      notif.isRead
                        ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300'
                        : 'bg-blue-600/10 hover:bg-blue-600/15 border-blue-500/30 text-white shadow-lg shadow-blue-500/5'
                    }`}
                  >
                    {/* Avatar or Type Icon */}
                    <div className="relative flex-shrink-0">
                      {notif.avatar ? (
                        <div className="relative">
                          <Avatar src={notif.avatar} name={notif.title} size="md" />
                          <div className="absolute -bottom-1 -right-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                        </div>
                      ) : (
                        getNotificationIcon(notif.type)
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-200' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {timeAgo}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Read / Unread receipt indicator & Action tools */}
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {notif.isRead ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <CheckCheck className="w-3 h-3 text-blue-400" />
                              <span>Read</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                              <span>Unread</span>
                            </span>
                          )}

                          {notif.actionId && (
                            <span className="text-[10px] text-blue-300 group-hover:underline inline-flex items-center gap-0.5">
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        {/* Read/Unread Receipt Toggle and Delete */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notif.isRead) {
                                markAsUnread(notif.id);
                              } else {
                                markAsRead(notif.id);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                          >
                            {notif.isRead ? (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer info & Push Permission Banner */}
        <div className="p-3 sm:p-3.5 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span className="text-[11px]">
            {unreadCount === 0 ? 'All receipts up to date' : `${unreadCount} unread receipt${unreadCount > 1 ? 's' : ''}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
