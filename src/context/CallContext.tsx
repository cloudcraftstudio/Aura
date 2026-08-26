import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CallSession, UserProfile } from '../types';
import { WebRTCManager } from '../services/webrtc';
import { soundEffects } from '../services/audio';
import { offlineStorage } from '../services/offlineStorage';
import { notificationService } from '../services/notifications';
import { useAuth } from './AuthContext';

interface CallContextType {
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  isPipMode: boolean;
  startCall: (targetUser: UserProfile, isVideo?: boolean) => Promise<void>;
  answerCall: (withVideo?: boolean) => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  togglePipMode: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isPipMode, setIsPipMode] = useState<boolean>(false);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const durationTimerRef = useRef<any>(null);

  // Initialize WebRTC instance
  useEffect(() => {
    const rtc = new WebRTCManager({
      onLocalStream: (stream) => {
        setLocalStream(stream);
      },
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
      },
      onCallEnded: () => {
        handleCallTermination();
      },
      onError: (err) => {
        console.warn('WebRTC error:', err);
      },
    });

    webrtcRef.current = rtc;

    return () => {
      rtc.endCall(false);
    };
  }, []);

  // Listen to call events across tabs / signaling
  useEffect(() => {
    const unsub = offlineStorage.onBroadcastEvent(({ type, payload }) => {
      if (type === 'call_request') {
        const session: CallSession = payload;
        if (user && session.receiverId === user.id && (!activeCall || activeCall.status === 'idle')) {
          setIncomingCall(session);
          soundEffects.startRingtone();
          notificationService.notify({
            type: 'call',
            title: `Incoming ${session.isVideo ? 'Video' : 'Audio'} Call`,
            body: `${session.callerName} is calling you...`,
            avatar: session.callerAvatar,
            playSound: false,
          });
        }
      } else if (type === 'call_accepted') {
        const session: CallSession = payload;
        if (activeCall && activeCall.roomId === session.roomId && activeCall.callerId === user?.id) {
          soundEffects.playCallConnected();
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startedAt: Date.now() } : null));
          startDurationTimer();
        }
      } else if (type === 'call_rejected' || type === 'call_ended') {
        const { roomId } = payload;
        if ((activeCall && activeCall.roomId === roomId) || (incomingCall && incomingCall.roomId === roomId)) {
          soundEffects.playCallEnded();
          handleCallTermination();
        }
      }
    });

    return () => unsub();
  }, [activeCall, incomingCall, user]);

  const startDurationTimer = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const handleCallTermination = () => {
    stopDurationTimer();
    soundEffects.stopRingtone();
    setActiveCall(null);
    setIncomingCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsPipMode(false);
    setIsScreenSharing(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  };

  const startCall = async (targetUser: UserProfile, isVideo: boolean = true) => {
    if (!user) return;

    const roomId = 'room_' + [user.id, targetUser.id].sort().join('_') + '_' + Date.now();
    const session: CallSession = {
      id: 'call_' + Date.now(),
      callerId: user.id,
      callerName: user.name,
      callerAvatar: user.avatarUrl,
      receiverId: targetUser.id,
      receiverName: targetUser.name,
      receiverAvatar: targetUser.avatarUrl,
      isVideo,
      status: 'calling',
      roomId,
    };

    setActiveCall(session);
    soundEffects.startRingtone();

    // Acquire local hardware stream
    if (webrtcRef.current) {
      await webrtcRef.current.getLocalMedia(isVideo, true);
      await webrtcRef.current.createPeerConnection(roomId, true);
    }

    // Broadcast call offer
    offlineStorage.broadcastEvent('call_request', session);

    // Auto-connect after brief ring if demo self-simulation or no second tab responding
    setTimeout(() => {
      setActiveCall((current) => {
        if (current && current.status === 'calling') {
          soundEffects.playCallConnected();
          startDurationTimer();
          return { ...current, status: 'connected', startedAt: Date.now() };
        }
        return current;
      });
    }, 3500);
  };

  const answerCall = async (withVideo: boolean = true) => {
    if (!incomingCall || !user) return;
    soundEffects.stopRingtone();
    soundEffects.playCallConnected();

    const session: CallSession = {
      ...incomingCall,
      status: 'connected',
      startedAt: Date.now(),
    };

    setActiveCall(session);
    setIncomingCall(null);
    startDurationTimer();

    if (webrtcRef.current) {
      await webrtcRef.current.getLocalMedia(withVideo, true);
      await webrtcRef.current.createPeerConnection(session.roomId, false);
    }

    offlineStorage.broadcastEvent('call_accepted', session);
  };

  const declineCall = () => {
    if (!incomingCall) return;
    soundEffects.stopRingtone();
    soundEffects.playCallEnded();

    offlineStorage.broadcastEvent('call_rejected', { roomId: incomingCall.roomId });
    setIncomingCall(null);
  };

  const endCall = () => {
    soundEffects.stopRingtone();
    soundEffects.playCallEnded();

    if (activeCall) {
      offlineStorage.broadcastEvent('call_ended', { roomId: activeCall.roomId });
    }

    if (webrtcRef.current) {
      webrtcRef.current.endCall(true);
    }

    handleCallTermination();
  };

  const toggleAudio = () => {
    if (webrtcRef.current) {
      const isMuted = !webrtcRef.current.toggleAudio();
      setIsAudioMuted(isMuted);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const isMuted = !webrtcRef.current.toggleVideo();
      setIsVideoMuted(isMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (webrtcRef.current) {
      const sharing = await webrtcRef.current.toggleScreenShare();
      setIsScreenSharing(sharing);
    }
  };

  const togglePipMode = () => {
    setIsPipMode((prev) => !prev);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        localStream,
        remoteStream,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        callDuration,
        isPipMode,
        startCall,
        answerCall,
        declineCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        togglePipMode,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};
