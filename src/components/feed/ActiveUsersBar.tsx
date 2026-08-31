import React from 'react';
import { motion } from 'motion/react';
import { Radio, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';

interface ActiveUsersBarProps {
  onOpenProfile?: (userId: string) => void;
}

export const ActiveUsersBar: React.FC<ActiveUsersBarProps> = ({ onOpenProfile }) => {
  const { allUsers, user: currentUser } = useAuth();
  const { startCall } = useCall();
  const { startDirectConversation } = useChat();

  // Filter online users and place current user first
  const onlineUsers = allUsers
    .filter((u) => u.status === 'online' || u.status === 'busy')
    .sort((a, b) => (currentUser && a.id === currentUser.id ? -1 : currentUser && b.id === currentUser.id ? 1 : 0));

  if (onlineUsers.length === 0) {
    return null;
  }

  const handleStartCallWith = async (targetUser: (typeof allUsers)[0], isVideo = true) => {
    soundEffects.playTap();
    await startCall(targetUser, isVideo);
  };

  const handleStartChatWith = async (targetUser: (typeof allUsers)[0]) => {
    soundEffects.playTap();
    await startDirectConversation(targetUser);
    window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'chat' } }));
  };

  const handleOpenUserProfile = (userId: string) => {
    if (onOpenProfile) {
      onOpenProfile(userId);
    } else {
      window.dispatchEvent(new CustomEvent('open_user_profile', { detail: { userId } }));
    }
  };

  return (
    <div
      id="active-online-users-bar"
      className="mb-6 rounded-[28px] bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 p-4 backdrop-blur-2xl shadow-xl relative overflow-hidden"
    >
      {/* Glow ambient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <span>Online Now</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
              {onlineUsers.length} Active
            </span>
          </h3>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">Instant Connect</span>
      </div>

      {/* Users Horizontal Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {onlineUsers.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/30 transition-all flex-shrink-0 group"
          >
            {/* User Avatar with Green Ring */}
            <div className="relative cursor-pointer" onClick={() => handleOpenUserProfile(u.id)}>
              <div className="ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#070a1a] rounded-full">
                <Avatar src={u.avatarUrl} name={u.name} size="sm" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070a1a]" />
            </div>

            {/* Name and Status Message */}
            <div className="min-w-0 pr-1 cursor-pointer" onClick={() => handleOpenUserProfile(u.id)}>
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate max-w-[100px]">
                  {u.name.split(' ')[0]}
                </p>
                {u.isVerified && <Sparkles className="w-2.5 h-2.5 text-blue-400" />}
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {u.statusMessage || 'Active now'}
              </p>
            </div>

            {/* Quick Actions (Call & Chat) */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
              <button
                type="button"
                onClick={() => handleStartChatWith(u)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white transition-all shadow-sm"
                title={`Send message to ${u.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleStartCallWith(u, true)}
                className="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all shadow-sm border border-emerald-500/30"
                title={`Start video call with ${u.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
