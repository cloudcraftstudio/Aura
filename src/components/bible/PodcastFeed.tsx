import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Search,
  BookOpen,
  Video,
  Mic,
  Clock,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Radio,
  User,
  Headphones,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  X,
  Square,
  FileText,
  Quote,
  Maximize2,
  PlusCircle,
  Bookmark,
  FolderPlus,
  Film,
  UploadCloud,
  Plus,
  PlaySquare
} from 'lucide-react';
import { soundEffects } from '../../services/audio';

export interface SermonItem {
  id: string;
  title: string;
  speaker?: string;
  speakerSlug?: string;
  speakerImage?: string;
  speakerTitle?: string;
  broadcaster?: string;
  series?: string;
  scriptureRef?: string;
  scripture?: Array<{ bookId: string; chapter: number; verse?: number }>;
  description?: string;
  summary?: string;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  mp3Url?: string;
  cdnMp3Url?: string;
  mp4Url?: string;
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  duration?: number | string;
  durationSeconds?: number;
  dateRecorded?: string;
  category?: string;
  topics?: Array<{ name: string; slug: string }>;
  listenCount?: number;
  sermonAudioUrl?: string;
  url?: string;
  pdfUrl?: string;
  vttUrl?: string;
  outline?: string[];
  keyQuotes?: string[];
}

export interface PreacherInfo {
  id: string;
  slug: string;
  name: string;
  title: string;
  ministry: string;
  avatarUrl: string;
  bio: string;
  era: string;
  sermonCount: number;
  topTopics: string[];
}

export interface TopicInfo {
  name: string;
  slug: string;
  description?: string;
}

export function PodcastFeed({ onStudyPassage }: { onStudyPassage?: (scriptureRef: string) => void }) {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [speakers, setSpeakers] = useState<PreacherInfo[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [scriptureFilter, setScriptureFilter] = useState<string>('');
  const [viewSource, setViewSource] = useState<'all' | 'sermonindex' | 'local'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video'>('all');
  
  // Active playing sermon & playback mode
  const [playingSermon, setPlayingSermon] = useState<SermonItem | null>(null);
  const [playerTab, setPlayerTab] = useState<'player' | 'notes' | 'scripture'>('player');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  // Upload / Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addSpeaker, setAddSpeaker] = useState('');
  const [addScripture, setAddScripture] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addMediaType, setAddMediaType] = useState<'video' | 'audio'>('video');
  const [addMediaUrl, setAddMediaUrl] = useState('');
  const [addYoutubeId, setAddYoutubeId] = useState('');
  const [isSubmittingSermon, setIsSubmittingSermon] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Speakers Catalog
      const spRes = await fetch('/api/bible/sermonindex/speakers');
      if (spRes.ok) {
        const spData = await spRes.json();
        if (Array.isArray(spData)) setSpeakers(spData);
      }

      // 2. Fetch Topics Catalog
      const topRes = await fetch('/api/bible/sermonindex/topics');
      if (topRes.ok) {
        const topData = await topRes.json();
        if (Array.isArray(topData)) setTopics(topData);
      }

      // 3. Fetch Feed
      await loadSermonsFeed();
    } catch (error) {
      console.error('Failed to initialize SermonIndex feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isVideoSermon = (sermon: SermonItem): boolean => {
    if (sermon.mediaType === 'video') return true;
    if (Boolean(sermon.youtubeId)) return true;
    if (Boolean(sermon.mp4Url) || Boolean(sermon.videoUrl)) return true;
    const url = sermon.mediaUrl || sermon.cdnMp3Url || sermon.mp3Url || '';
    return /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(url) || url.includes('youtube') || url.includes('youtu.be');
  };

  const isAudioSermon = (sermon: SermonItem): boolean => {
    return !isVideoSermon(sermon);
  };

  const getVideoSource = (sermon: SermonItem): string => {
    return sermon.mp4Url || sermon.videoUrl || sermon.mediaUrl || '';
  };

  const getAudioSource = (sermon: SermonItem): string => {
    return sermon.cdnMp3Url || sermon.mp3Url || sermon.mediaUrl || '';
  };

  const loadSermonsFeed = async (options?: { speaker?: string; topic?: string; q?: string; scripture?: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.speaker && options.speaker !== 'all') params.append('speaker', options.speaker);
      if (options?.topic && options.topic !== 'All Topics' && options.topic !== 'all') params.append('topic', options.topic);
      if (options?.q) params.append('q', options.q);
      if (options?.scripture) params.append('scripture', options.scripture);

      const [indexRes, localRes] = await Promise.all([
        fetch(`/api/bible/sermonindex/feed?${params.toString()}`),
        fetch('/api/bible/sermons')
      ]);

      let indexItems: SermonItem[] = [];
      let localItems: SermonItem[] = [];

      if (indexRes.ok) {
        const data = await indexRes.json();
        if (Array.isArray(data)) indexItems = data;
      }

      if (localRes.ok) {
        const data = await localRes.json();
        if (Array.isArray(data)) {
          localItems = data.map((d: any) => {
            const isVid = d.mediaType === 'video' ||
              Boolean(d.youtubeId) ||
              Boolean(d.mp4Url) ||
              (typeof d.mediaUrl === 'string' && /\.(mp4|webm|mov)(\?.*)?$/i.test(d.mediaUrl));
            return {
              ...d,
              mediaType: isVid ? 'video' : 'audio',
              mp4Url: d.mp4Url || (isVid && !d.youtubeId ? d.mediaUrl : undefined),
              speaker: d.speaker || 'My Studio Broadcast',
              category: d.category || 'Studio Recording',
              topics: d.topics || [{ name: 'Studio', slug: 'studio' }]
            };
          });
        }
      }

      // Combine based on source selection
      let combined: SermonItem[] = [];
      if (viewSource === 'local') {
        combined = localItems;
      } else if (viewSource === 'sermonindex') {
        combined = indexItems;
      } else {
        combined = [...localItems, ...indexItems];
      }

      setSermons(combined);
    } catch (error) {
      console.error('Error fetching sermons feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakerSelect = (speakerName: string) => {
    soundEffects.playTap();
    const newSpeaker = selectedSpeaker === speakerName ? null : speakerName;
    setSelectedSpeaker(newSpeaker);
    loadSermonsFeed({
      speaker: newSpeaker || undefined,
      topic: selectedTopic,
      q: searchTerm,
      scripture: scriptureFilter
    });
  };

  const handleTopicSelect = (topicName: string) => {
    soundEffects.playTap();
    setSelectedTopic(topicName);
    loadSermonsFeed({
      speaker: selectedSpeaker || undefined,
      topic: topicName,
      q: searchTerm,
      scripture: scriptureFilter
    });
  };

  const handleScriptureQuickSearch = (ref: string) => {
    soundEffects.playTap();
    setScriptureFilter(ref);
    loadSermonsFeed({
      speaker: selectedSpeaker || undefined,
      topic: selectedTopic,
      q: searchTerm,
      scripture: ref
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playTap();
    loadSermonsFeed({
      speaker: selectedSpeaker || undefined,
      topic: selectedTopic,
      q: searchTerm,
      scripture: scriptureFilter
    });
  };

  const resetAllFilters = () => {
    soundEffects.playTap();
    setSelectedSpeaker(null);
    setSelectedTopic('All Topics');
    setScriptureFilter('');
    setSearchTerm('');
    setFilterType('all');
    setViewSource('all');
    loadSermonsFeed();
  };

  const handleSelectSermon = (sermon: SermonItem, tab: 'player' | 'notes' | 'scripture' = 'player') => {
    soundEffects.playTap();
    
    // Stop active audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setPlayingSermon(sermon);
    setPlayerTab(tab);
    setIsPlaying(true);
    setCurrentTime(0);
    setPushStatus(null);

    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const togglePlayPause = () => {
    soundEffects.playTap();
    if (!playingSermon) return;

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
      }
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.log('Video autoplay prevented:', err));
      }
      setIsPlaying(true);
    }
  };

  const handleSkip = (seconds: number) => {
    soundEffects.playTap();
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + seconds));
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + seconds));
    }
  };

  const handleSpeedChange = (speed: number) => {
    soundEffects.playTap();
    setPlaybackRate(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const handlePushToCourse = async (sermon: SermonItem) => {
    soundEffects.playTap();
    setPushStatus('Adding to course...');
    try {
      // Find or create default course
      const coursesRes = await fetch('/api/bible/courses');
      let courseId = '';
      if (coursesRes.ok) {
        const courses = await coursesRes.json();
        if (Array.isArray(courses) && courses.length > 0) {
          courseId = courses[0].id;
        }
      }

      if (!courseId) {
        const createCourseRes = await fetch('/api/bible/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Expository Sermon Discourses',
            description: 'Curated sermons and historic expositions from SermonIndex.net library'
          })
        });
        if (createCourseRes.ok) {
          const newCourse = await createCourseRes.json();
          courseId = newCourse.id;
        }
      }

      if (courseId) {
        const lessonRes = await fetch(`/api/bible/courses/${courseId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: sermon.title,
            scriptureRef: sermon.scriptureRef || (sermon.scripture?.[0] ? `${sermon.scripture[0].bookId} ${sermon.scripture[0].chapter}:${sermon.scripture[0].verse || ''}` : 'Biblical Exposition'),
            notes: `${sermon.summary || sermon.description || ''}\n\nPreacher: ${sermon.speaker || 'Unknown'}\nAudio Link: ${sermon.cdnMp3Url || sermon.mp3Url || sermon.mediaUrl || ''}`,
            mediaType: sermon.youtubeId ? 'youtube' : 'upload',
            mediaUrl: sermon.cdnMp3Url || sermon.mp3Url || sermon.mediaUrl || ''
          })
        });

        if (lessonRes.ok) {
          setPushStatus('Successfully added to Course Lessons!');
          setTimeout(() => setPushStatus(null), 3500);
        } else {
          setPushStatus('Failed to create lesson');
        }
      }
    } catch (err) {
      console.error('Error adding sermon to course:', err);
      setPushStatus('Error connecting to course engine');
    }
  };

  const formatSeconds = (sec: number | string | undefined) => {
    if (!sec) return '45:00';
    if (typeof sec === 'string') return sec;
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddSermonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) {
      setUploadFeedback('Please provide a sermon title.');
      return;
    }

    setIsSubmittingSermon(true);
    setUploadFeedback('Saving sermon to your library...');

    try {
      let isVid = addMediaType === 'video' || Boolean(addYoutubeId) || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(addMediaUrl);
      let youtubeId = addYoutubeId.trim();
      if (!youtubeId && addMediaUrl.includes('youtu')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = addMediaUrl.match(regExp);
        if (match && match[2].length === 11) {
          youtubeId = match[2];
          isVid = true;
        }
      }

      const res = await fetch('/api/bible/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addTitle.trim(),
          speaker: addSpeaker.trim() || 'My Ministry Preaching',
          scriptureRef: addScripture.trim() || 'Biblical Study',
          description: addDescription.trim(),
          mediaType: isVid ? 'video' : 'audio',
          mediaUrl: addMediaUrl.trim() || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
          mp4Url: isVid && !youtubeId ? addMediaUrl.trim() : undefined,
          videoUrl: isVid ? addMediaUrl.trim() : undefined,
          youtubeId: youtubeId || undefined,
          category: 'Studio Recording',
          topics: [{ name: 'Custom Message', slug: 'custom' }]
        })
      });

      if (res.ok) {
        soundEffects.playTap();
        setUploadFeedback('Sermon successfully added to your feed!');
        setTimeout(() => {
          setShowAddModal(false);
          setAddTitle('');
          setAddSpeaker('');
          setAddScripture('');
          setAddDescription('');
          setAddMediaUrl('');
          setAddYoutubeId('');
          setUploadFeedback(null);
          loadSermonsFeed();
        }, 1200);
      } else {
        setUploadFeedback('Failed to save sermon. Please check your inputs.');
      }
    } catch (err) {
      console.error('Error adding custom sermon:', err);
      setUploadFeedback('Error connecting to sermon database.');
    } finally {
      setIsSubmittingSermon(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format
    const isVideoFile = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name);
    setAddMediaType(isVideoFile ? 'video' : 'audio');
    
    // Auto populate title if blank
    if (!addTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      setAddTitle(cleanName);
    }

    const objectUrl = URL.createObjectURL(file);
    setAddMediaUrl(objectUrl);
    setUploadFeedback(`Selected local file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  const filteredSermons = sermons.filter((sermon) => {
    if (filterType === 'video') return isVideoSermon(sermon);
    if (filterType === 'audio') return isAudioSermon(sermon);
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-44 sm:pb-36">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/90 via-[#0c133a] to-indigo-950/90 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
              SermonIndex.net API v2 & Media Studio
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Free • Video & Audio Edge Streaming
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-400" />
            Historic & Video Sermon Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Stream classic audio MP3 expositions, high-definition MP4 videos, and verse-by-verse studies across Scripture without subscription gateways.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-10 flex-shrink-0">
          <button
            onClick={() => {
              soundEffects.playTap();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video / Sermon</span>
          </button>

          <div className="flex bg-black/50 p-1 rounded-2xl border border-white/15">
            <button
              onClick={() => {
                soundEffects.playTap();
                setViewSource('all');
                loadSermonsFeed();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewSource === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                setViewSource('sermonindex');
                loadSermonsFeed();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                viewSource === 'sermonindex'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3 h-3" />
              <span>SermonIndex</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                setViewSource('local');
                loadSermonsFeed();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                viewSource === 'local'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>My Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Upload Sermon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b102b] border-2 border-rose-500/50 rounded-3xl p-6 w-full max-w-lg shadow-2xl shadow-rose-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add Video or MP4 Sermon</h3>
                  <p className="text-xs text-slate-400">Import an MP4, video stream, or audio file into your library</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSermonSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sermon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Christ in All the Scriptures — Luke 24"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preacher / Speaker</label>
                  <input
                    type="text"
                    placeholder="e.g., Pastor David"
                    value={addSpeaker}
                    onChange={(e) => setAddSpeaker(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scripture Reference</label>
                  <input
                    type="text"
                    placeholder="e.g., Romans 8:28-39"
                    value={addScripture}
                    onChange={(e) => setAddScripture(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddMediaType('video')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      addMediaType === 'video'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video (MP4 / WebM / YouTube)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMediaType('audio')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      addMediaType === 'audio'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Audio (MP3 / Podcast)</span>
                  </button>
                </div>
              </div>

              {/* Media URL / YouTube / Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  {addMediaType === 'video' ? 'Video File URL (MP4) or YouTube Link' : 'Audio File URL (MP3)'}
                </label>
                <input
                  type="text"
                  placeholder={addMediaType === 'video' ? 'https://example.com/sermon.mp4 or https://youtu.be/...' : 'https://example.com/sermon.mp3'}
                  value={addMediaUrl}
                  onChange={(e) => setAddMediaUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                />

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Or select a file from your computer:</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Browse File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,audio/mp3,audio/mpeg,audio/wav"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Key Notes</label>
                <textarea
                  rows={2}
                  placeholder="Outline, themes, and key message points..."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>

              {uploadFeedback && (
                <p className="text-xs font-semibold text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                  {uploadFeedback}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSermon}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingSermon ? 'Saving...' : 'Add to Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Historic & Contemporary Preachers */}
      <div className="bg-[#090d24]/90 border border-white/10 rounded-3xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Browse by Preacher & Theologian
            </h3>
          </div>
          {selectedSpeaker && (
            <button
              onClick={() => handleSpeakerSelect(selectedSpeaker)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Clear Preacher ({selectedSpeaker})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {speakers.map((speaker) => {
            const isSelected = selectedSpeaker === speaker.name;
            return (
              <button
                key={speaker.id}
                onClick={() => handleSpeakerSelect(speaker.name)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20'
                    : 'bg-black/30 border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                <img
                  src={speaker.avatarUrl}
                  alt={speaker.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white/20 flex-shrink-0 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">{speaker.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{speaker.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-blue-300 font-semibold">
                      {speaker.sermonCount}+ sermons
                    </span>
                    <span className="text-[9px] text-slate-500">• {speaker.era}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scripture Passage Quick Filter */}
      <div className="bg-[#090d24]/90 border border-blue-500/20 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Sermons by Passage:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['John 3:16', 'Romans 8:28', 'Ephesians 6:10', 'Matthew 7:13', 'Genesis 22:1', 'Psalm 23', 'Judges 17:10'].map((ref) => {
            const isMatch = scriptureFilter === ref;
            return (
              <button
                key={ref}
                onClick={() => handleScriptureQuickSearch(isMatch ? '' : ref)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isMatch
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-black/40 text-indigo-300 hover:text-white border-indigo-500/30 hover:bg-indigo-950/50'
                }`}
              >
                {ref}
              </button>
            );
          })}
          {scriptureFilter && (
            <button
              onClick={() => handleScriptureQuickSearch('')}
              className="text-[11px] text-rose-400 hover:text-rose-300 ml-1 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category / Topic Filter Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Major Biblical Themes:</span>
          {selectedTopic !== 'All Topics' && (
            <button
              onClick={() => handleTopicSelect('All Topics')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Reset Topic ({selectedTopic})
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[{ name: 'All Topics', slug: 'all' }, ...topics].map((top) => {
            const isSelected = selectedTopic === top.name;
            return (
              <button
                key={top.slug}
                onClick={() => handleTopicSelect(top.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                {(top.slug === 'prayer' || top.slug === 'revival') && <Flame className="w-3 h-3 text-amber-400" />}
                <span>{top.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-[#090d24]/90 border border-blue-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by preacher (Leonard Ravenhill, Spurgeon, Tozer, Washer), scripture (John 3:16), or topic..."
            className="flex-1 bg-blue-950/50 border border-blue-500/30 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all"
          >
            Search
          </button>
          {(searchTerm || selectedSpeaker || selectedTopic !== 'All Topics' || scriptureFilter || filterType !== 'all') && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            {(['all', 'video', 'audio'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  setFilterType(type);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === type
                    ? type === 'video'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                      : type === 'audio'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                {type === 'all' && <span>All Formats</span>}
                {type === 'video' && (
                  <>
                    <Video className="w-3.5 h-3.5 text-rose-300" />
                    <span>📹 Video & MP4 Expositions</span>
                  </>
                )}
                {type === 'audio' && (
                  <>
                    <Headphones className="w-3.5 h-3.5 text-blue-300" />
                    <span>🎙️ Audio CDN MP3</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing {filteredSermons.length} {filteredSermons.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>
      </form>

      {/* Currently Playing Spotlight Player */}
      {playingSermon && (
        <div
          ref={playerContainerRef}
          className={`border-2 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl animate-fade-in relative ${
            isVideoSermon(playingSermon)
              ? 'bg-[#090b1e] border-rose-500/70 shadow-rose-500/20'
              : 'bg-[#090d24] border-blue-500/70 shadow-blue-500/25'
          }`}
        >
          {/* Top metadata & mode selector */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {playingSermon.category === 'Studio Recording' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Studio Recording</span>
                  </span>
                ) : isVideoSermon(playingSermon) ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    <span>{playingSermon.mp4Url ? 'MP4 Video Exposition' : playingSermon.youtubeId ? 'HD Video Stream' : 'Video Sermon'}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    <span>SermonIndex Audio CDN</span>
                  </span>
                )}

                {playingSermon.topics && playingSermon.topics.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {playingSermon.topics.map(t => t.name).join(', ')}
                  </span>
                )}
                {playingSermon.scriptureRef && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {playingSermon.scriptureRef}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{playingSermon.title}</h3>
              {playingSermon.speaker && (
                <p className="text-xs text-slate-300">
                  Preached by <strong className="text-blue-300">{playingSermon.speaker}</strong>
                  {playingSermon.speakerTitle && <span className="text-slate-400"> ({playingSermon.speakerTitle})</span>}
                  {playingSermon.duration && <span className="text-slate-400"> • {formatSeconds(playingSermon.duration)}</span>}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {playingSermon.scriptureRef && onStudyPassage && (
                <button
                  onClick={() => {
                    soundEffects.playTap();
                    onStudyPassage(playingSermon.scriptureRef!);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study {playingSermon.scriptureRef}</span>
                </button>
              )}

              <button
                onClick={() => handlePushToCourse(playingSermon)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                title="Add as a Lesson in Course Studio"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add to Course</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playTap();
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                  }
                  setIsPlaying(false);
                  setPlayingSermon(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Close Player"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {pushStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pushStatus}</span>
            </div>
          )}

          {/* Audio / Video Player Container */}
          <div className="bg-black/70 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
            {playingSermon.youtubeId ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[420px] shadow-2xl border border-rose-500/40 mb-3">
                <iframe
                  key={playingSermon.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${playingSermon.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={playingSermon.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : isVideoSermon(playingSermon) ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[440px] shadow-2xl border border-rose-500/40">
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    playsInline
                    src={getVideoSource(playingSermon)}
                    poster={playingSermon.speakerImage || playingSermon.thumbnailUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              </div>
            ) : (
              <audio
                ref={audioRef}
                autoPlay
                src={getAudioSource(playingSermon)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Custom High Quality Audio / MP4 Controls (When not YouTube iframe) */}
            {!playingSermon.youtubeId && (
              <div className="space-y-3">
                {/* Seek Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-mono font-medium">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(duration || (typeof playingSermon.duration === 'number' ? playingSermon.duration : 2700))}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 2700}
                    value={currentTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCurrentTime(val);
                      if (isVideoSermon(playingSermon) && videoRef.current) {
                        videoRef.current.currentTime = val;
                      } else if (audioRef.current) {
                        audioRef.current.currentTime = val;
                      }
                    }}
                    className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Playback Buttons Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSkip(-15)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
                      title="Skip back 15 seconds"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>-15s</span>
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
                        isVideoSermon(playingSermon)
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => handleSkip(15)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
                      title="Skip forward 15 seconds"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>+15s</span>
                    </button>
                  </div>

                  {/* Playback Speed */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          playbackRate === spd
                            ? isVideoSermon(playingSermon) ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Download & Source Links */}
                  <div className="flex items-center gap-2">
                    {isVideoSermon(playingSermon) && getVideoSource(playingSermon) && (
                      <a
                        href={getVideoSource(playingSermon)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Download Video File (MP4)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </a>
                    )}
                    {!isVideoSermon(playingSermon) && getAudioSource(playingSermon) && (
                      <a
                        href={getAudioSource(playingSermon)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Download MP3 from SermonIndex Archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP3</span>
                      </a>
                    )}
                    {playingSermon.url && (
                      <a
                        href={playingSermon.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Open canonical listing on SermonIndex.net"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">SermonIndex</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 max-w-md">
            <button
              onClick={() => setPlayerTab('player')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                playerTab === 'player'
                  ? isVideoSermon(playingSermon) ? 'bg-rose-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => setPlayerTab('notes')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                playerTab === 'notes'
                  ? isVideoSermon(playingSermon) ? 'bg-rose-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Outline & Quotes</span>
            </button>
          </div>

          {/* Tab Content */}
          {playerTab === 'player' && (
            <div className="space-y-2 text-xs text-slate-200 leading-relaxed bg-blue-950/30 p-3.5 rounded-2xl border border-blue-500/20">
              <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">Sermon Overview</h4>
              <p>{playingSermon.summary || playingSermon.description || 'A timeless expository discourse expounding the eternal Word of God, calling hearts to repentance, faith, and holy devotion.'}</p>
            </div>
          )}

          {playerTab === 'notes' && (
            <div className="space-y-4 bg-blue-950/30 p-4 rounded-2xl border border-blue-500/20">
              {playingSermon.outline && playingSermon.outline.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Expository Outline
                  </h4>
                  <div className="space-y-1.5">
                    {playingSermon.outline.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="flex-1 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {playingSermon.keyQuotes && playingSermon.keyQuotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-400" />
                    Key Preaching Quotations
                  </h4>
                  <div className="space-y-2">
                    {playingSermon.keyQuotes.map((q, idx) => (
                      <blockquote
                        key={idx}
                        className="bg-amber-950/20 border-l-2 border-amber-400/80 p-3 rounded-r-xl text-xs text-amber-100 italic"
                      >
                        {q}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sermons Listing */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <span>Connecting to SermonIndex.net edge network and video library...</span>
        </div>
      ) : filteredSermons.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6 space-y-2">
          <p className="text-sm font-semibold text-white">No sermons match your current filters.</p>
          <p className="text-xs">Try selecting a different format (Video vs Audio), preacher, or resetting your search.</p>
          <button
            onClick={resetAllFilters}
            className="mt-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSermons.map((sermon) => {
            const isThisActive = playingSermon?.id === sermon.id;
            const sermonSpeakerImg = sermon.speakerImage || sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80';
            const isVid = isVideoSermon(sermon);
            
            return (
              <div
                key={sermon.id}
                className={`rounded-2xl border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isThisActive
                    ? isVid
                      ? 'bg-[#150e26] border-rose-400 shadow-xl shadow-rose-500/20 ring-1 ring-rose-400/40'
                      : 'bg-[#0e163d] border-blue-400 shadow-xl shadow-blue-500/20 ring-1 ring-blue-400/40'
                    : 'bg-[#090d24]/80 border-white/10 hover:border-blue-500/40 hover:bg-[#0c1232]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Portrait / Play Button */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20">
                      <img
                        src={sermonSpeakerImg}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handleSelectSermon(sermon, 'player')}
                        className={`absolute inset-0 flex items-center justify-center text-white backdrop-blur-xs transition-opacity ${
                          isThisActive
                            ? isVid ? 'bg-rose-600/80 opacity-100' : 'bg-blue-600/80 opacity-100'
                            : 'bg-black/40 hover:bg-black/60'
                        }`}
                        title={isVid ? 'Watch Video Sermon' : 'Listen to Sermon'}
                      >
                        <Play className="w-6 h-6 ml-0.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-blue-300 transition-colors">
                        {sermon.title}
                      </h4>
                      {isVid ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] font-bold uppercase tracking-wider border border-rose-500/40 flex items-center gap-1">
                          <Film className="w-2.5 h-2.5" />
                          <span>{sermon.mp4Url ? 'MP4 Video' : sermon.youtubeId ? 'Video Stream' : 'Video Expository'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[9px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                          <Headphones className="w-2.5 h-2.5" />
                          <span>Audio MP3</span>
                        </span>
                      )}

                      {sermon.category === 'Studio Recording' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                          Studio Recording
                        </span>
                      )}

                      {sermon.topics && sermon.topics.length > 0 && (
                        <span className="text-[10px] text-indigo-300 font-medium truncate max-w-[150px]">
                          • {sermon.topics.map(t => t.name).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-400 flex-wrap">
                      {sermon.speaker && <span className="text-slate-200 font-semibold">{sermon.speaker}</span>}
                      {sermon.duration && <span>• {formatSeconds(sermon.duration)}</span>}
                      {sermon.dateRecorded && <span>• {sermon.dateRecorded}</span>}
                    </div>

                    {sermon.summary && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {sermon.summary}
                      </p>
                    )}

                    {sermon.scriptureRef && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          <BookOpen className="w-3 h-3 text-indigo-400" />
                          <span>{sermon.scriptureRef}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => handleSelectSermon(sermon, 'player')}
                    className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                      isVid
                        ? 'bg-rose-600 hover:bg-rose-500'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isVid ? 'Watch Video' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleSelectSermon(sermon, 'notes')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1"
                    title="View Outline & Notes"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Notes</span>
                  </button>

                  {sermon.scriptureRef && onStudyPassage && (
                    <button
                      onClick={() => {
                        soundEffects.playTap();
                        onStudyPassage(sermon.scriptureRef!);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all flex items-center gap-1 shadow-sm"
                      title="Study passage in Scripture Guide"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Mini-Player Bar (When playing) */}
      {playingSermon && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#0c133a]/95 backdrop-blur-xl border-2 border-blue-400/60 rounded-2xl p-3 shadow-2xl shadow-blue-500/30 animate-slide-up flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-bold text-xs shadow ${
              isVideoSermon(playingSermon) ? 'bg-rose-600' : 'bg-blue-600'
            }`}>
              {isVideoSermon(playingSermon) ? <Film className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{playingSermon.title}</p>
              <p className="text-[10px] text-blue-300 truncate">
                {isVideoSermon(playingSermon) ? 'Watching Video: ' : 'Listening: '}
                {playingSermon.speaker || 'Preaching Sermon'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                soundEffects.playTap();
                playerContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
              title="View Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
                setIsPlaying(false);
                setPlayingSermon(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1"
              title="Stop & Close Player"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
