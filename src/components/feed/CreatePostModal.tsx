import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Camera, MapPin, Tag, Sparkles, Layers, Check, Video, Youtube } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { compressImage } from '../../utils/imageCompressor';
import { soundEffects } from '../../services/audio';
import { extractVideosFromText } from '../../utils/mediaUtils';
import { VideoEmbed } from '../common/VideoEmbed';

interface CreatePostModalProps {
  onClose: () => void;
  initialContent?: string;
  initialTags?: string;
}

export const POST_CATEGORIES = [
  'Photography',
  'Tech',
  'WebRTC',
  'Design',
  'Art',
  'Music',
  'Spiritual',
  'Lifestyle',
  'General',
];

const CURATED_IMAGES = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&auto=format&fit=crop&q=80',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  initialContent = '',
  initialTags = '',
}) => {
  const { createPost } = useSocial();
  const { user } = useAuth();

  const [content, setContent] = useState(initialContent);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialTags ? initialTags.split(/[\s,#]+/).filter(Boolean) : ['General']
  );
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [location, setLocation] = useState('');
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const detectedVideos = extractVideosFromText(content);

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    soundEffects.playTap();
    setContent((prev) => (prev ? `${prev}\n${videoUrlInput.trim()}` : videoUrlInput.trim()));
    setVideoUrlInput('');
    setShowVideoInput(false);
  };

  // File upload handler with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      soundEffects.playTap();
      for (const file of Array.from(files)) {
        try {
          const compressed = await compressImage(file, 1200, 1200, 0.85);
          setMediaUrls((prev) => [...prev, compressed]);
        } catch (err) {
          console.warn('Error compressing uploaded file:', err);
        }
      }
    }
  };

  // Camera capture
  const startCamera = async () => {
    try {
      setIsCapturingCamera(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
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

      await createPost(content.trim(), mediaUrls, combinedTags, location.trim() || undefined);
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

  return (
    <div
      id="create-post-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-2xl p-4 flex min-h-screen items-center justify-center animate-fade-in"
    >
      <div className="w-full max-w-lg my-auto rounded-[32px] bg-[#05060f]/95 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> Create New Post
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <span className="text-xs text-blue-400">@{user.handle}</span>
              </div>
            </div>
          )}

          {/* Caption text area */}
          <textarea
            id="post-caption-input"
            rows={3}
            placeholder="Share your creative thoughts, paste a YouTube/video link, or update your status..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />

          {/* Quick Video Link Input Tray */}
          {showVideoInput && (
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-400/30 space-y-2 animate-fade-in">
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
                  onClick={handleAddVideoUrl}
                  disabled={!videoUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
                >
                  Insert
                </button>
              </div>
            </div>
          )}

          {/* Live Detected Video Preview */}
          {detectedVideos.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-blue-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  <span>Video Player Preview ({detectedVideos.length} detected)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Ready to play</span>
              </div>
              <div className="space-y-3">
                {detectedVideos.map((vid, idx) => (
                  <VideoEmbed key={idx} video={vid} />
                ))}
              </div>
            </div>
          )}

          {/* Category Selection Toggle / Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Category (Used for feed filters):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POST_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 active:scale-95 ${
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
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
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

          {/* Attached photos grid */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group">
                  <img src={url} alt="attached" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Curated Gallery Quick Selector */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Or select from curated aesthetic gallery:</p>
            <div className="grid grid-cols-6 gap-2">
              {CURATED_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMediaUrls((prev) => (prev.includes(img) ? prev : [...prev, img]))}
                  className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 cursor-pointer transition-all hover:scale-105"
                >
                  <img src={img} alt="preset" className="w-full h-full object-cover" />
                </div>
              ))}
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

          {/* Upload and Camera Triggers */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                id="browse-photos-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Photos</span>
              </button>

              <button
                type="button"
                id="camera-capture-btn"
                onClick={startCamera}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                id="add-video-link-btn"
                onClick={() => {
                  soundEffects.playTap();
                  setShowVideoInput((prev) => !prev);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  showVideoInput
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>Video Link</span>
              </button>
            </div>

            <button
              type="submit"
              id="submit-post-btn"
              disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
