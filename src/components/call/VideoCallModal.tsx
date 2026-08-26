import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

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
    endCall,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Derive Peer Name and Avatar
  const isCaller = user?.id === activeCall?.callerId;
  const peerName = isCaller ? activeCall?.receiverName || 'User' : activeCall?.callerName || 'User';
  const peerAvatar = isCaller ? activeCall?.receiverAvatar : activeCall?.callerAvatar;

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isPipMode]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0.4;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.4;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, isPipMode, isSpeakerOn]);

  if (!activeCall) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const isConnected = activeCall.status === 'connected';

  // If minimized into Picture-in-Picture floating widget
  if (isPipMode) {
    return (
      <motion.div
        drag
        dragConstraints={{ left: 10, right: window.innerWidth - 300, top: 10, bottom: window.innerHeight - 200 }}
        id="pip-call-widget"
        className="fixed bottom-24 right-4 sm:right-6 z-50 w-72 rounded-[24px] overflow-hidden bg-[#05060f]/90 border border-white/20 shadow-2xl backdrop-blur-2xl text-white cursor-move"
      >
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          {remoteStream && isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar src={peerAvatar} name={peerName} size="md" />
              <span className="text-xs text-slate-300 font-medium animate-pulse">
                {isConnected ? 'Connecting media...' : 'Calling...'}
              </span>
            </div>
          )}

          {/* Local inset preview */}
          <div className="absolute bottom-2 right-2 w-20 aspect-video rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow-md">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
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

  // Full Screen WebRTC Glassmorphism Call Modal
  return (
    <div
      id="video-call-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/85 backdrop-blur-2xl animate-fade-in"
    >
      {/* Hidden audio element to ensure phone speaker output */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        id="call-container"
        className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] rounded-[32px] overflow-hidden bg-[#05060f]/90 border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col"
      >
        {/* Top bar header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar src={peerAvatar} name={peerName} size="md" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span className="truncate max-w-[150px] sm:max-w-xs">{peerName}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> WebRTC E2EE
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-2">
                <span className="flex items-center gap-1 text-blue-400">
                  <Radio className="w-3 h-3 animate-pulse text-blue-400" />
                  {isConnected ? 'Connected' : 'Calling...'}
                </span>
                • <span>{activeCall.isVideo ? 'HD Video' : 'Spatial Audio'}</span>
                • <span className="text-slate-300">{isSpeakerOn ? '🔊 Speakerphone' : '🔈 Earpiece'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-medium text-slate-200">
              {isConnected ? formatTimer(callDuration) : 'Ringing...'}
            </div>

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

        {/* Video stream viewport */}
        <div className="relative flex-1 bg-gradient-to-b from-[#05060f] to-[#0a0f1d] p-2 sm:p-4 flex items-center justify-center overflow-hidden min-h-0">
          {/* Main remote video view */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
            {activeCall.isVideo && remoteStream && isConnected ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="relative">
                  <Avatar src={peerAvatar} name={peerName} size="2xl" />
                  {!isConnected && (
                    <span className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">{peerName}</h4>
                  <p className="text-xs sm:text-sm text-blue-400 mt-1 font-medium">
                    {isConnected
                      ? activeCall.isVideo
                        ? 'Video stream connected'
                        : 'Audio Call in Progress'
                      : 'Calling... Waiting for answer'}
                  </p>
                </div>
              </div>
            )}

            {/* Remote user name badge */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-medium text-white flex items-center gap-2 border border-white/10 shadow-lg">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{peerName}</span>
            </div>

            {/* Inset Local Camera Stream */}
            <div
              id="local-video-pip"
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-32 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-white/25 bg-slate-900 shadow-2xl group transition-transform hover:scale-105 z-10"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : 'block'}`}
                style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
              />

              {isVideoMuted && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-[10px] sm:text-xs">
                  <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
                  <span>Camera Off</span>
                </div>
              )}

              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] text-white">
                You {isScreenSharing ? '(Screen)' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="p-3 sm:p-4 md:py-5 flex items-center justify-center gap-2.5 sm:gap-4 bg-white/5 border-t border-white/10 backdrop-blur-xl flex-wrap">
          {/* Mute Audio */}
          <button
            id="toggle-mic-btn"
            onClick={toggleAudio}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            id="toggle-camera-btn"
            onClick={toggleVideo}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
              isVideoMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
            title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoMuted ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Speakerphone Toggle (Messenger-like speaker audio output) */}
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
            {isSpeakerOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Screen Share */}
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
            <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Invite Others to Call */}
          <button
            id="invite-to-call-btn"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open_share_modal', {
                  detail: { type: 'call', roomId: activeCall.roomId },
                })
              );
            }}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-white flex items-center justify-center transition-all"
            title="Invite to Call"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* End Call Button */}
          <button
            id="hangup-call-btn"
            onClick={endCall}
            className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs sm:text-sm">End Call</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
