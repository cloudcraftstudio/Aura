import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Heart,
  RotateCcw,
  FastForward,
  Headphones
} from 'lucide-react';
import { RECOVERY_TEACHINGS_DATA } from '../../data/recoveryTeachings';
import { RecoveryTeaching } from '../../types/recovery';
import { soundEffects } from '../../services/audio';

export const RecoveryAudioFeed: React.FC = () => {
  const [teachings, setTeachings] = useState<RecoveryTeaching[]>(RECOVERY_TEACHINGS_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<RecoveryTeaching | null>(RECOVERY_TEACHINGS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch teachings from backend
  useEffect(() => {
    fetch('/api/recovery/teachings')
      .then(res => res.json())
      .then(data => {
        if (data.teachings && data.teachings.length > 0) {
          setTeachings(data.teachings);
        }
      })
      .catch(console.error);
  }, []);

  // Update audio element properties
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackRate, volume, isMuted]);

  const handlePlayTrack = (track: RecoveryTeaching) => {
    soundEffects.playTap();
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (sec: number) => {
    soundEffects.playTap();
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + sec));
    }
  };

  const toggleRate = () => {
    soundEffects.playTap();
    const rates = [1, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const toggleLike = (id: string) => {
    soundEffects.playTap();
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter teachings
  const filtered = teachings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Persistent Audio Player Bar / Hero Widget */}
      {currentTrack && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d1430] via-[#101b44] to-[#0d1430] border border-blue-500/30 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                <img
                  src={currentTrack.thumbnailUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                    Now Playing
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    📖 {currentTrack.scriptureRef}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {currentTrack.speaker}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => skipSeconds(-15)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                title="Rewind 15 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePlayTrack(currentTrack)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => skipSeconds(30)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                title="Forward 30 seconds"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Speed Button */}
              <button
                onClick={toggleRate}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Scrub Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 1720)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Feed Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Teachings' },
            { id: 'substance', label: 'Substance & Habits' },
            { id: 'deliverance', label: 'Deliverance Testimonies' },
            { id: 'purity', label: 'Purity & Mind' },
            { id: 'anxiety', label: 'Anxiety & Sleep' },
            { id: 'grace', label: 'Grace Over Shame' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playTap();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search audio teachings..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Teachings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(teaching => {
          const isThisTrackPlaying = currentTrack?.id === teaching.id && isPlaying;
          const isLiked = likedMap[teaching.id];

          return (
            <div
              key={teaching.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isThisTrackPlaying
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-xl shadow-blue-900/20'
                  : 'bg-white/5 hover:bg-white/[0.08] border-white/10'
              }`}
            >
              <div>
                {/* Top Image & Info Row */}
                <div className="flex gap-4 mb-3">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 group">
                    <img
                      src={teaching.thumbnailUrl}
                      alt={teaching.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={() => handlePlayTrack(teaching)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isThisTrackPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                        {teaching.category}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {teaching.duration}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {teaching.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {teaching.speaker}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {teaching.description}
                </p>

                {/* Key Quote */}
                {teaching.keyQuote && (
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/5 mb-3 text-xs italic text-blue-200 font-serif">
                    "{teaching.keyQuote}"
                  </div>
                )}
              </div>

              {/* Bottom Tags & Play Action */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-semibold border border-amber-500/20">
                    📖 {teaching.scriptureRef}
                  </span>
                  {teaching.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(teaching.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isLiked ? 'text-pink-400 bg-pink-500/20' : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handlePlayTrack(teaching)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isThisTrackPlaying
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isThisTrackPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isThisTrackPlaying ? 'Playing' : 'Listen'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
