import React from 'react';
import { motion } from 'motion/react';
import { Phone, Video, PhoneOff } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';

export const IncomingCallBanner: React.FC = () => {
  const { incomingCall, answerCall, declineCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div
      id="incoming-call-overlay"
      className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-6 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.9 }}
        id="incoming-call-card"
        className="pointer-events-auto w-full max-w-md p-4 rounded-3xl glass-card bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-2xl text-white flex items-center justify-between gap-4 animate-pulse"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Avatar src={incomingCall.callerAvatar} name={incomingCall.callerName} size="lg" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              {incomingCall.callerName}
            </h4>
            <p className="text-xs text-cyan-300 font-medium">
              Incoming {incomingCall.isVideo ? 'WebRTC Video' : 'Audio'} Call...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="decline-call-btn"
            onClick={declineCall}
            className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all shadow-lg hover:scale-105"
            title="Decline"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {incomingCall.isVideo && (
            <button
              id="answer-video-call-btn"
              onClick={() => answerCall(true)}
              className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all shadow-lg hover:scale-105"
              title="Answer with Video"
            >
              <Video className="w-5 h-5" />
            </button>
          )}

          <button
            id="answer-audio-call-btn"
            onClick={() => answerCall(false)}
            className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/30 transition-all shadow-lg hover:scale-105"
            title="Answer Audio"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
