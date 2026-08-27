import React, { useState, useRef } from 'react';
import {
  Plus,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  Trash2,
  Smile,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { StoryViewerModal } from './StoryViewerModal';
import { soundEffects } from '../../services/audio';
import { ALL_CHRISTIAN_PRESET_IMAGES } from '../../data/presetImages';

const PRESET_STORY_IMAGES = ALL_CHRISTIAN_PRESET_IMAGES;

const STORY_EMOJIS = ['🙏', '✝️', '🕊️', '📖', '✨', '🔥', '💫', '💖'];

export const StoriesReel: React.FC = () => {
  const { stories, addStory } = useSocial();
  const { user, allUsers } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [storyImageUrl, setStoryImageUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
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
        setStoryImageUrl(e.target.result as string);
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
      console.warn('Camera capture error:', e);
      setIsCapturingCamera(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 720;
      canvas.height = videoRef.current.videoHeight || 1280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setStoryImageUrl(dataUrl);
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

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    const url = storyImageUrl.trim() || PRESET_STORY_IMAGES[0].url;
    soundEffects.playMessageSent();
    addStory(url, storyCaption.trim() || undefined);
    stopCamera();
    setIsAddingStory(false);
    setStoryImageUrl('');
    setStoryCaption('');
  };

  const handleCloseModal = () => {
    stopCamera();
    setIsAddingStory(false);
    setStoryImageUrl('');
    setStoryCaption('');
  };

  return (
    <div id="stories-reel" className="w-full mb-6">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add / View My Story Button */}
        {(() => {
          const myStoryIndex = stories.findIndex((s) => s.userId === user?.id);
          const myStory = myStoryIndex !== -1 ? stories[myStoryIndex] : null;
          const myMedia = myStory?.mediaUrl || myStory?.slides?.[0]?.mediaUrl;
          const hasValidMyMedia = myMedia && (myMedia.startsWith('http') || myMedia.startsWith('data:image'));

          if (myStory) {
            return (
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                <div
                  id="my-active-story-item"
                  className="relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.45)] transition-all group-hover:scale-105"
                >
                  <div
                    onClick={() => setSelectedStoryIndex(myStoryIndex)}
                    className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 relative cursor-pointer"
                  >
                    {hasValidMyMedia ? (
                      <img
                        src={myMedia}
                        alt="Your story"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 p-1.5 flex items-center justify-center text-center">
                        <p className="text-[9px] text-white font-bold line-clamp-3 leading-tight">
                          {myStory.caption || 'Your Story'}
                        </p>
                      </div>
                    )}

                    {/* Author Mini Avatar */}
                    <div className="absolute top-1 left-1 ring-1 ring-black/70 rounded-full shadow-md z-10">
                      <Avatar src={user?.avatarUrl || myStory.userAvatar} name="You" size="xs" />
                    </div>
                  </div>

                  {/* Add slide plus badge in bottom-right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingStory(true);
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-[#05060f] transition-transform active:scale-90 z-20"
                    title="Add another story or slide"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] font-semibold text-blue-300">Your Story</span>
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div
                id="add-story-btn"
                onClick={() => setIsAddingStory(true)}
                className="relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl p-0.5 border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-white/5 backdrop-blur-2xl flex items-center justify-center transition-all group-hover:scale-105"
              >
                {user ? (
                  <Avatar src={user.avatarUrl} name={user.name} size="lg" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-[#05060f]">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-300">Your Story</span>
            </div>
          );
        })()}

        {/* Stories from following */}
        {stories.map((story, index) => {
          // If this is current user's story, we already handled it in "Your Story" above
          if (user && story.userId === user.id) return null;

          const isSeen = user ? story.seenByUserIds.includes(user.id) : false;
          const media = story.mediaUrl || story.slides?.[0]?.mediaUrl;
          const hasValidMedia = media && (media.startsWith('http') || media.startsWith('data:image'));
          const authorUser = allUsers.find((u) => u.id === story.userId || u.name.toLowerCase() === story.userName.toLowerCase());
          const isAuthorOnline = authorUser?.status === 'online' || authorUser?.status === 'busy';

          return (
            <div
              key={story.id}
              id={`story-item-${story.id}`}
              onClick={() => setSelectedStoryIndex(index)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div
                className={`relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl transition-all duration-200 group-hover:scale-105 ${
                  isSeen
                    ? 'border-2 border-white/15 bg-white/5 p-0.5'
                    : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.45)]'
                }`}
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950 relative border border-black/40">
                  {/* Story Actual Image or Text Snippet */}
                  {hasValidMedia ? (
                    <img
                      src={media}
                      alt={story.userName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 p-1.5 flex items-center justify-center text-center">
                      <p className="text-[9px] text-white font-bold line-clamp-3 leading-tight">
                        {story.caption || story.userName}
                      </p>
                    </div>
                  )}

                  {/* Caption gradient overlay if caption exists */}
                  {story.caption && hasValidMedia && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1 pt-2 pointer-events-none">
                      <p className="text-[8px] text-white/95 truncate font-semibold leading-tight">
                        {story.caption}
                      </p>
                    </div>
                  )}

                  {/* Author Mini Avatar Badge in Corner with Online Pulse Dot */}
                  <div className="absolute top-1 left-1 ring-1.5 ring-black/70 rounded-full shadow-lg z-10 relative">
                    <Avatar src={story.userAvatar} name={story.userName} size="xs" />
                    {isAuthorOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black ring-1 ring-emerald-500/50" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 max-w-[64px] sm:max-w-[70px]">
                {isAuthorOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                <span className="text-[11px] font-medium text-slate-300 truncate text-center">
                  {story.userName.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
          onOpenChat={() => {
            setSelectedStoryIndex(null);
            window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'chat' } }));
          }}
        />
      )}

      {/* Add Story Modal */}
      {isAddingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-[#070a1a]/95 backdrop-blur-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Share 24-Hour Story
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Camera mode */}
              {isCapturingCamera ? (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/20 aspect-[9/16] max-h-72 mx-auto">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : storyImageUrl ? (
                /* Active Story Image Preview */
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/60 aspect-[9/14] max-h-64 mx-auto group">
                  <img
                    src={storyImageUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setStoryImageUrl('')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {storyCaption && (
                    <div className="absolute bottom-3 inset-x-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs text-center font-medium">
                      {storyCaption}
                    </div>
                  )}
                </div>
              ) : (
                /* Drag & Drop / File Upload Card */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
                      : 'border-white/20 hover:border-blue-400/60 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Click to browse or drop photo here
                  </p>
                  <p className="text-xs text-slate-400">Supports PNG, JPG, WebP, GIF</p>
                </div>
              )}

              {/* Upload & Camera Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Take Selfie</span>
                </button>
              </div>

              {/* Direct URL input */}
              <div>
                <input
                  type="text"
                  placeholder="Or paste photo URL (https://...)"
                  value={storyImageUrl}
                  onChange={(e) => setStoryImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Presets */}
              <div>
                <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Or choose a Christian Art preset:</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                  {PRESET_STORY_IMAGES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        soundEffects.playTap();
                        setStoryImageUrl(item.url);
                      }}
                      className={`aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all relative group ${
                        storyImageUrl === item.url
                          ? 'border-blue-400 ring-2 ring-blue-500/40 scale-105'
                          : 'border-white/10 hover:border-white/40 opacity-75 hover:opacity-100'
                      }`}
                      title={item.name}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 px-1 py-0.5 text-[8px] text-white truncate text-center">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Caption (Optional)</label>
                  <div className="flex items-center gap-1">
                    {STORY_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setStoryCaption((prev) => prev + emoji)}
                        className="text-xs hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="What's happening right now?"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!storyImageUrl && PRESET_STORY_IMAGES.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all hover:scale-105"
                >
                  Post Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

