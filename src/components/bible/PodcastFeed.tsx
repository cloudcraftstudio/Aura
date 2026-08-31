import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Video,
  Mic,
  Plus,
  X,
  Youtube,
  Upload,
  CheckCircle2,
  BookOpen,
  Radio,
  Clock,
  Sparkles,
  Search,
  Volume2
} from 'lucide-react';
import { soundEffects } from '../../services/audio';

export interface SermonItem {
  id: string;
  title: string;
  speaker?: string;
  scriptureRef?: string;
  description?: string;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  youtubeId?: string;
  duration?: number | string;
  dateRecorded?: string;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export function PodcastFeed({ onStudyPassage }: { onStudyPassage?: (scriptureRef: string) => void }) {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Player State
  const [playingSermon, setPlayingSermon] = useState<SermonItem | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);



  // Live Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingTime, setAudioRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bible/sermons');
      if (res.ok) {
        const data = await res.json();
        setSermons(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load sermons:', e);
    } finally {
      setLoading(false);
    }
  };


  // Live Audio Recorder Handlers
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const autoTitle = `Live Audio Sermon - ${new Date().toLocaleDateString()}`;
        const formData = new FormData();
        formData.append('file', audioBlob, 'live_sermon.webm');
        formData.append('title', autoTitle);

        try {
          const upRes = await fetch('/api/bible/media/upload', {
            method: 'POST',
            body: formData
          });
          if (upRes.ok) {
            const data = await upRes.json();
            await fetch('/api/bible/sermons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: autoTitle,
                speaker: 'Live Recording',
                mediaType: 'audio',
                mediaUrl: data.url,
                dateRecorded: new Date().toISOString().split('T')[0]
              })
            });
            fetchSermons();
          }
        } catch (err) {
          console.error('Failed to save live audio:', err);
        }
      };

      recorder.start();
      setIsRecordingAudio(true);
      setAudioRecordingTime(0);
      timerRef.current = setInterval(() => {
        setAudioRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecordingAudio(false);
      clearInterval(timerRef.current);
    }
  };

  const filtered = sermons.filter((s) => {
    const isYt = Boolean(s.youtubeId) || Boolean(extractYouTubeId(s.mediaUrl || ''));
    const isVid = s.mediaType === 'video' || isYt || (s.mediaUrl || '').match(/\.(mp4|webm|mov)$/i);
    const matchesTab = activeTab === 'video' ? isVid : !isVid;
    const matchesSearch =
      !searchTerm ||
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scriptureRef?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-400" />
            Sermons & Expositions
          </h2>
          <p className="text-xs text-slate-400 mt-1">Watch video messages or listen to audio recordings</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Audio Record Button */}
          {!isRecordingAudio ? (
            <button
              onClick={startAudioRecording}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              Record Audio
            </button>
          ) : (
            <button
              onClick={stopAudioRecording}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse"
            >
              <Mic className="w-4 h-4" />
              Stop Recording ({audioRecordingTime}s)
            </button>
          )}
        </div>
      </div>

      {/* Dual Tab Switcher: Video vs Audio */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'video' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Sermons</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audio' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Audio Sermons</span>
          </button>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sermons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Spotlight Player */}
      {playingSermon && (
        <div className="bg-black/90 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{playingSermon.title}</h3>
              <p className="text-xs text-amber-400">{playingSermon.speaker || 'Preacher'}</p>
            </div>
            <div className="flex items-center gap-2">
              {playingSermon.scriptureRef && onStudyPassage && (
                <button
                  onClick={() => onStudyPassage(playingSermon.scriptureRef!)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  Study {playingSermon.scriptureRef}
                </button>
              )}
              <button
                onClick={() => setPlayingSermon(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Render */}
          {(() => {
            const ytId = playingSermon.youtubeId || extractYouTubeId(playingSermon.mediaUrl || '');
            if (ytId) {
              return (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                    title={playingSermon.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            if (playingSermon.mediaType === 'video' || (playingSermon.mediaUrl || '').match(/\.(mp4|webm|mov)$/i)) {
              return (
                <video
                  ref={videoRef}
                  src={playingSermon.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[420px] rounded-xl bg-black"
                />
              );
            }
            const audioSrc = playingSermon.mediaUrl || (playingSermon as any).mp3Url || (playingSermon as any).cdnMp3Url;
            return (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Audio Playback</p>
                    <p className="text-[11px] text-slate-400">{playingSermon.title}</p>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioSrc}
                  controls
                  autoPlay
                  className="w-full accent-amber-500"
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Sermons List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading sermons...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-white/5 rounded-2xl">
          <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No {activeTab} sermons found</p>
          <p className="text-xs text-slate-500 mt-1">Add a YouTube link or record audio to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const ytId = s.youtubeId || extractYouTubeId(s.mediaUrl || '');
            return (
              <div
                key={s.id}
                className="bg-slate-900/60 border border-white/10 hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail for YouTube */}
                  {ytId && (
                    <div
                      onClick={() => setPlayingSermon(s)}
                      className="aspect-video w-full rounded-lg overflow-hidden relative mb-3 bg-black cursor-pointer group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold text-white text-sm line-clamp-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.speaker || 'Pastor'}</p>
                  {s.scriptureRef && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                      {s.scriptureRef}
                    </span>
                  )}
                  {s.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{s.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{s.dateRecorded || 'Recent'}</span>
                  <button
                    onClick={() => setPlayingSermon(s)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Play
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
