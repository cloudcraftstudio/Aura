import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, Video, Download, Plus, RefreshCw } from 'lucide-react';

interface Sermon {
  id: string;
  title: string;
  scriptureRef?: string;
  speaker?: string;
  series?: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: 'audio' | 'video';
  duration?: number;
  dateRecorded?: string;
  blob?: Blob;
}

export function LiveSermonStudio() {
  const [activeTab, setActiveTab] = useState<'live' | 'archive'>('live');
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sermonTitle, setSermonTitle] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [loadingArchive, setLoadingArchive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Load persistent sermons from SQLite
  const fetchSermons = async () => {
    setLoadingArchive(true);
    try {
      const res = await fetch('/api/bible/sermons');
      if (res.ok) {
        const data = await res.json();
        setSermons(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sermons:', err);
    } finally {
      setLoadingArchive(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLive(true);
    } catch (error) {
      console.error('Failed to access camera/microphone:', error);
      alert('Unable to access camera or microphone. Please check permissions.');
    }
  };

  const stopLive = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    startTimeRef.current = Date.now();

    const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? { mimeType: 'video/webm;codecs=vp9,opus' }
      : { mimeType: 'video/webm' };

    const mediaRecorder = new MediaRecorder(streamRef.current, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const title = sermonTitle.trim() || `Sermon - ${new Date().toLocaleDateString()}`;
      const ref = scriptureRef.trim() || 'Scripture Study';

      // Upload to server disk and insert record in SQLite
      try {
        const formData = new FormData();
        formData.append('file', blob, `${title.replace(/\s+/g, '_')}.webm`);
        formData.append('title', title);
        formData.append('scriptureRef', ref);
        formData.append('duration', duration.toString());

        const res = await fetch('/api/bible/media/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.sermon) {
            setSermons(prev => [data.sermon, ...prev.filter(s => s.id !== data.sermon.id)]);
          }
        }
      } catch (err) {
        console.warn('Sermon upload failed:', err);
      }

      setSermonTitle('');
      setScriptureRef('');
      setIsRecording(false);
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadSermon = (sermon: Sermon) => {
    const src = sermon.mediaUrl || (sermon.blob ? URL.createObjectURL(sermon.blob) : undefined);
    if (!src) return;

    const a = document.createElement('a');
    a.href = src;
    a.download = `${sermon.title}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6 border-b border-blue-500/30">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'live'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Video className="inline mr-2 w-5 h-5" />
            Go Live / Preach
          </button>
          <button
            onClick={() => {
              setActiveTab('archive');
              fetchSermons();
            }}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'archive'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Play className="inline mr-2 w-5 h-5" />
            Sermon Archive
          </button>
        </div>
        {activeTab === 'archive' && (
          <button
            onClick={fetchSermons}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 pb-2"
          >
            <RefreshCw className={`w-4 h-4 ${loadingArchive ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Live Preaching Tab */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-4">
            <h2 className="text-2xl font-bold text-blue-300">Go Live / Preach</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Sermon Title</label>
              <input
                type="text"
                value={sermonTitle}
                onChange={e => setSermonTitle(e.target.value)}
                placeholder="e.g., The Gospel of John - Chapter 3"
                className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Scripture Reference</label>
              <input
                type="text"
                value={scriptureRef}
                onChange={e => setScriptureRef(e.target.value)}
                placeholder="e.g., John 3:1-21"
                className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="bg-black rounded-lg overflow-hidden border border-blue-500/30">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video bg-black"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            {!isLive ? (
              <button
                onClick={startLive}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <Video className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 font-bold py-3 px-6 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5" />
                      Stop Recording & Save
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Record Sermon
                    </>
                  )}
                </button>
                <button
                  onClick={stopLive}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <Square className="w-5 h-5" />
                  Stop Camera
                </button>
              </>
            )}
          </div>

          {isRecording && (
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 text-center">
              <p className="text-red-300 font-bold animate-pulse">🔴 RECORDING IN PROGRESS - Will auto-save to Archive on Stop</p>
            </div>
          )}
        </div>
      )}

      {/* Sermon Archive Tab */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          {sermons.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-blue-950/10 rounded-lg border border-blue-500/20">
              <p>No sermons recorded yet. Record a sermon or upload files to see them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sermons.map(sermon => (
                <div key={sermon.id} className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-blue-300">{sermon.title}</h3>
                      {sermon.scriptureRef && <p className="text-sm text-gray-400">{sermon.scriptureRef}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {sermon.dateRecorded || 'Recently recorded'} {sermon.duration ? `• ${formatDuration(sermon.duration)}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSermon(selectedSermon?.id === sermon.id ? null : sermon)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                        title="Play / Inspect"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      {(sermon.mediaUrl || sermon.blob) && (
                        <button
                          onClick={() => downloadSermon(sermon)}
                          className="text-blue-400 hover:text-blue-300 p-2"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedSermon?.id === sermon.id && sermon.mediaUrl && (
                    <div className="mt-4">
                      {sermon.mediaType === 'audio' ? (
                        <audio controls className="w-full mt-2" src={sermon.mediaUrl} />
                      ) : (
                        <video controls className="w-full rounded bg-black max-h-96" src={sermon.mediaUrl} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
