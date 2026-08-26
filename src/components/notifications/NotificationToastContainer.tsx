import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Phone, Heart, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/notifications';
import { Avatar } from '../common/Avatar';

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsub = notificationService.subscribe((notif) => {
      setToasts((prev) => [notif, ...prev.slice(0, 4)]);
      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== notif.id));
      }, 4500);
    });

    return () => unsub();
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      id="notification-toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            id={`toast-${toast.id}`}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl glass-card bg-slate-900/85 border border-white/20 shadow-2xl backdrop-blur-2xl text-white"
          >
            {toast.avatar ? (
              <Avatar src={toast.avatar} name={toast.title} size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {getIcon(toast.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-white truncate">{toast.title}</p>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{toast.body}</p>
            </div>

            <button
              id={`dismiss-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
