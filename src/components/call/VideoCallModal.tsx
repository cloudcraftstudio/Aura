import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  PhoneCall,
  Sparkles,
  ArrowLeftRight,
  RefreshCw,
  LayoutGrid,
  Square,
  Eye,
  EyeOff,
  Scan,
  Maximize,
  Move,
  Camera,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';


const CALLING_CARDS = [
  "/cards/callingcard1.jpeg",
  "/cards/callingcard2.jpeg",
  "/cards/callingcard3.jpeg",
  "/cards/callingcard4.jpeg",
  "/cards/callingcard5.jpg",
  "/cards/callingcard6.jpg",
  "/cards/callingcard7.jpg",
  "/cards/callingcard8.jpg",
  "/cards/callingcard9.jpg"
];

export const VideoCallModal: React.FC = () => {
  const { user } = useAuth();
  const {
    activeCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    isSpeakerOn,
    callDuration,
    isPipMode,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleSpeaker,
    togglePipMode,
    switchCamera,
    getVideoDevices,
    simulateCompanionAnswer,
    endCall,
  } = useCall();

  // View state controls
  
  const [activeCard, setActiveCard] = useState<string>(CALLING_CARDS[0]);

  useEffect(() => {
    if (activeCall?.roomId || activeCall?.id) {
      const stored = parseInt(localStorage.getItem("aura_last_card_idx") || "0", 10);
      setActiveCard(CALLING_CARDS[stored % CALLING_CARDS.length]);
    }
  }, [activeCall?.roomId, activeCall?.id]);

  const [layoutMode, setLayoutMode] = useState<'spotlight' | 'grid'>('spotlight');
  const [isViewSwapped, setIsViewSwapped] = useState(false); // false = Remote on Big Stage, Local on Floating Inset
  const [isSelfViewMinimized, setIsSelfViewMinimized] = useState(false);
  const [selfViewSize, setSelfViewSize] = useState<'normal' | 'large'>('normal');
  const [videoFitMode, setVideoFitMode] = useState<'cover' | 'contain'>('cover');
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  // Dedicated video element references
  const mainStageVideoRef = useRef<HTMLVideoElement | null>(null);
  const selfTileVideoRef = useRef<HTMLVideoElement | null>(null);
  const gridRemoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const gridLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipRemoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const stageBoundsRef = useRef<HTMLDivElement | null>(null);

  // Derive Peer Name and Avatar
  const isCaller = user?.id === activeCall?.callerId;
  const peerName = isCaller ? activeCall?.receiverName || 'User' : activeCall?.callerName || 'User';
  const peerAvatar = isCaller ? activeCall?.receiverAvatar : activeCall?.callerAvatar;

  // Query camera devices on mount
  useEffect(() => {
    getVideoDevices().then((devices) => {
      setAvailableCameras(devices);
    });
  }, [getVideoDevices]);

  // Handle stream attachments whenever streams or layout modes change
  useEffect(() => {
    // 1. Remote Audio stream (handles speech playback)
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.4;
      remoteAudioRef.current.play().catch(() => {});
    }

    // 2. Spotlight Mode Streams:
    // Main Stage: Remote Stream (or Local Stream if user explicitly swapped views)
    const mainStream = isViewSwapped ? localStream : remoteStream;
    if (mainStageVideoRef.current && mainStream) {
      mainStageVideoRef.current.srcObject = mainStream;
      mainStageVideoRef.current.volume = isViewSwapped ? 0 : isSpeakerOn ? 1.0 : 0.4;
      mainStageVideoRef.current.play().catch(() => {});
    }

    // Floating Inset: Local Stream (or Remote Stream if swapped)
    const selfStream = isViewSwapped ? remoteStream : localStream;
    if (selfTileVideoRef.current && selfStream) {
      selfTileVideoRef.current.srcObject = selfStream;
      selfTileVideoRef.current.volume = isViewSwapped && isSpeakerOn ? 1.0 : 0;
      selfTileVideoRef.current.play().catch(() => {});
    }

    // 3. Grid Mode Streams:
    if (gridRemoteVideoRef.current && remoteStream) {
      gridRemoteVideoRef.current.srcObject = remoteStream;
      gridRemoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0.4;
      gridRemoteVideoRef.current.play().catch(() => {});
    }
    if (gridLocalVideoRef.current && localStream) {
      gridLocalVideoRef.current.srcObject = localStream;
      gridLocalVideoRef.current.volume = 0;
      gridLocalVideoRef.current.play().catch(() => {});
    }

    // 4. Picture-in-Picture streams
    if (pipRemoteVideoRef.current && remoteStream) {
      pipRemoteVideoRef.current.srcObject = remoteStream;
      pipRemoteVideoRef.current.play().catch(() => {});
    }
    if (pipLocalVideoRef.current && localStream) {
      pipLocalVideoRef.current.srcObject = localStream;
      pipLocalVideoRef.current.play().catch(() => {});
    }
  }, [
    localStream,
    remoteStream,
    isViewSwapped,
    layoutMode,
    isPipMode,
    isSpeakerOn,
    isSelfViewMinimized,
  ]);

  if (!activeCall) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const isConnected = activeCall.status === 'connected';

  const handleCameraFlip = async () => {
    setIsSwitchingCamera(true);
    try {
      await switchCamera();
      const devices = await getVideoDevices();
      setAvailableCameras(devices);
    } finally {
      setTimeout(() => setIsSwitchingCamera(false), 600);
    }
  };

  // ----------------------------------------------------
  // Picture-in-Picture Mini Floating Widget (when minimized)
  // ----------------------------------------------------
  if (isPipMode) {
    return (
      <motion.div
        drag
        dragConstraints={{ left: 10, right: window.innerWidth - 300, top: 10, bottom: window.innerHeight - 200 }}
        id="pip-call-widget"
        className="fixed bottom-20 right-4 sm:right-6 z-[9999] w-72 rounded-[24px] overflow-hidden bg-[#05060f]/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-white cursor-move"
      >
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          {remoteStream && isConnected ? (
            <video
              ref={pipRemoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar src={peerAvatar} name={peerName} size="md" />
              <span className="text-xs text-slate-300 font-medium animate-pulse">
                {isConnected ? 'Connecting media...' : 'Ringing...'}
              </span>
            </div>
          )}

          {/* Local inset preview */}
          <div className="absolute bottom-2 right-2 w-20 h-28 rounded-xl overflow-hidden border border-white/30 bg-slate-900 shadow-md">
            <video
              ref={pipLocalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover object-center scale-x-[-1]"
            />
          </div>

          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-blue-300">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            {isConnected ? formatTimer(callDuration) : 'Calling...'}
          </div>

          <button
            id="maximize-call-btn"
            onClick={togglePipMode}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-2.5 flex items-center justify-between bg-white/5 border-t border-white/10">
          <span className="text-xs font-semibold truncate max-w-[120px]">
            {peerName}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-xl text-xs ${isAudioMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white'}`}
            >
              {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={endCall}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ----------------------------------------------------
  // Full Google Meet-Style WebRTC Call Experience
  // ----------------------------------------------------
  const mainParticipantName = isViewSwapped ? 'You' : peerName;
  const selfTileParticipantName = isViewSwapped ? peerName : 'You';
  const isMainMuted = isViewSwapped ? isAudioMuted : false;

  return (
    <div
      id="video-call-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-1 sm:p-3 md:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in select-none"
    >
      {/* Hidden audio element to guarantee remote peer audio output */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        id="call-container"
        className="relative w-full max-w-6xl h-[96vh] sm:h-[90vh] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#070913]/95 border border-white/15 shadow-2xl backdrop-blur-3xl flex flex-col justify-between"
      >
        {/* ================= TOP HEADER BAR ================= */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <Avatar src={peerAvatar} name={peerName} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                  {peerName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> E2EE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  {isConnected ? 'Connected' : 'Ringing (Super Mario)...'}
                </span>
                • <span>{activeCall.isVideo ? '1080p HD' : 'Spatial Audio'}</span>
                • <span className="text-slate-300">{isSpeakerOn ? '🔊 Speaker' : '🔈 Earpiece'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Call duration timer */}
            <div className="px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono font-medium text-slate-100 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isConnected ? formatTimer(callDuration) : 'Ringing...'}
            </div>

            {/* Video fit/fill mode toggle */}
            {activeCall.isVideo && (
              <button
                id="toggle-aspect-fit-btn"
                onClick={() => setVideoFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all hidden sm:flex items-center gap-1 text-xs"
                title={videoFitMode === 'cover' ? 'Fit video to screen (No cropping)' : 'Fill entire video card'}
              >
                <Scan className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">{videoFitMode === 'cover' ? 'Fill' : 'Fit'}</span>
              </button>
            )}

            {/* Layout switch button (Spotlight vs Grid) */}
            {activeCall.isVideo && isConnected && (
              <button
                id="toggle-layout-btn"
                onClick={() => setLayoutMode((prev) => (prev === 'spotlight' ? 'grid' : 'spotlight'))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
                title={layoutMode === 'spotlight' ? 'Switch to Side-by-Side Grid' : 'Switch to Spotlight View'}
              >
                {layoutMode === 'spotlight' ? <LayoutGrid className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-emerald-400" />}
                <span className="text-[10px] hidden md:inline">{layoutMode === 'spotlight' ? 'Grid' : 'Spotlight'}</span>
              </button>
            )}

            {/* Minimize to PiP */}
            <button
              id="minimize-call-window-btn"
              onClick={togglePipMode}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Minimize to Picture-in-Picture"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= MAIN VIDEO STAGE ================= */}
        <div
          ref={stageBoundsRef}
          className="relative flex-1 w-full bg-gradient-to-b from-[#060814] to-[#0d1326] p-2 sm:p-4 md:p-5 flex items-center justify-center overflow-hidden min-h-0"
        >
          {/* ================= LAYOUT 1: SPOTLIGHT MODE (Google Meet Standard) ================= */}
          {layoutMode === 'spotlight' && (
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center shadow-2xl">
              {/* PRIMARY MAIN STAGE (Remote Participant) */}
              {activeCall.isVideo && (remoteStream || isViewSwapped) && isConnected ? (
                <video
                  ref={mainStageVideoRef}
                  autoPlay
                  playsInline
                  muted={isViewSwapped}
                  className={`w-full h-full ${
                    videoFitMode === 'cover' ? 'object-cover' : 'object-contain bg-black'
                  } object-center transition-all`}
                  style={{
                    transform: isViewSwapped && isMirrored && !isScreenSharing ? 'scaleX(-1)' : 'none',
                  }}
                />
              ) : (
                // Rotating Calling Card Stage (Audio Connected & Outgoing Ringing)
                <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden">
                  {/* Full-bleed card background */}
                  <div
                    className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat transition-all duration-700"
                    style={{ backgroundImage: `url(${activeCard})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/90" />
                    <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/10 to-black/60" />
                  </div>

                  {/* Top Calling Status */}
                  <div className="relative z-10 pt-4 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 border border-white/20 backdrop-blur-md mb-4">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-semibold tracking-wider text-amber-200 uppercase">
                        {isConnected ? "Secure Connection Live" : "Calling..."}
                      </span>
                    </div>
                  </div>

                  {/* Center Caller Badge */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="absolute -inset-2 rounded-full border-2 border-amber-400/50 animate-ping pointer-events-none" />
                      <div className="relative rounded-full ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.4)] overflow-hidden">
                        <Avatar src={peerAvatar} name={peerName} size="2xl" />
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                      {peerName}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-300 mt-1 font-semibold flex items-center justify-center gap-1.5 drop-shadow">
                      {isConnected ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Voice Call Active &bull; {formatTimer(callDuration)}
                        </>
                      ) : (
                        <>
                          <PhoneCall className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                          Ringing...
                        </>
                      )}
                    </p>
                  </div>

                  {/* Spacer to preserve bottom controls clearance */}
                  <div className="relative z-10 h-12" />
                </div>
              )}

              {/* Main Stage Participant Badge (Bottom-Left) */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-medium text-white flex items-center gap-2 border border-white/10 shadow-lg z-20">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-semibold">{mainParticipantName}</span>
                {isMainMuted && <MicOff className="w-3.5 h-3.5 text-rose-400 ml-0.5" />}
              </div>

              {/* Quick Pin / Swap primary feed button */}
              {isConnected && activeCall.isVideo && (
                <button
                  onClick={() => setIsViewSwapped((prev) => !prev)}
                  title={isViewSwapped ? 'Switch back: Show remote user in main view' : 'Show yourself in main view'}
                  className="absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium border border-white/15 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg z-20"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">{isViewSwapped ? 'Reset View' : 'Swap View'}</span>
                </button>
              )}

              {/* ================= GOOGLE MEET FLOATING SELF-VIEW TILE ================= */}
              {activeCall.isVideo && (
                <AnimatePresence>
                  {!isSelfViewMinimized ? (
                    <motion.div
                      drag
                      dragConstraints={stageBoundsRef}
                      dragElastic={0.1}
                      dragMomentum={false}
                      id="floating-self-view-tile"
                      className={`absolute top-3 right-3 sm:top-4 sm:right-4 ${
                        selfViewSize === 'large'
                          ? 'w-44 h-60 sm:w-72 sm:h-48 md:w-80 md:h-52'
                          : 'w-32 h-44 sm:w-52 sm:h-36 md:w-56 md:h-40'
                      } rounded-2xl overflow-hidden border-2 border-emerald-400/50 bg-slate-950 shadow-[0_10px_35px_rgba(0,0,0,0.6)] group transition-all z-30 cursor-move`}
                    >
                      {/* Self Video */}
                      <video
                        ref={selfTileVideoRef}
                        autoPlay
                        playsInline
                        muted={!isViewSwapped}
                        className={`w-full h-full object-cover object-center ${
                          isVideoMuted && !isViewSwapped ? 'hidden' : 'block'
                        }`}
                        style={{
                          transform: !isViewSwapped && isMirrored && !isScreenSharing ? 'scaleX(-1)' : 'none',
                        }}
                      />

                      {/* Video Muted Placeholder */}
                      {isVideoMuted && !isViewSwapped && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs gap-1">
                          <VideoOff className="w-6 h-6 text-slate-500" />
                          <span className="text-[11px] font-medium">Camera Off</span>
                        </div>
                      )}

                      {/* Drag Handle Indicator */}
                      <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Move className="w-3 h-3" />
                      </div>

                      {/* Floating Self-View Controls Bar (Google Meet Style) */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-90 transition-opacity bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10 z-40">
                        {/* Minimize self-view */}
                        <button
                          onClick={() => setIsSelfViewMinimized(true)}
                          title="Minimize self view"
                          className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>

                        {/* Resize self-view (normal / large) */}
                        <button
                          onClick={() => setSelfViewSize((prev) => (prev === 'normal' ? 'large' : 'normal'))}
                          title={selfViewSize === 'normal' ? 'Expand self view' : 'Shrink self view'}
                          className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                          {selfViewSize === 'normal' ? <Maximize className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Camera Switcher */}
                        <button
                          onClick={handleCameraFlip}
                          title="Switch / Flip Camera"
                          className={`p-1 rounded-lg hover:bg-white/20 text-white transition-colors ${
                            isSwitchingCamera ? 'animate-spin text-blue-400' : ''
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Swap with main view */}
                        <button
                          onClick={() => setIsViewSwapped((prev) => !prev)}
                          title="Swap feed with primary stage"
                          className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Participant Label & Mic Status */}
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1.5 border border-white/10">
                        <span>{selfTileParticipantName}</span>
                        {!isViewSwapped && isAudioMuted && <MicOff className="w-3 h-3 text-rose-400" />}
                      </div>
                    </motion.div>
                  ) : (
                    // Minimized Floating Pill (Allows seeing 100% of the other person)
                    <motion.button
                      drag
                      dragConstraints={stageBoundsRef}
                      onClick={() => setIsSelfViewMinimized(false)}
                      id="expand-self-view-pill"
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-2 rounded-2xl bg-black/85 hover:bg-black border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-2 z-30 transition-all hover:scale-105"
                      title="Click to restore Self View camera"
                    >
                      <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Show Self View</span>
                      <Eye className="w-3.5 h-3.5 text-white/70" />
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* ================= LAYOUT 2: GRID / SIDE-BY-SIDE MODE (Google Meet 50/50) ================= */}
          {layoutMode === 'grid' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Tile 1: Remote Participant */}
              <div className="relative w-full h-full min-h-[180px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center shadow-xl">
                {remoteStream && isConnected ? (
                  <video
                    ref={gridRemoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Avatar src={peerAvatar} name={peerName} size="xl" />
                    <span className="text-xs text-slate-300 font-medium">{peerName}</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 border border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{peerName}</span>
                </div>
              </div>

              {/* Tile 2: Local Participant (You) */}
              <div className="relative w-full h-full min-h-[180px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black/80 border border-emerald-400/40 flex items-center justify-center shadow-xl">
                <video
                  ref={gridLocalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover object-center ${isVideoMuted ? 'hidden' : 'block'}`}
                  style={{ transform: isMirrored && !isScreenSharing ? 'scaleX(-1)' : 'none' }}
                />
                {isVideoMuted && (
                  <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                    <VideoOff className="w-8 h-8 text-slate-500" />
                    <span>Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 border border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>You</span>
                  {isAudioMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  <button
                    onClick={handleCameraFlip}
                    title="Switch / Flip Camera"
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSwitchingCamera ? 'animate-spin text-blue-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsMirrored((m) => !m)}
                    title={isMirrored ? 'Unmirror video' : 'Mirror video'}
                    className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors text-[10px] font-mono px-2"
                  >
                    {isMirrored ? 'Mirrored' : 'Normal'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM GOOGLE MEET CONTROL BAR ================= */}
        <div className="p-3 sm:p-4 md:py-4 flex items-center justify-center gap-2.5 sm:gap-4 bg-white/5 border-t border-white/10 backdrop-blur-2xl flex-wrap z-30">
          {/* Mute / Unmute Audio */}
          <button
            id="toggle-mic-btn"
            onClick={toggleAudio}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg ring-2 ring-rose-500/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera On / Off */}
          <button
            id="toggle-camera-btn"
            onClick={toggleVideo}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isVideoMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg ring-2 ring-rose-500/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
            title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Dedicated Camera Switcher Button (Flip / Cycle cameras) */}
          {activeCall.isVideo && (
            <button
              id="switch-camera-btn"
              onClick={handleCameraFlip}
              className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white flex items-center justify-center transition-all ${
                isSwitchingCamera ? 'ring-2 ring-blue-400' : ''
              }`}
              title={
                availableCameras.length > 1
                  ? `Switch camera (${availableCameras.length} devices available)`
                  : 'Flip front / back camera'
              }
            >
              <RefreshCw className={`w-5 h-5 ${isSwitchingCamera ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          {/* Speakerphone Output Toggle */}
          <button
            id="toggle-speaker-btn"
            onClick={toggleSpeaker}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isSpeakerOn
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-lg'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400'
            }`}
            title={isSpeakerOn ? 'Speakerphone On (Loudspeaker)' : 'Speakerphone Off (Earpiece)'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            id="toggle-screenshare-btn"
            onClick={toggleScreenShare}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border border-blue-400'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
            title="Share Screen"
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          {/* Invite Link / Share Modal */}
          <button
            id="invite-to-call-btn"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open_share_modal', {
                  detail: { type: 'call', roomId: activeCall.roomId },
                })
              );
            }}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-white flex items-center justify-center transition-all hidden sm:flex"
            title="Invite to Call"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Hang Up End Call Button */}
          <button
            id="hangup-call-btn"
            onClick={endCall}
            className="px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.45)] transition-all hover:scale-105 active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs sm:text-sm">End Call</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
