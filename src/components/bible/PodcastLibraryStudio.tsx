import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Loader,
  Link2,
  Youtube,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  FileAudio,
  Film,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { UniversalUnsplashModal } from '../common/UniversalUnsplashModal';

interface SermonFile {
  id: string;
  file: File;
  title: string;
  speaker: string;
  series: string;
  scriptureRef: string;
  description: string;
  progress: number;
  thumbnailUrl?: string;
  uploading: boolean;
}

interface Course {
  id: string;
  title: string;
}

export function PodcastLibraryStudio({ courses }: { courses: Course[] }) {
  const [sermons, setSermons] = useState<SermonFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverDirectUploadRef = useRef<HTMLInputElement>(null);

  // Unsplash modal state
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [unsplashTarget, setUnsplashTarget] = useState<'youtube' | string | null>(null);

  // YouTube entry form state
  const [entryMode, setEntryMode] = useState<'youtube' | 'file'>('youtube');
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytSpeaker, setYtSpeaker] = useState('');
  const [ytSeries, setYtSeries] = useState('');
  const [ytScripture, setYtScripture] = useState('');
  const [ytDescription, setYtDescription] = useState('');
  const [ytThumbnail, setYtThumbnail] = useState('');
  const [isSubmittingYt, setIsSubmittingYt] = useState(false);
  const [ytFeedback, setYtFeedback] = useState<string | null>(null);

  // Extract YouTube thumbnail whenever URL changes
  const handleYtUrlChange = (url: string) => {
    setYtUrl(url);
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
    );
    if (match && !ytThumbnail) {
      setYtThumbnail(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
    }
  };

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;
    setIsSubmittingYt(true);
    setYtFeedback(null);

    const match = ytUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
    );
    const ytId = match ? match[1] : undefined;

    try {
      const res = await fetch('/api/bible/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ytTitle.trim() || 'YouTube Sermon',
          speaker: ytSpeaker.trim() || 'Speaker',
          series: ytSeries.trim(),
          scriptureRef: ytScripture.trim(),
          description: ytDescription.trim(),
          mediaType: 'video',
          mediaUrl: ytUrl.trim(),
          youtubeId: ytId,
          thumbnailUrl: ytThumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined),
          category: 'Studio Recording',
          dateRecorded: new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setYtFeedback('Sermon published successfully with cover image!');
        setYtUrl('');
        setYtTitle('');
        setYtSpeaker('');
        setYtSeries('');
        setYtScripture('');
        setYtDescription('');
        setYtThumbnail('');
        setTimeout(() => setYtFeedback(null), 3500);
      } else {
        setYtFeedback('Failed to save YouTube sermon. Please try again.');
      }
    } catch (err) {
      setYtFeedback('Network error saving sermon.');
    } finally {
      setIsSubmittingYt(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newSermons: SermonFile[] = files
      .filter((f) => /\.(mp3|m4a|wav|mp4|mov|webm)$/i.test(f.name))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        speaker: '',
        series: '',
        scriptureRef: '',
        description: '',
        progress: 0,
        thumbnailUrl: '',
        uploading: false,
      }));

    setSermons((prev) => [...prev, ...newSermons]);
  };

  const updateSermon = (id: string, field: keyof SermonFile, value: any) => {
    setSermons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Direct cover file upload
  const handleDirectCoverUpload = async (
    target: 'youtube' | string,
    file: File
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/bible/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.mediaUrl;
        if (target === 'youtube') {
          setYtThumbnail(url);
        } else {
          updateSermon(target, 'thumbnailUrl', url);
        }
      } else {
        // Fallback to local Data URL
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          if (target === 'youtube') {
            setYtThumbnail(dataUrl);
          } else {
            updateSermon(target, 'thumbnailUrl', dataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Cover upload error:', err);
    }
  };

  const handleOpenUnsplash = (target: 'youtube' | string) => {
    setUnsplashTarget(target);
    setIsUnsplashOpen(true);
  };

  const handleSelectUnsplashPhoto = (imageUrl: string) => {
    if (unsplashTarget === 'youtube') {
      setYtThumbnail(imageUrl);
    } else if (unsplashTarget) {
      updateSermon(unsplashTarget, 'thumbnailUrl', imageUrl);
    }
    setUnsplashTarget(null);
  };

  const uploadSermon = async (sermon: SermonFile) => {
    setSermons((prev) =>
      prev.map((s) => (s.id === sermon.id ? { ...s, uploading: true } : s))
    );

    try {
      const formData = new FormData();
      formData.append('file', sermon.file);
      formData.append('title', sermon.title || sermon.file.name);
      formData.append('speaker', sermon.speaker);
      formData.append('series', sermon.series);
      formData.append('scriptureRef', sermon.scriptureRef);
      formData.append('description', sermon.description);
      if (sermon.thumbnailUrl) {
        formData.append('thumbnailUrl', sermon.thumbnailUrl);
      }

      const res = await fetch('/api/bible/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSermons((prev) => prev.filter((s) => s.id !== sermon.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Upload failed:', errData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setSermons((prev) =>
        prev.map((s) => (s.id === sermon.id ? { ...s, uploading: false } : s))
      );
    }
  };

  const removeSermon = (id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden file input for direct cover uploads */}
      <input
        ref={coverDirectUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && unsplashTarget) {
            handleDirectCoverUpload(unsplashTarget, file);
          }
        }}
      />

      {/* Universal Unsplash Modal */}
      <UniversalUnsplashModal
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={handleSelectUnsplashPhoto}
        title="Select Sermon or Podcast Cover Art"
        initialQuery="worship pulpit cross bible"
      />

      {/* Segmented Mode Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 w-fit shadow-xl">
        <button
          type="button"
          onClick={() => setEntryMode('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            entryMode === 'youtube'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>YouTube Link / Channels</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            entryMode === 'file'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Audio / Video Files</span>
        </button>
      </div>

      {entryMode === 'youtube' ? (
        <form
          onSubmit={handleYouTubeSubmit}
          className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-rose-400">
              <Link2 className="w-5 h-5" />
              <h3 className="font-bold text-sm sm:text-base text-white">Add YouTube Sermon to Library</h3>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              Video & Audio Synced
            </span>
          </div>

          {/* YouTube URL input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              YouTube Video URL or Shorts Link *
            </label>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={ytUrl}
              onChange={(e) => handleYtUrlChange(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          {/* Cover Image Selector: Direct Upload + Unsplash */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Cover Image (Unsplash or Direct Upload)
              </span>
              {ytThumbnail && (
                <button
                  type="button"
                  onClick={() => setYtThumbnail('')}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove Cover
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {ytThumbnail ? (
                <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-white/20 group shadow-md">
                  <img
                    src={ytThumbnail}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenUnsplash('youtube')}
                      className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                    >
                      Unsplash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnsplashTarget('youtube');
                        coverDirectUploadRef.current?.click();
                      }}
                      className="p-1.5 rounded-lg bg-slate-700 text-white text-[10px] font-bold"
                    >
                      Direct
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-44 h-24 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
                  <span>No cover selected</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleOpenUnsplash('youtube')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Choose from Unsplash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUnsplashTarget('youtube');
                    coverDirectUploadRef.current?.click();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Direct File Upload</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sermon Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. The Power of Persevering Prayer"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Speaker / Preacher</label>
              <input
                type="text"
                placeholder="e.g. Pastor Luke Shope"
                value={ytSpeaker}
                onChange={(e) => setYtSpeaker(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scripture Reference</label>
              <input
                type="text"
                placeholder="e.g. James 5:16"
                value={ytScripture}
                onChange={(e) => setYtScripture(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Series / Ministry</label>
              <input
                type="text"
                placeholder="e.g. Living in Holiness"
                value={ytSeries}
                onChange={(e) => setYtSeries(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Outline, key takeaways, or sermon notes..."
              value={ytDescription}
              onChange={(e) => setYtDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {ytFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                ytFeedback.includes('successfully')
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {ytFeedback.includes('successfully') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
              {ytFeedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingYt}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
          >
            {isSubmittingYt ? <Loader className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
            <span>{isSubmittingYt ? 'Adding to Library...' : 'Publish YouTube Sermon'}</span>
          </button>
        </form>
      ) : (
        /* Direct Audio & Video Upload Mode */
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all bg-slate-900/60 backdrop-blur-md shadow-xl ${
              dragActive
                ? 'border-blue-400 bg-blue-950/30 scale-[1.01]'
                : 'border-white/20 hover:border-blue-500/50'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              Drag and drop sermon media here
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
              Supports: MP3, M4A, WAV (Audio Podcasts) and MP4, MOV, WebM (Video Sermons) up to 500MB.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              Browse Audio / Video Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp3,.m4a,.wav,.mp4,.mov,.webm"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Staged Upload Queue with Cover Image Support */}
          {sermons.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>Staged Upload Queue ({sermons.length})</span>
              </h3>

              {sermons.map((sermon) => {
                const isAudio = /\.(mp3|m4a|wav)$/i.test(sermon.file.name);
                return (
                  <div
                    key={sermon.id}
                    className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isAudio ? (
                          <FileAudio className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Film className="w-5 h-5 text-blue-400" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-sm">
                            {sermon.file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(sermon.file.size / (1024 * 1024)).toFixed(1)} MB • {isAudio ? 'Audio Sermon' : 'Video Sermon'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSermon(sermon.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cover Art Selector for this Sermon */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
                      {sermon.thumbnailUrl ? (
                        <div className="relative w-28 aspect-video rounded-lg overflow-hidden border border-white/20 group">
                          <img
                            src={sermon.thumbnailUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => updateSermon(sermon.id, 'thumbnailUrl', '')}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-rose-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-16 rounded-lg border border-dashed border-white/15 bg-white/5 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                          <ImageIcon className="w-4 h-4 mb-0.5 text-slate-400" />
                          <span>No cover</span>
                        </div>
                      )}

                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUnsplash(sermon.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Unsplash Cover</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUnsplashTarget(sermon.id);
                            coverDirectUploadRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-400" />
                          <span>Direct Cover Upload</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={sermon.title}
                        onChange={(e) => updateSermon(sermon.id, 'title', e.target.value)}
                        placeholder="Sermon Title *"
                        className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={sermon.speaker}
                        onChange={(e) => updateSermon(sermon.id, 'speaker', e.target.value)}
                        placeholder="Speaker / Preacher"
                        className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={sermon.scriptureRef}
                        onChange={(e) => updateSermon(sermon.id, 'scriptureRef', e.target.value)}
                        placeholder="Scripture Ref (e.g. John 1:1)"
                        className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={sermon.series}
                        onChange={(e) => updateSermon(sermon.id, 'series', e.target.value)}
                        placeholder="Series Name"
                        className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={sermon.description}
                      onChange={(e) => updateSermon(sermon.id, 'description', e.target.value)}
                      placeholder="Summary or study outline..."
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => uploadSermon(sermon)}
                      disabled={sermon.uploading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                    >
                      {sermon.uploading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Uploading Media & Attaching Cover...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Complete & Publish to Library</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
