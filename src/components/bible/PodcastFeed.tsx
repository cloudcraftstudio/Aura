import React, { useState, useEffect, useRef } from "react";
import { X,
  Play,
  Pause,
  Headphones,
  Video,
  Search,
  BookOpen,
  Sparkles,
  LayoutGrid,
  List,
  Clock,
  User,
  Volume2,
  ExternalLink,
  Flame,
  Radio
} from "lucide-react";

export interface SermonItem {
  id: string;
  title: string;
  speaker: string;
  speakerSlug?: string;
  speakerTitle?: string;
  speakerImage?: string;
  series?: string;
  scriptureRef?: string;
  description: string;
  duration?: string;
  format: "audio" | "video";
  source: "community" | "sermonindex";
  mediaUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  views?: number;
  publishedAt?: string;
}

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
];

export function PodcastFeed({
  onStudyPassage,
}: {
  onStudyPassage?: (scriptureRef: string) => void;
}) {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState<"audio" | "video">("audio");
  const [sourceFilter, setSourceFilter] = useState<"all" | "community" | "sermonindex">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeItem, setActiveItem] = useState<SermonItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SermonItem | null>(null);
  const [activePlayingVideo, setActivePlayingVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAllSermons = async () => {
    setLoading(true);
    let combined: SermonItem[] = [];

    // 1. Fetch SermonIndex Feed
    try {
      const resSI = await fetch("/api/bible/sermonindex/feed");
      const cType = resSI.headers.get("content-type") || "";
      if (resSI.ok && cType.includes("application/json")) {
        const siData = await resSI.json();
        const normalizedSI = (Array.isArray(siData) ? siData : []).map((item: any) => {
          const isVideo = item.mediaType === "video" || !!item.mp4Url || (!!item.youtubeId && !item.mp3Url);
          const audioStream = item.mp3Url || item.cdnMp3Url || (isVideo ? "" : item.mediaUrl);
          const videoStream = item.mp4Url || (isVideo ? item.mediaUrl : "");
          return {
            ...item,
            format: isVideo ? "video" : "audio",
            mediaUrl: isVideo ? videoStream : audioStream,
            mp3Url: audioStream,
            mp4Url: videoStream,
            source: "sermonindex" as const,
          };
        });
        combined = [...combined, ...normalizedSI];
      }
    } catch (e) {
      console.warn("Could not fetch SermonIndex feed:", e);
    }

    // 2. Fetch Community Podcasts (Safely check for JSON)
    try {
      const resComm = await fetch("/api/bible/community/sermons");
      const cType = resComm.headers.get("content-type") || "";
      if (resComm.ok && cType.includes("application/json")) {
        const commData = await resComm.json();
        const normalizedComm = (Array.isArray(commData) ? commData : []).map((item: any) => ({
          ...item,
          format: item.format || (item.youtubeId ? "video" : "audio"),
          source: "community" as const,
        }));
        combined = [...combined, ...normalizedComm];
      }
    } catch (e) {
      console.warn("Could not fetch community sermons:", e);
    }

    setSermons(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllSermons();
  }, []);

  const handlePlayAudio = (item: SermonItem) => {
    if (activeItem?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    setActiveItem(item);
    setIsPlaying(true);
    if (audioRef.current && item.mediaUrl) {
      audioRef.current.src = item.mediaUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Audio playback error:", err);
        setIsPlaying(false);
      });
    }
  };

  const filtered = sermons.filter((item) => {
    if (item.format !== formatFilter) return false;
    if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSpeaker = item.speaker?.toLowerCase().includes(q);
      const matchRef = item.scriptureRef?.toLowerCase().includes(q);
      const matchSeries = item.series?.toLowerCase().includes(q);
      if (!matchTitle && !matchSpeaker && !matchRef && !matchSeries) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* HERO SECTION WITH DYNAMIC GRAPHIC & EMBEDDED SWITCHER */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#0a0d14]">
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&auto=format&fit=crop&q=80"
            alt="Pulpit Worship Atmosphere"
            className="w-full h-full object-cover object-center filter blur-[1px] transform scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent" />
        <div className="absolute inset-0 bg-radial-vignette opacity-70" />

        <div className="relative px-6 pt-10 pb-8 sm:px-10 sm:pt-14 sm:pb-10 flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-[11px] font-bold text-blue-400 uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span>Pulpit & Expository Library</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Listen & Watch The Word
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Stream verified historical expositions, modern pulpit teachings, and community sermons across audio and video.
          </p>

          {/* DYNAMIC HERO SEGMENTED SWITCHER */}
          <div className="pt-3">
            <div className="inline-flex p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl gap-1">
              <button
                type="button"
                onClick={() => setFormatFilter("audio")}
                className={"flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all " + (formatFilter === "audio" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]" : "text-slate-400 hover:text-white")}
              >
                <Headphones className="w-4 h-4" />
                <span>Audio Sermons</span>
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter("video")}
                className={"flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all " + (formatFilter === "video" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]" : "text-slate-400 hover:text-white")}
              >
                <Video className="w-4 h-4" />
                <span>Video Sermons</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER, SEARCH & VIEW MODE BAR */}
      <div className="sticky top-2 z-10 bg-[#0a0d14]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-0.5">
          <button
            type="button"
            onClick={() => setSourceFilter("all")}
            className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap " + (sourceFilter === "all" ? "bg-white/15 text-white shadow border border-white/20" : "text-slate-400 hover:text-white")}
          >
            All Sources
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter("community")}
            className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap " + (sourceFilter === "community" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white")}
          >
            Community
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter("sermonindex")}
            className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 " + (sourceFilter === "sermonindex" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white")}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>SermonIndex</span>
          </button>
        </div>

        {/* Search & Grid/List Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speaker, passage, title..."
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={"p-1.5 rounded-lg transition-all " + (viewMode === "grid" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={"p-1.5 rounded-lg transition-all " + (viewMode === "list" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FEED CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 tracking-wider font-semibold uppercase">Streaming Sermon Library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-12 text-center space-y-2">
          <p className="text-base font-bold text-white">No sermons found matching this filter</p>
          <p className="text-xs text-slate-400">Try changing your search term, switching format, or selecting All Sources.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
          {filtered.map((sermon, idx) => {
            const cover = sermon.thumbnailUrl || sermon.speakerImage || FALLBACK_COVERS[idx % FALLBACK_COVERS.length];
            const isCurrent = activeItem?.id === sermon.id;

                        if (sermon.format === "video") {
              return (
                <div
                  key={sermon.id}
                  onClick={() => setSelectedVideo(sermon)}
                  className="cursor-pointer bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-blue-500/50 rounded-3xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full aspect-video bg-black overflow-hidden">
                      <img
                        src={cover}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tap to Watch</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className={"text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md " + (sermon.source === "sermonindex" ? "bg-indigo-600/90 text-white" : "bg-emerald-600/90 text-white")}>
                          {sermon.source === "sermonindex" ? "Historical Archive" : "Community"}
                        </span>
                        {sermon.duration && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sermon.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-white text-base leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {sermon.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-white">{sermon.speaker}</span>
                        {sermon.speakerTitle && <span className="text-slate-500 font-normal">• {sermon.speakerTitle}</span>}
                      </div>

                      {sermon.scriptureRef && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{sermon.scriptureRef}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            /* AUDIO CARD (SPOTIFY / DWELL AESTHETIC) */
            return (
              <div
                key={sermon.id}
                className={"bg-slate-900/60 backdrop-blur-md border rounded-3xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between " + (isCurrent ? "border-blue-500/80 ring-2 ring-blue-500/20" : "border-white/10 hover:border-blue-500/40")}
              >
                <div>
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={cover}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={"text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow " + (sermon.source === "sermonindex" ? "bg-indigo-600/90 text-white" : "bg-emerald-600/90 text-white")}>
                        {sermon.source === "sermonindex" ? "Historical Master" : "Community"}
                      </span>
                      {sermon.duration && (
                        <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sermon.duration}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(sermon)}
                        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95 group-hover:scale-110"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-black text-white text-base leading-snug line-clamp-2">{sermon.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-white">{sermon.speaker}</span>
                      {sermon.speakerTitle && <span className="text-slate-500 truncate">• {sermon.speakerTitle}</span>}
                    </div>

                    {sermon.scriptureRef && (
                      <p className="text-xs font-semibold text-blue-300">{sermon.scriptureRef}</p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-white/5 mt-3 pt-3">
                  {sermon.scriptureRef ? (
                    <button
                      type="button"
                      onClick={() => onStudyPassage && onStudyPassage(sermon.scriptureRef!)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Study Notes</span>
                    </button>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={() => handlePlayAudio(sermon)}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isCurrent && isPlaying ? "Pause" : "Listen"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCKED BOTTOM AUDIO PLAYER (DWELL / SPOTIFY BAR) */}
      {activeItem && (
        <div className="fixed bottom-3 inset-x-3 sm:inset-x-6 max-w-4xl mx-auto z-50 bg-[#0c1017]/95 backdrop-blur-2xl border border-white/15 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={activeItem.speakerImage || activeItem.thumbnailUrl || FALLBACK_COVERS[0]}
              alt={activeItem.title}
              className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse text-blue-400" />
                <span>Now Playing</span>
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{activeItem.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">{activeItem.speaker}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => handlePlayAudio(activeItem)}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN VIDEO MODAL PLAYER */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[#0b0f19] border border-white/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-1">
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-black text-sm sm:text-base leading-snug line-clamp-1">{selectedVideo.title}</h2>
                <p className="text-xs text-blue-400 font-semibold">{selectedVideo.speaker} {selectedVideo.scriptureRef ? `• ${selectedVideo.scriptureRef}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : selectedVideo.mediaUrl ? (
                <video controls autoPlay playsInline className="w-full h-full object-contain">
                  <source src={selectedVideo.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <Video className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No video stream available</p>
                </div>
              )}
            </div>

            {/* Footer with Direct App Pop-out */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] text-slate-500">Aura Media Live</span>
              {selectedVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  Watch on YouTube ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
