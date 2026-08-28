import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search } from 'lucide-react';

interface Sermon {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scriptureRef?: string;
  description?: string;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  duration?: number;
}

export function PodcastFeed({ onStudyPassage }: { onStudyPassage?: (scriptureRef: string) => void }) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'speaker' | 'scripture' | 'series'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSermons();
  }, []);

  useEffect(() => {
    filterSermons();
  }, [sermons, searchTerm, filterType]);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bible/sermons');
      const data = await res.json();
      setSermons(data);
    } catch (error) {
      console.error('Failed to fetch sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSermons = () => {
    let filtered = sermons;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.speaker?.toLowerCase().includes(term) ||
        s.series?.toLowerCase().includes(term) ||
        s.scriptureRef?.toLowerCase().includes(term)
      );
    }

    setFilteredSermons(filtered);
  };

  const handlePlayPause = (sermon: Sermon) => {
    if (playingId === sermon.id) {
      audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
    } else {
      setPlayingId(sermon.id);
      if (audioRef.current && sermon.mediaUrl) {
        audioRef.current.src = sermon.mediaUrl;
        audioRef.current.play();
      }
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-300">Podcasts & Sermons</h2>

      {/* Search & Filter */}
      <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <Search className="w-5 h-5 text-gray-400 mt-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, speaker, series, or scripture..."
            className="flex-1 bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'speaker', 'scripture', 'series'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-900/30 text-gray-300 hover:bg-blue-900/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sermon List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading sermons...</div>
      ) : filteredSermons.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No sermons found</div>
      ) : (
        <div className="space-y-4">
          {filteredSermons.map(sermon => (
            <div key={sermon.id} className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handlePlayPause(sermon)}
                  className="flex-shrink-0 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  {playingId === sermon.id && audioRef.current && !audioRef.current.paused ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-blue-300">{sermon.title}</h3>
                  {sermon.speaker && <p className="text-sm text-gray-400">Speaker: {sermon.speaker}</p>}
                  {sermon.series && <p className="text-sm text-gray-400">Series: {sermon.series}</p>}
                  {sermon.scriptureRef && (
                    <p className="text-sm text-indigo-300 mt-1">{sermon.scriptureRef}</p>
                  )}
                  {sermon.description && (
                    <p className="text-sm text-gray-300 mt-2">{sermon.description}</p>
                  )}

                  {playingId === sermon.id && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSkip(-15)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Skip back 15s"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <div className="flex-1 bg-blue-900/50 rounded h-1">
                          <div
                            className="bg-blue-400 h-1 rounded"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <button
                          onClick={() => handleSkip(15)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Skip forward 15s"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <select
                          value={playbackRate}
                          onChange={e => {
                            const rate = parseFloat(e.target.value);
                            setPlaybackRate(rate);
                            if (audioRef.current) audioRef.current.playbackRate = rate;
                          }}
                          className="bg-blue-900/50 border border-blue-500/30 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value="1">1x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {sermon.scriptureRef && onStudyPassage && (
                  <button
                    onClick={() => onStudyPassage(sermon.scriptureRef!)}
                    className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                  >
                    Study This
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlayingId(null)}
      />
    </div>
  );
}
