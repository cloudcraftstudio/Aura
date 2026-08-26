import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Shield, Zap, Fingerprint, Lock, ChevronRight } from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface MatrixSplashScreenProps {
  onEnter: () => void;
}

export const MatrixSplashScreen: React.FC<MatrixSplashScreenProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [touchCoordinates, setTouchCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [bootLogIndex, setBootLogIndex] = useState(0);

  const BOOT_LOGS = [
    'INITIALIZING AURA NEURAL LINK...',
    'CONNECTING TO SERVER NODES [OK]',
    'WEBRTC HD STREAMS ENCRYPTED [OK]',
    'DAILY INSPIRATION MATRIX LOADED [OK]',
    'TOUCH ANYWHERE TO WAKE UP AND ENTER',
  ];

  // Progressive terminal log ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBootLogIndex((prev) => (prev < BOOT_LOGS.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // Matrix Digital Rain Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Characters: Katakana, Latin, Cyrillic, Numbers, Cyber Glyphs
    const chars = '0123456789ABCDEF01010101XYZΩΨΔΣλπアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -100));
    const speeds: number[] = Array.from({ length: columns }, () => 0.6 + Math.random() * 0.8);

    const render = () => {
      // Semi-transparent fade to create iconic falling trail effect
      ctx.fillStyle = 'rgba(5, 6, 15, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is bright glowing white/neon cyan-green
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#10b981';
        ctx.fillText(char, x, y);

        // Body trails in emerald green and matrix cyan
        if (drops[i] > 1) {
          const prevY = (drops[i] - 1) * fontSize;
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#10b981';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#059669';
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, prevY);
        }

        // Reset drop to top with random delay after going off screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += speeds[i];
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleTriggerEnter = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isEntering) return;

    if (e && 'clientX' in e) {
      setTouchCoordinates({ x: e.clientX, y: e.clientY });
    } else if (e && 'touches' in e && e.touches[0]) {
      setTouchCoordinates({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }

    try {
      soundEffects.playMatrixEnter();
    } catch (err) {}

    setIsEntering(true);

    setTimeout(() => {
      onEnter();
    }, 700);
  };

  return (
    <div
      id="matrix-splash-screen"
      onClick={handleTriggerEnter}
      onTouchStart={handleTriggerEnter}
      className="fixed inset-0 z-[100] bg-[#03040b] select-none cursor-pointer flex flex-col items-center justify-between p-6 overflow-hidden"
    >
      {/* Background Matrix Rain Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-85" />

      {/* Ambient Vignette & Scanner Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(5,6,15,0.2)_0%,rgba(3,4,11,0.92)_85%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Top Cyber Telemetry Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between pt-4 text-emerald-400 font-mono text-[11px] tracking-widest border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AURA MATRIX PROTOCOL // ONLINE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-emerald-500/70">SEC_LEVEL: 0x7F</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300">
            PWA STANDALONE
          </span>
        </div>
      </div>

      {/* Central Matrix HUD & "Touch to Enter" Interactive Core */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-md px-4 space-y-6">
        {/* Glowing Matrix Hexagon Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative group"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black/70 backdrop-blur-2xl border-2 border-emerald-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] relative">
            <div className="absolute inset-0 rounded-3xl bg-emerald-400/10 animate-ping opacity-30 pointer-events-none" />
            <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
          {/* Cyber badge */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] tracking-widest uppercase shadow-lg">
            Aura Matrix
          </div>
        </motion.div>

        {/* Title and Cyber Subtext */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
            AURA NETWORK
          </h1>
          <p className="text-xs sm:text-sm font-mono text-emerald-300/80 tracking-wide max-w-sm">
            Encrypted Social Feed • Live HD WebRTC • Daily Inspiration
          </p>
        </div>

        {/* Dynamic Terminal Boot Log Stream */}
        <div className="w-full bg-black/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3.5 text-left font-mono text-[11px] text-emerald-400 space-y-1 shadow-2xl">
          {BOOT_LOGS.slice(0, bootLogIndex + 1).map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 truncate">
              <span className="text-emerald-500/50">&gt;</span>
              <span className={idx === bootLogIndex ? 'text-white font-bold animate-pulse' : 'opacity-80'}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Explicit Touch To Enter Trigger Button / Banner */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerEnter(e);
          }}
          className="group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(16,185,129,0.5)] border border-emerald-300 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Touch Anywhere to Enter</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-slate-500 font-mono text-[10px] border-t border-white/5 pt-3">
        <span>© 2026 AURA PROTOCOL</span>
        <span className="text-emerald-400/70 animate-pulse">TAP SCREEN TO INITIATE</span>
        <span>LATENCY: &lt;14ms</span>
      </div>

      {/* Warp / Dissolve Touch Expansion Animation */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 40, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{
              left: touchCoordinates?.x ?? '50%',
              top: touchCoordinates?.y ?? '50%',
            }}
            className="fixed w-20 h-20 -ml-10 -mt-10 rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-white shadow-[0_0_100px_white] pointer-events-none z-[110]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
