import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useAuraEnergy } from '../../context/AuraEnergyContext';
import { soundEffects } from '../../services/audio';

export const AuraEnergyQuickPill: React.FC = () => {
  const { auraLevel, openHub, isLiveEnabled } = useAuraEnergy();

  return (
    <button
      onClick={() => {
        soundEffects.playTap();
        openHub();
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 hover:from-amber-500/20 hover:to-blue-500/20 border border-amber-500/30 text-amber-200 transition-all active:scale-95 group shadow-[0_0_12px_rgba(245,158,11,0.15)] cursor-pointer"
      title="Aura Energy & Live Wallpaper Settings"
    >
      <div className="relative flex items-center justify-center">
        <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        {isLiveEnabled && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        )}
      </div>
      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black tracking-tight">
        <span className="hidden xs:inline text-amber-300">Aura</span>
        <span className="text-white">{auraLevel}%</span>
      </div>
    </button>
  );
};
