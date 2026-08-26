import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Sparkles,
  Database,
  LogOut,
  Check,
  ShieldCheck,
  Smartphone,
  Save,
  UserPlus,
  Upload,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Share2,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';

interface UserProfileModalProps {
  onClose: () => void;
  onTriggerMatrixSplash?: () => void;
  onOpenShare?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  onTriggerMatrixSplash,
  onOpenShare,
}) => {
  const { user, updateProfile, setUserStatus, logout, openAuthModal, isServerConnected } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'online');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // File upload handler
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        soundEffects.playTap();
        setAvatarUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
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
      console.warn('Camera error:', e);
      setIsCapturingCamera(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop center square
        const size = Math.min(canvas.width, canvas.height);
        const startX = (canvas.width - size) / 2;
        const startY = (canvas.height - size) / 2;
        ctx.drawImage(videoRef.current, startX, startY, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setAvatarUrl(dataUrl);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        handle: handle.trim().replace('@', ''),
        avatarUrl: avatarUrl.trim(),
        statusMessage: statusMessage.trim(),
        status,
      });
      stopCamera();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    stopCamera();
    logout();
    onClose();
  };

  return (
    <div
      id="user-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#090d22]/95 backdrop-blur-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Account Settings & Profile
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Server Database Sync Status Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Server Database Storage</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[11px] text-slate-300">
                  Your profile and data persist directly on the server.
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
              Connected
            </span>
          </div>

          {/* Profile Form */}
          {user ? (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Avatar Upload / Selector Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Profile Avatar</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Upload or choose below</span>
                </div>

                {/* Camera Live View (if active) */}
                {isCapturingCamera ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-white/20 aspect-square max-w-[220px] mx-auto">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={takeSnapshot}
                        className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Interactive Drop / Click Avatar Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative group cursor-pointer rounded-2xl p-1.5 transition-all border-2 ${
                        isDragging
                          ? 'border-blue-400 bg-blue-500/20 scale-105'
                          : 'border-white/15 hover:border-blue-400/60 bg-black/40'
                      }`}
                      title="Click or drop an image file here"
                    >
                      <Avatar src={avatarUrl || user.avatarUrl} name={name || user.name} size="xl" status={status} />
                      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 backdrop-blur-xs">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>Change</span>
                      </div>
                    </div>

                    {/* Upload Actions */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image File</span>
                        </button>

                        <button
                          type="button"
                          onClick={startCamera}
                          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          title="Take selfie with camera"
                        >
                          <Camera className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">Camera</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] focus:outline-none focus:border-blue-400 truncate"
                      />
                    </div>
                  </div>
                )}

                {/* Avatar Presets */}
                <div>
                  <p className="text-[10px] font-medium text-slate-400 mb-1.5">Or choose a preset style:</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {AVATAR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          soundEffects.playTap();
                          setAvatarUrl(preset);
                        }}
                        className={`relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          avatarUrl === preset ? 'border-blue-400 scale-110 shadow-md shadow-blue-500/40' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = Math.random().toString(36).substring(7);
                        soundEffects.playTap();
                        setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
                      }}
                      className="px-2.5 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 flex items-center gap-1 transition-all flex-shrink-0"
                      title="Generate random bot avatar"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-400" />
                      <span>Random</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Username Handle (@)
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Bio / About Me
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or what you're working on..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Online Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d22] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  >
                    <option value="online">🟢 Online</option>
                    <option value="busy">🔴 In Call / Busy</option>
                    <option value="away">🟡 Away</option>
                    <option value="offline">⚪ Offline / Invisible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Status Message
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="e.g. Collaborating on WebRTC 🚀"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Matrix Protocol Splash Screen Quick Launch */}
              {onTriggerMatrixSplash && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onClose();
                      onTriggerMatrixSplash();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Replay Matrix Digital Splash Screen</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                      Launch
                    </span>
                  </button>
                </div>
              )}

              {/* Invite & Share Action Card */}
              {onOpenShare && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-blue-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span>Invite Friends & Share App</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
                          QR + Link
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-300 truncate">
                        Share your referral code (@{user.handle}) with contacts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onOpenShare();
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all hover:scale-105"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4">
              <p className="text-xs text-slate-400">You are currently not signed in.</p>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                  openAuthModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg"
              >
                Sign In / Onboard Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
