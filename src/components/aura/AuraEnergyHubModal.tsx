import React from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Zap,
  BookOpen,
  Users,
  Volume2,
  VolumeX,
  X,
  Sliders,
  Check,
  Flame,
  Sun,
  Droplets,
  Moon,
  Radio
} from 'lucide-react';
import { useAuraEnergy, AuraTheme, THEME_NAMES, AuraIntensity } from '../../context/AuraEnergyContext';

export const AuraEnergyHubModal: React.FC = () => {
  const {
    isHubOpen,
    closeHub,
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
  } = useAuraEnergy();

  if (!isHubOpen) return null;

  const themeKeys = Object.keys(THEME_NAMES) as AuraTheme[];

  const getThemeIcon = (key: AuraTheme) => {
    switch (key) {
      case 'celestial-gold':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'living-water':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'holy-fire':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'cosmic-harmony':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'gentle-sanctuary':
        return <Moon className="w-4 h-4 text-blue-300" />;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#0a0d1d] border border-blue-500/30 rounded-3xl p-6 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow in modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1.5px] shadow-lg shadow-amber-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0a0d1d] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Aura Live Wallpaper & Energy</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Energy supplied by the Word & community connection</p>
            </div>
          </div>
          <button
            onClick={closeHub}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 relative z-10 pr-1">
          {/* Energy Resonance Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0e142e] to-indigo-950/40 border border-blue-500/30 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Aura Resonance Level
                </span>
              </div>
              <span className="text-sm font-black text-amber-400">{auraLevel}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-400 transition-all duration-700 shadow-md shadow-amber-500/50"
                style={{ width: `${auraLevel}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-200 font-semibold">{vibeTitle}</span>
              <span className="text-slate-400">{todayBursts} bursts charged today</span>
            </div>
          </div>

          {/* Test Energy Bursts Row */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Trigger Energy Burst (Experience the Vibe)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => triggerBurst('word', '✦ Word of Life Supplied')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all active:scale-95 group shadow-lg shadow-amber-500/10 text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-white font-bold">Word Energy</div>
                  <div className="text-[10px] text-amber-300/80">Celestial illumination</div>
                </div>
              </button>

              <button
                onClick={() => triggerBurst('community', '✦ Community Connection & Fellowship')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all active:scale-95 group shadow-lg shadow-cyan-500/10 text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-bold">Community Vibe</div>
                  <div className="text-[10px] text-cyan-300/80">Fellowship & love</div>
                </div>
              </button>
            </div>
          </div>

          {/* Wallpaper Theme Frequencies */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Aura Energy Frequencies (Themes)
            </label>
            <div className="space-y-2">
              {themeKeys.map((key) => {
                const isSelected = theme === key;
                const info = THEME_NAMES[key];
                return (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        {getThemeIcon(key)}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                          {info.name}
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{info.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                      {info.colors.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpaper Adjustments */}
          <div className="space-y-3 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Live Wallpaper Motion</div>
                <div className="text-[10px] text-slate-400">Dynamic particles & glowing aura fields</div>
              </div>
              <button
                onClick={() => setIsLiveEnabled(!isLiveEnabled)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  isLiveEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {isLiveEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Interactive Screen Tap Ripples</div>
                <div className="text-[10px] text-slate-400">Tap anywhere to emit gentle positive energy waves</div>
              </div>
              <button
                onClick={() => setInteractiveTaps(!interactiveTaps)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  interactiveTaps
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {interactiveTaps ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Energy Harmonic Chimes</div>
                <div className="text-[10px] text-slate-400">Gentle celestial tones on Word & community burst</div>
              </div>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  audioEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{audioEnabled ? 'Active' : 'Muted'}</span>
              </button>
            </div>

            {/* Particle Intensity Selector */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Aura Particle Intensity</span>
                <span className="text-[11px] text-blue-300 capitalize font-bold">{intensity}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['subtle', 'balanced', 'vibrant'] as AuraIntensity[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setIntensity(val)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      intensity === val
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end relative z-10">
          <button
            onClick={closeHub}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
