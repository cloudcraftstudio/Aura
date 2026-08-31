import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Link2, Youtube, CheckCircle2 } from 'lucide-react';

interface SermonFile {
  id: string;
  file: File;
  title: string;
  speaker: string;
  series: string;
  scriptureRef: string;
  description: string;
  progress: number;
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
  const [entryMode, setEntryMode] = useState<'file' | 'youtube'>('youtube');
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytSpeaker, setYtSpeaker] = useState("");
  const [ytSeries, setYtSeries] = useState("");
  const [ytScripture, setYtScripture] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [isSubmittingYt, setIsSubmittingYt] = useState(false);
  const [ytFeedback, setYtFeedback] = useState<string | null>(null);

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;
    setIsSubmittingYt(true);
    setYtFeedback(null);

    const match = ytUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    const ytId = match ? match[1] : undefined;

    try {
      const res = await fetch("/api/bible/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ytTitle.trim() || "YouTube Sermon",
          speaker: ytSpeaker.trim() || "Speaker",
          series: ytSeries.trim(),
          scriptureRef: ytScripture.trim(),
          description: ytDescription.trim(),
          mediaType: "video",
          mediaUrl: ytUrl.trim(),
          youtubeId: ytId,
          category: "Studio Recording",
          dateRecorded: new Date().toISOString().split("T")[0]
        })
      });

      if (res.ok) {
        setYtFeedback("YouTube sermon saved successfully!");
        setYtUrl("");
        setYtTitle("");
        setYtSpeaker("");
        setYtSeries("");
        setYtScripture("");
        setYtDescription("");
        setTimeout(() => setYtFeedback(null), 3000);
      } else {
        setYtFeedback("Failed to save YouTube sermon. Please try again.");
      }
    } catch (err) {
      setYtFeedback("Network error saving sermon.");
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
    const newSermons = files
      .filter(f => /\.(mp3|m4a|wav|mp4|mov|webm)$/i.test(f.name))
      .map(file => ({
        id: Math.random().toString(),
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        speaker: '',
        series: '',
        scriptureRef: '',
        description: '',
        progress: 0,
        uploading: false
      }));

    setSermons(prev => [...prev, ...newSermons]);
  };

  const updateSermon = (id: string, field: string, value: string) => {
    setSermons(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const uploadSermon = async (sermon: SermonFile) => {
    setSermons(prev =>
      prev.map(s => s.id === sermon.id ? { ...s, uploading: true } : s)
    );

    try {
      const formData = new FormData();
      formData.append('file', sermon.file);
      formData.append('title', sermon.title);
      formData.append('speaker', sermon.speaker);
      formData.append('series', sermon.series);
      formData.append('scriptureRef', sermon.scriptureRef);
      formData.append('description', sermon.description);

      const res = await fetch('/api/bible/media/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setSermons(prev => prev.filter(s => s.id !== sermon.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Upload failed:', errData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setSermons(prev =>
        prev.map(s => s.id === sermon.id ? { ...s, uploading: false } : s)
      );
    }
  };

  const removeSermon = (id: string) => {
    setSermons(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold text-blue-300">Podcast & Sermon Library</h2>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setEntryMode('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            entryMode === 'youtube'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>YouTube Link</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            entryMode === 'file'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File (MP4 / MP3)</span>
        </button>
      </div>

      {entryMode === 'youtube' ? (
        <form onSubmit={handleYouTubeSubmit} className="bg-slate-900/60 border border-rose-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Link2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Insert YouTube Sermon URL</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube Link or Embed URL *</label>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={ytUrl}
              onChange={e => setYtUrl(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sermon Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. The Power of Faith"
                value={ytTitle}
                onChange={e => setYtTitle(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Speaker / Preacher</label>
              <input
                type="text"
                placeholder="e.g. Pastor Paul"
                value={ytSpeaker}
                onChange={e => setYtSpeaker(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scripture Reference</label>
              <input
                type="text"
                placeholder="e.g. Hebrews 11:1"
                value={ytScripture}
                onChange={e => setYtScripture(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Series</label>
              <input
                type="text"
                placeholder="e.g. Faith Foundations"
                value={ytSeries}
                onChange={e => setYtSeries(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Summary or study notes..."
              value={ytDescription}
              onChange={e => setYtDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          {ytFeedback && (
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${ytFeedback.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>
              {ytFeedback.includes("successfully") && <CheckCircle2 className="w-4 h-4" />}
              {ytFeedback}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmittingYt}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmittingYt ? <Loader className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
            <span>{isSubmittingYt ? "Saving..." : "Add YouTube Sermon"}</span>
          </button>
        </form>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-900/20"
              : "border-blue-500/30 bg-blue-950/10"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-blue-400" />
          <p className="text-gray-300 mb-2">Drag and drop audio/video files here</p>
          <p className="text-sm text-gray-500 mb-4">Supports: MP3, M4A, WAV, MP4, MOV, WebM (up to 500MB)</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Select Files
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
      )}

      {/* Sermon List */}
      {sermons.length > 0 && (
        <div className="space-y-4">
          {sermons.map(sermon => (
            <div key={sermon.id} className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    value={sermon.title}
                    onChange={e => updateSermon(sermon.id, 'title', e.target.value)}
                    placeholder="Sermon Title"
                    className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={sermon.speaker}
                      onChange={e => updateSermon(sermon.id, 'speaker', e.target.value)}
                      placeholder="Speaker/Preacher"
                      className="bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 text-sm"
                    />
                    <input
                      type="text"
                      value={sermon.series}
                      onChange={e => updateSermon(sermon.id, 'series', e.target.value)}
                      placeholder="Series Name"
                      className="bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={sermon.scriptureRef}
                    onChange={e => updateSermon(sermon.id, 'scriptureRef', e.target.value)}
                    placeholder="Scripture Reference (e.g., John 3:16)"
                    className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 mb-2 text-sm"
                  />
                  <textarea
                    value={sermon.description}
                    onChange={e => updateSermon(sermon.id, 'description', e.target.value)}
                    placeholder="Description/Notes"
                    className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 text-sm h-16"
                  />
                </div>
                <button
                  onClick={() => removeSermon(sermon.id)}
                  className="text-gray-400 hover:text-red-400 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => uploadSermon(sermon)}
                  disabled={sermon.uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  {sermon.uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
