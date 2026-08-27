import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Video, PhoneOff, Music2, Radio } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';

export const IncomingCallBanner: React.FC = () => {
  const { incomingCall, answerCall, declineCall } = useCall();

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <div
        id="incoming-call-overlay"
        className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-4 sm:pt-8 px-4"
      >
        {/* Soft backdrop blur banner */}
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          id="incoming-call-card"
          className="pointer-events-auto w-full max-w-lg p-5 sm:p-6 rounded-[32px] bg-slate-950/90 border-2 border-emerald-500/40 shadow-[0_20px_70px_rgba(16,185,129,0.35)] backdrop-blur-2xl text-white"
        >
          {/* Header Tag */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>INCOMING CALL</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Music2 className="w-3.5 h-3.5 animate-bounce" />
              <span>Mario Ringtone</span>
            </div>
          </div>

          {/* Caller Profile Card */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar src={incomingCall.callerAvatar} name={incomingCall.callerName} size="xl" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {incomingCall.callerName}
              </h3>
              <p className="text-xs text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                Online &bull; Requesting {incomingCall.isVideo ? 'HD Video Call' : 'Voice Call'}
              </p>
            </div>
          </div>

          {/* Call Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              id="decline-call-btn"
              onClick={declineCall}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 transition-all font-semibold text-xs sm:text-sm active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Decline</span>
            </button>

            <button
              id="answer-audio-call-btn"
              onClick={() => answerCall(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-600 hover:text-white border border-cyan-500/40 transition-all font-semibold text-xs sm:text-sm active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Voice</span>
            </button>

            {incomingCall.isVideo && (
              <button
                id="answer-video-call-btn"
                onClick={() => answerCall(true)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Accept Video</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
