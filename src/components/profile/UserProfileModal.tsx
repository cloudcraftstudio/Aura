import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Sparkles,
  Database,
  LogOut,
  Save,
  Upload,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Share2,
  QrCode,
  Layers,
  Video,
  Mic,
  Bell,
  Smartphone,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Heart,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { UserStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';
import { compressImage } from '../../utils/imageCompressor';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';
import { GospelTract } from './GospelTract';

interface UserProfileModalProps {
  onClose: () => void;
  onTriggerMatrixSplash?: () => void;
  onOpenShare?: () => void;
  onStudyPassage?: (ref: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
];

const COVER_BANNER_PRESETS = ALL_CHRISTIAN_PRESET_IMAGES;

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  onTriggerMatrixSplash,
  onOpenShare,
  onStudyPassage,
}) => {
  const { user, updateProfile, logout, openAuthModal } = useAuth();
  const {
    cameraStatus,
    micStatus,
    notificationStatus,
    pwaStatus,
    isStandalone,
    openPermissionsModal,
    openSaveToHomeModal,
  } = usePermissions();

  const [activeTab, setActiveTab] = useState<'profile' | 'gospel' | 'permissions'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=tex');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || COVER_BANNER_PRESETS[0].url);
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'online');
  const [isSaving, setIsSaving] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // File upload handler for Avatar
  const processAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      soundEffects.playTap();
      setAvatarUrl(compressed);
    } catch (e) {
      console.warn('Avatar image processing error:', e);
    }
  };

  // File upload handler for Banner
  const processBannerFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 1200, 500, 0.85);
      soundEffects.playTap();
      setBannerUrl(compressed);
    } catch (e) {
      console.warn('Banner image processing error:', e);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  // Camera capture for selfie avatar
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
        const size = Math.min(canvas.width, canvas.height);
        const startX = (canvas.width - size) / 2;
        const startY = (canvas.height - size) / 2;
        ctx.drawImage(videoRef.current, startX, startY, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
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
    if (isSaving) return;
    setIsSaving(true);
    try {
      soundEffects.playTap();
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        handle: handle.trim().replace('@', ''),
        avatarUrl: avatarUrl.trim(),
        bannerUrl: bannerUrl.trim(),
        statusMessage: statusMessage.trim(),
        status,
      });
      stopCamera();
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl p-3 sm:p-4 animate-fade-in flex flex-col"
    >
      <div className="w-full max-w-xl m-auto rounded-3xl bg-[#090d22]/95 backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {activeTab === 'gospel' ? (
                <Heart className="w-4 h-4 text-rose-400" />
              ) : activeTab === 'permissions' ? (
                <Sliders className="w-4 h-4 text-indigo-400" />
              ) : (
                <User className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {activeTab === 'gospel'
                  ? 'Gospel Tract • Plan of Salvation'
                  : activeTab === 'permissions'
                  ? 'Device Permissions & System'
                  : 'Account Settings & Profile'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {activeTab === 'gospel'
                  ? 'Discover eternal life in Jesus Christ & share the Good News'
                  : activeTab === 'permissions'
                  ? 'Manage camera, mic, alerts & home screen install'
                  : 'Customize your Christian persona, cover banner & identity'}
              </p>
            </div>
          </div>

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

        {/* Modal Navigation Tabs */}
        <div className="px-4 py-2 border-b border-white/10 bg-[#06091d] flex items-center gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              soundEffects.playTap();
              setActiveTab('profile');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Appearance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playTap();
              setActiveTab('gospel');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'gospel'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-500/25 border border-rose-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-300" />
            <span>Gospel Tract</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500/40 text-rose-200 uppercase tracking-tight">
              Good News
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playTap();
              setActiveTab('permissions');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Device & Permissions</span>
          </button>
        </div>

        {/* Tab 1: Gospel Tract View */}
        {activeTab === 'gospel' ? (
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 scrollbar-thin">
            <GospelTract
              onStudyPassage={(ref) => {
                onClose();
                onStudyPassage?.(ref);
              }}
            />
          </div>
        ) : activeTab === 'permissions' ? (
          /* Tab 3: Device Permissions View */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
            {/* Device Permissions & PWA App Card */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">App Permissions & Device Access</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    openPermissionsModal();
                  }}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Open Full Manager</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1.5">
                  <Video className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] text-slate-300 font-medium">Camera</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cameraStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {cameraStatus === 'granted' ? 'Allowed' : 'Prompt'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1.5">
                  <Mic className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] text-slate-300 font-medium">Microphone</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${micStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {micStatus === 'granted' ? 'Allowed' : 'Prompt'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1.5">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] text-slate-300 font-medium">Notifications</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${notificationStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {notificationStatus === 'granted' ? 'Allowed' : 'Prompt'}
                  </span>
                </div>

                <div
                  onClick={() => {
                    stopCamera();
                    openSaveToHomeModal();
                  }}
                  className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:bg-purple-900/40 transition-colors"
                >
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] text-purple-200 font-medium">Home App</span>
                  <span className="text-[9px] font-bold text-purple-300 underline">
                    {isStandalone || pwaStatus === 'installed' ? 'Installed' : 'Install PWA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Digital Rain Splash Trigger */}
            {onTriggerMatrixSplash && (
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Visual Matrix Rain Splash</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Experience the full-screen cyberpunk Matrix digital rain transition animation with green code drops.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                    onTriggerMatrixSplash();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch Matrix Digital Splash Screen</span>
                </button>
              </div>
            )}
          </div>
        ) : user ? (
          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
              {/* Live Preview Card */}
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-slate-900/60 shadow-xl relative">
                <div className="h-28 sm:h-32 w-full relative bg-slate-800">
                  <img
                    src={bannerUrl || COVER_BANNER_PRESETS[0].url}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="px-4 pb-3 flex items-end justify-between -mt-10 relative z-10">
                  <div className="flex items-end gap-3">
                    <div className="p-1 rounded-full bg-[#0c1024] ring-2 ring-white/20 shadow-xl">
                      <Avatar src={avatarUrl || user?.avatarUrl || ''} name={name || user?.name || ''} size="lg" />
                    </div>
                    <div className="mb-1">
                      <h4 className="text-sm font-bold text-white leading-tight">{name || 'Your Name'}</h4>
                      <p className="text-[11px] text-slate-300">@{handle || 'handle'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-300 font-medium italic opacity-70">
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Cover Banner Customizer */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Profile Cover Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Shown at the top of your profile</span>
                </div>

                {/* Banner Upload Actions */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingBanner(true);
                  }}
                  onDragLeave={() => setIsDraggingBanner(false)}
                  onDrop={handleBannerDrop}
                  className={`p-3 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isDraggingBanner ? 'border-blue-400 bg-blue-500/20' : 'border-white/15 bg-black/30'
                  }`}
                >
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Upload Custom Cover Image</p>
                    <p className="text-[10px] text-slate-400">Drag and drop or select file (JPEG/PNG/WebP)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Image</span>
                  </button>
                </div>

                {/* Preset Banner Themes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-300">Choose from {COVER_BANNER_PRESETS.length} Christian Preset Covers:</p>
                    <span className="text-[10px] text-blue-400 font-medium">Instant One-Click Apply</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {COVER_BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          soundEffects.playTap();
                          setBannerUrl(preset.url);
                        }}
                        className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all text-left flex flex-col justify-end p-1.5 ${
                          bannerUrl === preset.url
                            ? 'border-blue-400 ring-2 ring-blue-500/40 scale-[1.02] shadow-lg shadow-blue-500/20'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold text-white leading-tight truncate drop-shadow">
                            {preset.name}
                          </p>
                          <p className="text-[8px] text-slate-300 leading-tight truncate">
                            {preset.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Upload / Selector Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Profile Avatar Photo</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Upload, snap, or select</span>
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
                        className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 text-xs"
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
                        setIsDraggingAvatar(true);
                      }}
                      onDragLeave={() => setIsDraggingAvatar(false)}
                      onDrop={handleAvatarDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative group cursor-pointer rounded-2xl p-1.5 transition-all border-2 ${
                        isDraggingAvatar
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
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Avatar Photo</span>
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
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Or paste avatar image URL"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] focus:outline-none focus:border-blue-400 truncate"
                      />
                    </div>
                  </div>
                )}

                {/* Avatar Presets */}
                <div>
                  <p className="text-[10px] font-medium text-slate-400 mb-1.5">Or choose a preset portrait:</p>
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
                    placeholder="e.g. Collaborating on Aura ✨"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Account Protection & Security Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Account Security & Login Protection</span>
                  </label>
                  <span className="text-[10px] text-blue-300 font-medium">
                    {user.authProvider === 'google' ? 'Google Account' : user.hasPassword ? 'Password Protected' : 'Email Login'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Email Account (Used for Sign-In)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs cursor-not-allowed"
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

              {/* Device Permissions & PWA App Card */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">App Permissions & Device Access</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      openPermissionsModal();
                    }}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] text-slate-300 font-medium">Camera</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${cameraStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                      {cameraStatus === 'granted' ? 'Allowed' : 'Prompt'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                    <Mic className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] text-slate-300 font-medium">Mic</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${micStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                      {micStatus === 'granted' ? 'Allowed' : 'Prompt'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-slate-300 font-medium">Alerts</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${notificationStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                      {notificationStatus === 'granted' ? 'Allowed' : 'Prompt'}
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      stopCamera();
                      openSaveToHomeModal();
                    }}
                    className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer hover:bg-purple-900/40 transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] text-purple-200 font-medium">Home App</span>
                    <span className="text-[9px] font-bold text-purple-300 underline">
                      {isStandalone || pwaStatus === 'installed' ? 'Installed' : 'Add App'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons Footer */}
            <div className="px-5 sm:px-6 py-4 bg-[#050818]/90 border-t border-white/10 flex items-center justify-between flex-shrink-0">
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
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 sm:p-6 flex-1 min-h-0 flex items-center justify-center">
            <div className="text-center space-y-4">
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
          </div>
        )}
      </div>
    </div>
  );
};
