import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Camera, MapPin, Tag, Sparkles, Upload } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface CreatePostModalProps {
  onClose: () => void;
  initialContent?: string;
  initialTags?: string;
}

const CURATED_IMAGES = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&auto=format&fit=crop&q=80',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, initialContent = '', initialTags = '' }) => {
  const { createPost } = useSocial();
  const { user } = useAuth();

  const [content, setContent] = useState(initialContent);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [location, setLocation] = useState('');
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) {
            setMediaUrls((prev) => [...prev, loadEvt.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setMediaUrls((prev) => [...prev, dataUrl]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;

    const tags = tagsInput
      .split(/[\s,#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    await createPost(content, mediaUrls, tags, location.trim() || undefined);
    stopCamera();
    onClose();
  };

  const removeMedia = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div
      id="create-post-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-[32px] bg-[#05060f]/85 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
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
            placeholder="Share your creative thoughts, photography, or updates..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />

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

          {/* Tags and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tags (e.g. tech, art)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Location (e.g. San Francisco)"
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
                <span>Take Snapshot</span>
              </button>
            </div>

            <button
              type="submit"
              id="submit-post-btn"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
