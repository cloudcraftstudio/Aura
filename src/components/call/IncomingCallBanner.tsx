import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Video, PhoneOff, ShieldCheck } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';

const CALLING_CARDS = [
  '/cards/callingcard1.jpeg',
  '/cards/callingcard2.jpeg',
  '/cards/callingcard3.jpeg',
  '/cards/callingcard4.jpeg',
  '/cards/callingcard5.jpg',
  '/cards/callingcard6.jpg',
  '/cards/callingcard7.jpg',
  '/cards/callingcard8.jpg',
  '/cards/callingcard9.jpg'
];

export const IncomingCallBanner: React.FC = () => {
  const { incomingCall, answerCall, declineCall } = useCall();
  const [selectedCard, setSelectedCard] = useState<string>(CALLING_CARDS[0]);

  // Pick a fresh card each time an incoming call arrives
  useEffect(() => {
    if (incomingCall) {
      const storedIndex = parseInt(localStorage.getItem('aura_last_card_idx') || '-1', 10);
      const nextIndex = (storedIndex + 1) % CALLING_CARDS.length;
      localStorage.setItem('aura_last_card_idx', nextIndex.toString());
      setSelectedCard(CALLING_CARDS[nextIndex]);
    }
  }, [incomingCall?.id, incomingCall?.roomId]);

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <div
        id="incoming-call-overlay"
        className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-black select-none"
      >
        {/* Full-Screen Rotating Artwork Layer */}
        <motion.div
          key={selectedCard}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${selectedCard})` }}
        >
          {/* Ambient Lighting Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/95" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/70" />
        </motion.div>

        {/* Top Header & Caller Identity */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative z-10 pt-12 sm:pt-16 px-6 flex flex-col items-center text-center"
        >
          {/* Security & Call Type Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl mb-6 shadow-lg shadow-black/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold tracking-wider text-white/90 uppercase">
              Encrypted HD {incomingCall.isVideo ? 'Video' : 'Voice'} Call
            </span>
          </div>

          {/* Caller Avatar with Pulsing Signal Ring */}
          <div className="relative mb-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute -inset-2.5 rounded-full border-2 border-amber-400/60"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
              className="absolute -inset-5 rounded-full border border-amber-400/30"
            />
            <div className="relative rounded-full ring-2 ring-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.35)] overflow-hidden">
              <Avatar src={incomingCall.callerAvatar} name={incomingCall.callerName} size="xl" />
            </div>
          </div>

          {/* Caller Name */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {incomingCall.callerName}
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-amber-200/90 drop-shadow">
            Incoming Call...
          </p>
        </motion.div>

        {/* Bottom Call Controls */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="relative z-10 pb-12 sm:pb-16 px-8 max-w-md mx-auto w-full"
        >
          <div className="flex items-center justify-around gap-6">
            {/* Decline Action */}
            <div className="flex flex-col items-center gap-2">
              <button
                id="decline-call-btn"
                type="button"
                onClick={declineCall}
                className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-rose-600/80 hover:bg-rose-600 active:scale-90 text-white border border-rose-400/30 shadow-[0_0_30px_rgba(225,29,72,0.5)] backdrop-blur-xl transition-all"
              >
                <PhoneOff className="w-8 h-8 rotate-[-135deg]" />
              </button>
              <span className="text-xs font-semibold text-rose-200/90 tracking-wide uppercase">
                Decline
              </span>
            </div>

            {/* Answer Action */}
            <div className="flex flex-col items-center gap-2">
              <button
                id="answer-call-btn"
                type="button"
                onClick={() => answerCall(incomingCall.isVideo)}
                className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-emerald-500/80 hover:bg-emerald-500 active:scale-90 text-white border border-emerald-300/40 shadow-[0_0_35px_rgba(16,185,129,0.6)] backdrop-blur-xl transition-all relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-300"
                />
                {incomingCall.isVideo ? (
                  <Video className="w-8 h-8 fill-current" />
                ) : (
                  <Phone className="w-8 h-8 fill-current" />
                )}
              </button>
              <span className="text-xs font-semibold text-emerald-200/90 tracking-wide uppercase">
                {incomingCall.isVideo ? 'Accept Video' : 'Accept Audio'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
