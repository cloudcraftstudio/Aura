import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Image as ImageIcon,
  Camera,
  MapPin,
  Tag,
  Sparkles,
  Layers,
  Check,
  Video,
  Youtube,
  Eye,
  Edit3,
  Flame,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Music,
  Compass,
  Palette,
  Play,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { compressImage } from '../../utils/imageCompressor';
import { mediaCache } from '../../services/mediaCache';
import { AsyncMedia } from '../common/AsyncMedia';
import { soundEffects } from '../../services/audio';
import { extractVideosFromText, isDirectVideoUrl } from '../../utils/mediaUtils';
import { VideoEmbed } from '../common/VideoEmbed';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { notificationService } from '../../services/notifications';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';

interface CreatePostModalProps {
  onClose: () => void;
  initialContent?: string;
  initialTags?: string | string[];
  initialMedia?: string | string[];
  initialLocation?: string;
  editPostId?: string;
}

export const POST_CATEGORIES = [
  'Scripture',
  'Prayer & Worship',
  'Testimony',
  'Baptist Heritage',
  'Christian Art',
  'Fellowship',
  'Youth & Family',
  'Spiritual',
  'General',
];

export const CURATED_IMAGES = ALL_CHRISTIAN_PRESET_IMAGES.map((p) => p.url);

export interface CardPresetOption {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  content: string;
  tags: string[];
  location?: string;
  mediaUrls: string[];
  themeGlow: string;
  cardBorder: string;
}

export const PRESET_CARD_OPTIONS: CardPresetOption[] = [
  {
    id: 'music-video',
    name: 'Music Video Drop',
    category: 'Music',
    icon: Music,
    badge: '🎵 Music Release',
    content:
      '🔥 Check out the fresh music video drop! Turn up the sound and tell me your favorite verse in the comments 🎧\nhttps://youtu.be/FCSCcaWRno0',
    tags: ['Music', 'WebRTC', 'Lifestyle'],
    location: 'Soundstage 4, Austin TX',
    mediaUrls: [],
    themeGlow: 'from-blue-600/20 via-purple-600/20 to-pink-600/20',
    cardBorder: 'border-blue-500/30',
  },
  {
    id: 'daily-quote',
    name: 'Wisdom & Inspiration',
    category: 'Spiritual',
    icon: Sparkles,
    badge: '✨ Daily Inspiration',
    content:
      '“Creativity is intelligence having fun. Imagination is everything; it is the preview of life’s coming attractions.” — Albert Einstein\n\nWhat are you creating today?',
    tags: ['Spiritual', 'General', 'Art'],
    location: 'Aura Community',
    mediaUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
    ],
    themeGlow: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
    cardBorder: 'border-amber-500/30',
  },
  {
    id: 'photo-spotlight',
    name: 'Photography Showcase',
    category: 'Photography',
    icon: Palette,
    badge: '📷 Photo Spotlight',
    content:
      'Twilight reflections over the high mountain pass. Shot on Sony A7IV • 35mm f/1.4 • 1/500s. Let the natural light guide your evening.',
    tags: ['Photography', 'Art', 'Design'],
    location: 'Rocky Mountain Pass, CO',
    mediaUrls: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
    ],
    themeGlow: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    cardBorder: 'border-cyan-500/30',
  },
  {
    id: 'tech-release',
    name: 'Tech & WebRTC Release',
    category: 'Tech',
    icon: Flame,
    badge: '⚡ Tech Milestone',
    content:
      '⚡ Live WebRTC audio waveforms and HD video calling are now fully connected with instant peer sync! Join a call and experience zero-latency communication 🌐',
    tags: ['Tech', 'WebRTC', 'Design'],
    location: 'Silicon Valley, CA',
    mediaUrls: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    ],
    themeGlow: 'from-indigo-600/20 via-blue-600/20 to-cyan-600/20',
    cardBorder: 'border-indigo-500/30',
  },
  {
    id: 'mindfulness-zen',
    name: 'Mindfulness Check-In',
    category: 'Spiritual',
    icon: Compass,
    badge: '🌿 Zen Reflection',
    content:
      '🌿 Midday pause: Take 3 slow, deep breaths. Let go of what you cannot control, and welcome tranquility into this moment. Sending positive aura to everyone.',
    tags: ['Spiritual', 'Lifestyle'],
    location: 'Serenity Garden',
    mediaUrls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    ],
    themeGlow: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    cardBorder: 'border-emerald-500/30',
  },
  {
    id: 'community-discussion',
    name: 'Community Question',
    category: 'General',
    icon: HelpCircle,
    badge: '💬 Open Discussion',
    content:
      'Question for the community: What is the one creative habit, song, or routine that energized your workflow the most this week? Drop your thoughts below! 👇',
    tags: ['General', 'Lifestyle', 'Design'],
    location: 'Worldwide',
    mediaUrls: [],
    themeGlow: 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
    cardBorder: 'border-purple-500/30',
  },
];

export const DEMO_VIDEOS = [
  {
    label: '🎵 Music Video',
    url: 'https://youtu.be/FCSCcaWRno0',
  },
  {
    label: '🎬 Lo-Fi Beats',
    url: 'https://youtu.be/jfKfPfyJRdk',
  },
  {
    label: '🌊 Nature 4K',
    url: 'https://youtu.be/2OEL4P1Rz04',
  },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  initialContent = '',
  initialTags = '',
  initialMedia,
  initialLocation = '',
  editPostId,
}) => {
  const { createPost, editPost } = useSocial();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [content, setContent] = useState(initialContent);
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    Array.isArray(initialMedia) ? initialMedia : initialMedia ? [initialMedia] : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(initialTags)
      ? initialTags
      : initialTags
      ? initialTags.split(/[\s,#]+/).filter(Boolean)
      : ['General']
  );
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(initialTags) ? initialTags.join(', ') : initialTags
  );
  const [location, setLocation] = useState(initialLocation);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState(false);

  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const detectedVideos = extractVideosFromText(content);

  // Apply a preset card template with demo data
  const handleSelectPreset = (preset: CardPresetOption) => {
    soundEffects.playTap();
    setActivePresetId(preset.id);
    setContent(preset.content);
    setSelectedCategories(preset.tags);
    setTagsInput(preset.tags.join(', '));
    setLocation(preset.location || '');
    setMediaUrls(preset.mediaUrls);

    notificationService.notify({
      type: 'system',
      title: `Preset Applied: ${preset.name}`,
      body: 'Customized content, tags, and media have been populated. Check Live Preview!',
      playSound: false,
    });
  };

  const handleAddVideoUrl = (urlToInsert?: string) => {
    const targetUrl = urlToInsert || videoUrlInput;
    if (!targetUrl.trim()) return;
    soundEffects.playTap();
    setContent((prev) => (prev ? `${prev}\n${targetUrl.trim()}` : targetUrl.trim()));
    setVideoUrlInput('');
    setShowVideoInput(false);
  };

  // File upload handler with compression and video support
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      soundEffects.playTap();
      for (const file of Array.from(files)) {
        try {
          const id = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7);
          if (file.type.startsWith('video/')) {
            await mediaCache.saveMedia(id, file);
            setMediaUrls((prev) => [...prev, `localmedia://video/${id}`]);
          } else {
            const compressedUrl = await compressImage(file, 1200, 1200, 0.85);
            // Convert data URL back to Blob for IndexedDB to save localStorage space
            const res = await fetch(compressedUrl);
            const blob = await res.blob();
            await mediaCache.saveMedia(id, blob);
            setMediaUrls((prev) => [...prev, `localmedia://image/${id}`]);
          }
        } catch (err) {
          console.warn('Error processing uploaded file:', err);
        }
      }
    }
  };

  // Camera capture
  const startCamera = async () => {
    try {
      setIsCapturingCamera(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (e) {
      console.warn('Camera capture error:', e);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setMediaUrls((prev) => [...prev, dataUrl]);
        soundEffects.playTap();
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCapturingCamera(false);
  };

  const toggleCategory = (cat: string) => {
    soundEffects.playTap();
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!content.trim() && mediaUrls.length === 0) return;

    setIsSubmitting(true);
    soundEffects.playTap();

    try {
      const manualTags = tagsInput
        .split(/[\s,#]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const categoryTags = selectedCategories.map((c) => c.toLowerCase());
      const combinedTags = Array.from(new Set([...categoryTags, ...manualTags]));

      if (editPostId) {
        await editPost(editPostId, content.trim(), mediaUrls, combinedTags, location.trim() || undefined);
      } else {
        await createPost(content.trim(), mediaUrls, combinedTags, location.trim() || undefined);
      }
      
      stopCamera();
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      stopCamera();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = (idx: number) => {
    soundEffects.playTap();
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const activePreset = PRESET_CARD_OPTIONS.find((p) => p.id === activePresetId);

  // Use Portal so the modal sits directly on document.body above all navbars, stacking contexts, and bottom bars
  return createPortal(
    <div
      id="create-post-modal-portal"
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-[32px] bg-[#070a1e] border-0 sm:border sm:border-white/15 shadow-2xl overflow-hidden flex flex-col text-white"
      >
        {/* Sticky Header with Safe Area Notch Padding */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0a0e28] flex-shrink-0 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] sm:pt-3.5 z-20">
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  setActiveTab('edit');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>

              <button
                type="button"
                id="live-card-preview-btn"
                onClick={() => {
                  soundEffects.playTap();
                  setActiveTab('preview');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
                <span>Live Preview</span>
                {(content.trim() || mediaUrls.length > 0 || detectedVideos.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'edit' ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin overscroll-contain">
              {/* User Info Bar */}
              {user && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} name={user.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <span className="text-xs text-blue-400">@{user.handle}</span>
                    </div>
                  </div>

                  {/* Preset Drawer Trigger Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playTap();
                      setShowPresetsDrawer((prev) => !prev);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showPresetsDrawer
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Templates</span>
                    {showPresetsDrawer ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              )}

              {/* Collapsible / Expandable Preset Templates Tray */}
              {showPresetsDrawer && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-purple-950/50 border border-blue-500/30 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Tap Card Templates:</span>
                    </span>
                    <span className="text-[10px] text-blue-300 font-medium">Swipe or tap to apply</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_CARD_OPTIONS.map((preset) => {
                      const Icon = preset.icon;
                      const isCurrent = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 group active:scale-95 ${
                            isCurrent
                              ? 'bg-blue-600/40 border-blue-400 shadow-md shadow-blue-500/30'
                              : 'bg-black/40 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{preset.name}</p>
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-300 transition-colors">
                              {preset.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Caption text area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Post Caption & Links:</label>
                  <span className="text-[11px] text-slate-500">{content.length} characters</span>
                </div>
                <textarea
                  id="post-caption-input"
                  rows={4}
                  placeholder="Share your creative thoughts, paste a YouTube/video link, or choose a template..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-400 resize-none transition-colors"
                />
              </div>

              {/* Quick Video Link Input Tray */}
              {showVideoInput && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <span>Paste YouTube, Vimeo, or Video Link:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVideoInput(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVideoUrl();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddVideoUrl()}
                      disabled={!videoUrlInput.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
                    >
                      Insert
                    </button>
                  </div>

                  {/* 1-Tap Sample Video Links */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Quick Demo Videos:</span>
                    {DEMO_VIDEOS.map((demo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddVideoUrl(demo.url)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-semibold text-blue-300 hover:text-white transition-all active:scale-95"
                      >
                        {demo.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Detected Video Preview Box */}
              {detectedVideos.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      <span>Video Player Preview ({detectedVideos.length} detected)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live Player Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {detectedVideos.map((vid, idx) => (
                      <VideoEmbed key={idx} video={vid} />
                    ))}
                  </div>
                </div>
              )}

              {/* Category Selection Carousel / Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Category Tags:</span>
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {POST_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1 active:scale-95 flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-500/30 font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Camera Viewport if active */}
              {isCapturingCamera && (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-blue-500/40">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Attached Media Grid */}
              {mediaUrls.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Attached Media ({mediaUrls.length}):</span>
                    <button
                      type="button"
                      onClick={() => setMediaUrls([])}
                      className="text-rose-400 hover:text-rose-300 text-[10px]"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group bg-black/50"
                      >
                        {isDirectVideoUrl(url) ? (
                          <AsyncMedia
                            mediaType="video"
                            src={url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AsyncMedia
                            mediaType="image"
                            src={url}
                            alt="attached"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Gallery Quick Selector */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2">
                  Or select aesthetic preset images:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {CURATED_IMAGES.map((img, i) => {
                    const isAttached = mediaUrls.includes(img);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          soundEffects.playTap();
                          setMediaUrls((prev) =>
                            prev.includes(img) ? prev.filter((u) => u !== img) : [...prev, img]
                          );
                        }}
                        className={`w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border cursor-pointer transition-all hover:scale-105 relative ${
                          isAttached ? 'border-blue-400 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={img}
                          alt="preset"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isAttached && (
                          <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Tags and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Extra tags (e.g. sunrise, code)"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Location (e.g. Austin, TX)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Footer with Safe Area Padding */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-[#0a0e28] flex items-center justify-between gap-2 flex-shrink-0 z-20 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:pb-3.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                <button
                  type="button"
                  id="browse-photos-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                  title="Upload Photos"
                >
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span className="hidden xs:inline sm:inline text-xs">Photo</span>
                </button>

                <button
                  type="button"
                  id="browse-videos-btn"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                  title="Upload Video"
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span className="hidden xs:inline sm:inline text-xs">Video</span>
                </button>

                <button
                  type="button"
                  id="camera-capture-btn"
                  onClick={startCamera}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                  title="Camera Snapshot"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xs:inline sm:inline text-xs">Camera</span>
                </button>

                <button
                  type="button"
                  id="add-video-link-btn"
                  onClick={() => {
                    soundEffects.playTap();
                    setShowVideoInput((prev) => !prev);
                  }}
                  className={`px-2.5 sm:px-3 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    showVideoInput
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white'
                  }`}
                  title="Insert YouTube Link"
                >
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span className="hidden xs:inline sm:inline text-xs">Link</span>
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playTap();
                    setActiveTab('preview');
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                <button
                  type="submit"
                  id="submit-post-btn"
                  disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
                  className="px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (editPostId ? 'Saving...' : 'Posting...') : (editPostId ? 'Save' : 'Publish')}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Live Card Preview Tab Mode */
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin overscroll-contain">
              {/* Preview Status Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-blue-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-300">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Live Community Feed Card Preview</span>
                </div>
                <span className="text-[10px] text-slate-400">Interactive live demo</span>
              </div>

              {/* Rendered Live Card */}
              <article
                className={`rounded-[28px] overflow-hidden bg-white/5 backdrop-blur-2xl border ${
                  activePreset ? activePreset.cardBorder : 'border-white/15'
                } shadow-2xl transition-all relative`}
              >
                {/* Ambient glow background if preset active */}
                {activePreset && (
                  <div
                    className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${activePreset.themeGlow}`}
                  />
                )}

                {/* Author Header */}
                <div className="p-5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user?.avatarUrl || ''}
                      name={user?.name || 'You'}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">{user?.name || 'You'}</h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>@{user?.handle || 'username'}</span>
                        <span>•</span>
                        <span className="text-blue-300">Just now</span>
                      </div>
                    </div>
                  </div>

                  {location && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <MapPin className="w-3 h-3" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>

                {/* Post Text Content */}
                <div className="px-5 pb-3 relative z-10">
                  {content.trim() ? (
                    <RichTextRenderer content={content} className="text-sm text-slate-100" />
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No caption written yet. Type your text or pick a template!
                    </p>
                  )}

                  {/* Categories & Tags */}
                  {(selectedCategories.length > 0 || tagsInput) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Array.from(
                        new Set([
                          ...selectedCategories,
                          ...tagsInput.split(/[\s,#]+/).filter(Boolean),
                        ])
                      ).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Video Embed Preview */}
                {detectedVideos.length > 0 && (
                  <div className="px-5 pb-3.5 space-y-3 relative z-10">
                    {detectedVideos.map((vid, idx) => (
                      <VideoEmbed key={idx} video={vid} />
                    ))}
                  </div>
                )}

                {/* Live Photos & Videos Grid Preview */}
                {mediaUrls.length > 0 && (
                  <div className="px-5 pb-3.5 relative z-10">
                    {mediaUrls.length === 1 ? (
                      <div className="relative max-h-[420px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
                        {isDirectVideoUrl(mediaUrls[0]) ? (
                          <AsyncMedia
                            mediaType="video"
                            src={mediaUrls[0]}
                            controls
                            className="w-full max-h-[420px] object-contain"
                          />
                        ) : (
                          <AsyncMedia
                            mediaType="image"
                            src={mediaUrls[0]}
                            alt="Post media"
                            className="w-full max-h-[420px] object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2 ${
                          mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                        }`}
                      >
                        {mediaUrls.map((url, i) => (
                          <div
                            key={i}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/50"
                          >
                            {isDirectVideoUrl(url) ? (
                              <AsyncMedia
                                mediaType="video"
                                src={url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <AsyncMedia
                                mediaType="image"
                                src={url}
                                alt={`Post media ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Action Bar Preview */}
                <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-slate-400 text-xs relative z-10">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => soundEffects.playLikeSparkle()}
                      className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>0 Likes</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span>0 Comments</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </div>
                </div>
              </article>
            </div>

            {/* Preview Sticky Footer Actions */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-[#0a0e28] flex items-center justify-between gap-3 flex-shrink-0 z-20 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:pb-3.5">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  setActiveTab('edit');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publishing...' : 'Looks Great • Publish'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
