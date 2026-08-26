import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  Video,
  Mic,
  Bell,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Volume2,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { usePermissions } from '../../context/PermissionsContext';
import { soundEffects } from '../../services/audio';

export const PermissionsModal: React.FC = () => {
  const {
    isPermissionsModalOpen,
    closePermissionsModal,
    cameraStatus,
    micStatus,
    notificationStatus,
    pwaStatus,
    isStandalone,
    requestCameraPermission,
    requestMicPermission,
    requestMediaPermissions,
    requestNotificationPermission,
    requestAllPermissions,
    promptSaveToHome,
    checkAllPermissions,
    sendTestNotification,
    openSaveToHomeModal,
  } = usePermissions();

  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [activeCameraStream, setActiveCameraStream] = useState<MediaStream | null>(null);
  const [activeMicStream, setActiveMicStream] = useState<MediaStream | null>(null);

  const videoTestRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCameraTest = useCallback(() => {
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach((t) => t.stop());
      setActiveCameraStream(null);
    }
    setIsTestingCamera(false);
  }, [activeCameraStream]);

  const stopMicTest = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (activeMicStream) {
      activeMicStream.getTracks().forEach((t) => t.stop());
      setActiveMicStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsTestingMic(false);
    setMicVolumeLevel(0);
  }, [activeMicStream]);

  // Clean up media streams when modal closes or unmounts
  useEffect(() => {
    if (!isPermissionsModalOpen) {
      stopCameraTest();
      stopMicTest();
    }
    return () => {
      stopCameraTest();
      stopMicTest();
    };
  }, [isPermissionsModalOpen, stopCameraTest, stopMicTest]);

  // Live Camera Test
  const startCameraTest = async () => {
    try {
      const granted = await requestCameraPermission();
      if (!granted) return;

      setIsTestingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setActiveCameraStream(stream);
      if (videoTestRef.current) {
        videoTestRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera test start error:', e);
      setIsTestingCamera(false);
    }
  };

  // Live Mic Audio Meter Test
  const startMicTest = async () => {
    try {
      const granted = await requestMicPermission();
      if (!granted) return;

      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setActiveMicStream(stream);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolumeLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('Mic test start error:', e);
      setIsTestingMic(false);
    }
  };

  if (!isPermissionsModalOpen) return null;

  const isMediaComplete = cameraStatus === 'granted' && micStatus === 'granted';
  const isNotifComplete = notificationStatus === 'granted';
  const isPwaComplete = isStandalone || pwaStatus === 'installed';

  return (
    <div
      id="app-permissions-modal"
      onClick={closePermissionsModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fade-in select-none overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#090d22]/95 border border-white/20 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white my-auto"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">App Permissions & Device Setup</h3>
              <p className="text-[10px] text-slate-400">Camera, microphone, push notifications & PWA</p>
            </div>
          </div>
          <button
            onClick={closePermissionsModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
          {/* Quick Grant All Banner */}
          {(!isMediaComplete || !isNotifComplete) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>One-Click Permission Setup</span>
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  Grant Camera, Mic, and Notifications simultaneously
                </p>
              </div>
              <button
                type="button"
                onClick={requestAllPermissions}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-1.5 flex-shrink-0 transition-all hover:scale-105 active:scale-95"
              >
                <span>Allow All</span>
              </button>
            </div>
          )}

          {/* 1. Camera Section */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Camera Access</h4>
                  <p className="text-[10px] text-slate-400">Required for HD WebRTC video chat & avatar capture</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cameraStatus === 'granted' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestCameraPermission}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Allow
                  </button>
                )}
              </div>
            </div>

            {/* Live Camera Viewfinder Test */}
            {cameraStatus === 'granted' && (
              <div className="pt-1">
                {isTestingCamera ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-40 border border-white/20 flex items-center justify-center">
                    <video ref={videoTestRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <button
                      type="button"
                      onClick={stopCameraTest}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-slate-300 text-[10px] font-bold border border-white/20"
                    >
                      Stop Test
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCameraTest}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Test Live Camera View</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Microphone Section */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Microphone Access</h4>
                  <p className="text-[10px] text-slate-400">Required for voice calls, loudspeaker, & audio notes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {micStatus === 'granted' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestMicPermission}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Allow
                  </button>
                )}
              </div>
            </div>

            {/* Live Audio Level Meter */}
            {micStatus === 'granted' && (
              <div className="pt-1 space-y-2">
                {isTestingMic ? (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/15 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Speak into microphone...</span>
                      </span>
                      <span className="font-mono text-emerald-400">{micVolumeLevel}%</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75 rounded-full"
                        style={{ width: `${Math.max(5, micVolumeLevel)}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={stopMicTest}
                      className="w-full py-1 text-center text-[10px] text-slate-400 hover:text-white"
                    >
                      Stop Mic Test
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startMicTest}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Test Microphone Input Level</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. Notifications Section */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Push & Sound Notifications</h4>
                  <p className="text-[10px] text-slate-400">Incoming call rings, direct messages & post interactions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notificationStatus === 'granted' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Allow
                  </button>
                )}
              </div>
            </div>

            {/* Test Notification Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={sendTestNotification}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Send Test Push & Chime Alert</span>
              </button>
            </div>
          </div>

          {/* 4. Save to Home Screen Section */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Save to Home Screen</h4>
                  <p className="text-[10px] text-slate-400">Run as full-screen PWA with zero browser bars</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closePermissionsModal();
                  openSaveToHomeModal();
                }}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
              >
                <span>{isPwaComplete ? 'Manage' : 'Add App'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Troubleshoot / Browser Settings Helper */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
            <p className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Permission Troubleshooting:</span>
            </p>
            <p className="text-[11px] text-blue-300/80">
              If your browser previously blocked Camera or Mic, tap the <strong className="text-white">lock 🔒</strong> icon in your browser URL address bar and choose <strong className="text-white">&ldquo;Allow&rdquo;</strong> for Camera and Microphone.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
