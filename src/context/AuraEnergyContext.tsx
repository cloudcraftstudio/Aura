import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundEffects } from '../services/audio';

export type AuraTheme = 'celestial-gold' | 'living-water' | 'holy-fire' | 'cosmic-harmony' | 'gentle-sanctuary';
export type AuraIntensity = 'subtle' | 'balanced' | 'vibrant';

export interface AuraBurstEventDetail {
  type: 'word' | 'community' | 'tap' | 'streak';
  text?: string;
  x?: number;
  y?: number;
}

export interface AuraEnergyContextType {
  theme: AuraTheme;
  setTheme: (theme: AuraTheme) => void;
  isLiveEnabled: boolean;
  setIsLiveEnabled: (val: boolean) => void;
  intensity: AuraIntensity;
  setIntensity: (intensity: AuraIntensity) => void;
  auraLevel: number;
  todayBursts: number;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  interactiveTaps: boolean;
  setInteractiveTaps: (val: boolean) => void;
  vibeTitle: string;
  triggerBurst: (type: 'word' | 'community' | 'tap' | 'streak', text?: string, x?: number, y?: number) => void;
  isHubOpen: boolean;
  openHub: () => void;
  closeHub: () => void;
}

const AuraEnergyContext = createContext<AuraEnergyContextType | null>(null);

const THEME_NAMES: Record<AuraTheme, { name: string; desc: string; colors: string[] }> = {
  'celestial-gold': {
    name: 'Celestial Dawn',
    desc: 'Golden Word illumination & sacred morning light',
    colors: ['#F59E0B', '#EAB308', '#3B82F6', '#8B5CF6'],
  },
  'living-water': {
    name: 'Living Waters',
    desc: 'Deep ocean blues & clear cyan currents of spiritual renewal',
    colors: ['#06B6D4', '#3B82F6', '#6366F1', '#0EA5E9'],
  },
  'holy-fire': {
    name: 'Holy Spirit Flame',
    desc: 'Passionate crimson rose, gold & divine warmth',
    colors: ['#EF4444', '#F97316', '#EC4899', '#EAB308'],
  },
  'cosmic-harmony': {
    name: 'Cosmic Fellowship',
    desc: 'Connected violet auroras & vibrant community unity',
    colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'],
  },
  'gentle-sanctuary': {
    name: 'Sanctuary Night',
    desc: 'Soft starry silver & deep midnight peace for rest and reflection',
    colors: ['#64748B', '#94A3B8', '#38BDF8', '#818CF8'],
  },
};

export { THEME_NAMES };

export const AuraEnergyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AuraTheme>(() => {
    try {
      return (localStorage.getItem('aura_theme') as AuraTheme) || 'celestial-gold';
    } catch {
      return 'celestial-gold';
    }
  });

  const [isLiveEnabled, setIsLiveEnabledState] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('aura_live_enabled');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });

  const [intensity, setIntensityState] = useState<AuraIntensity>(() => {
    try {
      return (localStorage.getItem('aura_intensity') as AuraIntensity) || 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const [audioEnabled, setAudioEnabledState] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('aura_audio_enabled');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });

  const [interactiveTaps, setInteractiveTapsState] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('aura_interactive_taps');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });

  const [auraLevel, setAuraLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aura_energy_level');
      return saved ? Math.min(100, Math.max(30, parseInt(saved, 10))) : 82;
    } catch {
      return 82;
    }
  });

  const [todayBursts, setTodayBursts] = useState<number>(() => {
    try {
      const dateKey = `aura_bursts_${new Date().toISOString().slice(0, 10)}`;
      const saved = localStorage.getItem(dateKey);
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [isHubOpen, setIsHubOpen] = useState(false);

  const setTheme = (t: AuraTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem('aura_theme', t);
    } catch {}
  };

  const setIsLiveEnabled = (val: boolean) => {
    setIsLiveEnabledState(val);
    try {
      localStorage.setItem('aura_live_enabled', String(val));
    } catch {}
  };

  const setIntensity = (i: AuraIntensity) => {
    setIntensityState(i);
    try {
      localStorage.setItem('aura_intensity', i);
    } catch {}
  };

  const setAudioEnabled = (val: boolean) => {
    setAudioEnabledState(val);
    try {
      localStorage.setItem('aura_audio_enabled', String(val));
    } catch {}
  };

  const setInteractiveTaps = (val: boolean) => {
    setInteractiveTapsState(val);
    try {
      localStorage.setItem('aura_interactive_taps', String(val));
    } catch {}
  };

  const triggerBurst = useCallback(
    (type: 'word' | 'community' | 'tap' | 'streak', text?: string, x?: number, y?: number) => {
      // Dispatch custom event for the canvas wallpaper & overlay
      if (typeof window !== 'undefined') {
        const event = new CustomEvent<AuraBurstEventDetail>('aura_energy_burst', {
          detail: {
            type,
            text,
            x: x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : undefined),
            y: y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : undefined),
          },
        });
        window.dispatchEvent(event);
      }

      // Play soft harmonic audio chime if enabled
      if (audioEnabled) {
        soundEffects.playAuraBurst(type);
      }

      // Boost Aura level and bursts count
      setAuraLevel((prev) => {
        const bump = type === 'word' ? 6 : type === 'community' ? 5 : type === 'streak' ? 12 : 2;
        const next = Math.min(100, prev + bump);
        try {
          localStorage.setItem('aura_energy_level', String(next));
        } catch {}
        return next;
      });

      setTodayBursts((prev) => {
        const next = prev + 1;
        try {
          const dateKey = `aura_bursts_${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(dateKey, String(next));
        } catch {}
        return next;
      });
    },
    [audioEnabled]
  );

  // Listen to global trigger event
  useEffect(() => {
    const handleGlobalTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<AuraBurstEventDetail>;
      if (customEvent.detail) {
        triggerBurst(
          customEvent.detail.type || 'word',
          customEvent.detail.text,
          customEvent.detail.x,
          customEvent.detail.y
        );
      }
    };

    window.addEventListener('trigger_aura_burst', handleGlobalTrigger);
    return () => window.removeEventListener('trigger_aura_burst', handleGlobalTrigger);
  }, [triggerBurst]);

  // Derive title based on current Aura level
  const vibeTitle =
    auraLevel >= 95
      ? 'Radiant Celestial Energy'
      : auraLevel >= 80
      ? 'High Positive Resonance'
      : auraLevel >= 65
      ? 'Harmonious Fellowship'
      : 'Calm Sanctuary Flow';

  return (
    <AuraEnergyContext.Provider
      value={{
        theme,
        setTheme,
        isLiveEnabled,
        setIsLiveEnabled,
        intensity,
        setIntensity,
        auraLevel,
        todayBursts,
        audioEnabled,
        setAudioEnabled,
        interactiveTaps,
        setInteractiveTaps,
        vibeTitle,
        triggerBurst,
        isHubOpen,
        openHub: () => setIsHubOpen(true),
        closeHub: () => setIsHubOpen(false),
      }}
    >
      {children}
    </AuraEnergyContext.Provider>
  );
};

export const useAuraEnergy = () => {
  const context = useContext(AuraEnergyContext);
  if (!context) {
    throw new Error('useAuraEnergy must be used within an AuraEnergyProvider');
  }
  return context;
};
