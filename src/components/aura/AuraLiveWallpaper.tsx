import React, { useEffect, useRef, useState } from 'react';
import { useAuraEnergy, THEME_NAMES, AuraBurstEventDetail } from '../../context/AuraEnergyContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface EnergyRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  speed: number;
  lineWidth: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FloatingVibeText {
  id: number;
  text: string;
  type: 'word' | 'community' | 'tap' | 'streak';
  x: number;
  y: number;
  createdAt: number;
}

export const AuraLiveWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, isLiveEnabled, intensity, interactiveTaps } = useAuraEnergy();
  const [floatingTexts, setFloatingTexts] = useState<FloatingVibeText[]>([]);

  const animFrameId = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Dynamic particle & effect stores
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<EnergyRing[]>([]);
  const sparksRef = useRef<Spark[]>([]);

  // Get active theme colors
  const themeConfig = THEME_NAMES[theme] || THEME_NAMES['celestial-gold'];
  const colors = themeConfig.colors;

  // Initialize background ambient particles
  const initParticles = (width: number, height: number) => {
    const count = intensity === 'subtle' ? 20 : intensity === 'balanced' ? 38 : 65;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const radius = Math.random() * 2.5 + 1.2;
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2, // Drift softly upward
        radius,
        baseRadius: radius,
        color,
        alpha: Math.random() * 0.4 + 0.1,
        maxAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = newParticles;
  };

  // Trigger energy burst animation
  const addBurst = (x: number, y: number, type: 'word' | 'community' | 'tap' | 'streak', text?: string) => {
    // Choose burst ring colors based on energy type
    const burstColor =
      type === 'word'
        ? '#F59E0B' // Golden Divine Word
        : type === 'community'
        ? '#06B6D4' // Electric Cyan Fellowship
        : type === 'streak'
        ? '#EC4899' // Radiant Love & Dedication
        : colors[0];

    const secondaryColor =
      type === 'word'
        ? '#FDE047'
        : type === 'community'
        ? '#8B5CF6'
        : colors[1] || '#3B82F6';

    // Outer and inner shockwave rings
    ringsRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.45,
      color: burstColor,
      alpha: 0.85,
      speed: 8.5,
      lineWidth: 3.5,
    });

    ringsRef.current.push({
      x,
      y,
      radius: 2,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.3,
      color: secondaryColor,
      alpha: 0.95,
      speed: 5.5,
      lineWidth: 2,
    });

    // Particle sparks bursting outward
    const sparkCount = type === 'tap' ? 12 : type === 'word' ? 32 : 28;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 5 + 2.5;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 35 + 25,
        size: Math.random() * 3 + 1.5,
        color: Math.random() > 0.4 ? burstColor : secondaryColor,
      });
    }

    // Add floating text badge if requested or default message
    if (text || type === 'word' || type === 'community') {
      const defaultText =
        text ||
        (type === 'word'
          ? '✦ Word Energy Supplied'
          : '✦ Community Connection Aura');

      const id = Date.now() + Math.random();
      setFloatingTexts((prev) => [
        ...prev.slice(-4), // keep max 5 floating texts
        {
          id,
          text: defaultText,
          type,
          x: Math.max(80, Math.min(window.innerWidth - 120, x)),
          y: Math.max(120, Math.min(window.innerHeight - 150, y)),
          createdAt: Date.now(),
        },
      ]);

      // Remove after 2.4 seconds
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, 2400);
    }
  };

  // Listen for programmatic aura bursts
  useEffect(() => {
    const handleBurst = (e: Event) => {
      const customEvent = e as CustomEvent<AuraBurstEventDetail>;
      const detail = customEvent.detail || { type: 'word' };
      const x = detail.x ?? window.innerWidth / 2;
      const y = detail.y ?? window.innerHeight / 3;
      addBurst(x, y, detail.type, detail.text);
    };

    window.addEventListener('aura_energy_burst', handleBurst);
    return () => window.removeEventListener('aura_energy_burst', handleBurst);
  }, [colors]);

  // Listen for user clicks / taps if interactive taps are enabled
  useEffect(() => {
    if (!interactiveTaps || !isLiveEnabled) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Don't trigger if clicked on an input, textarea or button directly inside forms
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.closest('input') ||
        target?.closest('textarea')
      ) {
        return;
      }

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Small gentle energy ripple on tap
      if (clientX > 0 || clientY > 0) {
        // Add subtle wave ring
        ringsRef.current.push({
          x: clientX,
          y: clientY,
          radius: 3,
          maxRadius: 140,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.45,
          speed: 4.2,
          lineWidth: 2,
        });

        // 6 small sparkles
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.5 + 1;
          sparksRef.current.push({
            x: clientX,
            y: clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 20,
            size: 2,
            color: colors[0],
          });
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [interactiveTaps, isLiveEnabled, colors]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isLiveEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    initParticles(width, height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles(width, height);
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let time = 0;

    const render = () => {
      if (!isVisibleRef.current) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Multi-Color Ambient Aura Radiance Blobs
      const primaryColor = colors[0];
      const secondaryColor = colors[1] || colors[0];
      const tertiaryColor = colors[2] || colors[0];

      // Top-left pulsing aura wave
      const grad1 = ctx.createRadialGradient(
        width * 0.15 + Math.sin(time * 0.6) * 40,
        height * 0.15 + Math.cos(time * 0.5) * 40,
        0,
        width * 0.15,
        height * 0.15,
        width * 0.45
      );
      grad1.addColorStop(0, `${primaryColor}22`);
      grad1.addColorStop(0.5, `${primaryColor}0a`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-right breathing warmth
      const grad2 = ctx.createRadialGradient(
        width * 0.85 + Math.cos(time * 0.7) * 45,
        height * 0.8 + Math.sin(time * 0.4) * 45,
        0,
        width * 0.85,
        height * 0.8,
        width * 0.48
      );
      grad2.addColorStop(0, `${secondaryColor}1e`);
      grad2.addColorStop(0.6, `${secondaryColor}08`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Center subtle resonance glow
      const grad3 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.3) * 30,
        height * 0.5 + Math.cos(time * 0.3) * 30,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.35
      );
      grad3.addColorStop(0, `${tertiaryColor}15`);
      grad3.addColorStop(1, 'transparent');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Floating Stardust / Aura Particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Pulse alpha
        const pulse = Math.sin(time * 2 + p.pulseOffset);
        const currentAlpha = Math.max(0.05, p.alpha + pulse * 0.15);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Expanding Energy Rings (Shockwaves from Word / Community bursts)
      const rings = ringsRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += r.speed;
        r.alpha *= 0.94; // Fade out

        if (r.radius >= r.maxRadius || r.alpha <= 0.01) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.lineWidth;
        ctx.globalAlpha = r.alpha;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Burst Spark Particles
      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.95; // drag
        s.vy *= 0.95;
        s.life++;

        const lifeRatio = 1 - s.life / s.maxLife;
        if (lifeRatio <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = lifeRatio * 0.9;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLiveEnabled, theme, intensity, colors]);

  if (!isLiveEnabled) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft static fallback ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#070918] to-[#04050b]" />
      </div>
    );
  }

  return (
    <>
      {/* Live Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Floating Positive Vibe & Word Energy Banners */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingTexts.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute animate-float-fade flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0b0f22]/90 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-black shadow-[0_0_25px_rgba(245,158,11,0.4)] backdrop-blur-md whitespace-nowrap select-none"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{item.text}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80 px-1.5 py-0.5 rounded-md bg-amber-500/20">
              Positive Vibe
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
