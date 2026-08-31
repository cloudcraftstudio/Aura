import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  isSpeakerOn: boolean;
  callDuration: number;
  isPipMode: boolean;
  startCall: (targetUser: UserProfile, isVideo?: boolean) => Promise<void>;
  answerCall: (withVideo?: boolean) => Promise<void>;
  simulateCompanionAnswer: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleSpeaker: () => void;
  togglePipMode: () => void;
  switchCamera: (deviceId?: string) => Promise<void>;
  getVideoDevices: () => Promise<MediaDeviceInfo[]>;
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
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isPipMode, setIsPipMode] = useState<boolean>(false);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const durationTimerRef = useRef<any>(null);
  const callPollIntervalRef = useRef<any>(null);
  const activeCallPollRef = useRef<any>(null);
  const callTimeoutRef = useRef<any>(null);
  const lastNotifiedCallRoomIdRef = useRef<string | null>(null);

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
        console.warn('WebRTC manager error:', err);
      },
    });

    webrtcRef.current = rtc;

    return () => {
      rtc.endCall(false);
    };
  }, []);

  // Update user in WebRTC manager
  useEffect(() => {
    if (user && webrtcRef.current) {
      webrtcRef.current.setUserId(user.id);
    }
  }, [user]);

  // Refs for stale closure prevention
  const activeCallRef = useRef<CallSession | null>(null);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  // Periodic polling for incoming calls on server (every 1.5 seconds)
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    
    const checkIncomingCalls = async () => {
      if (activeCallRef.current) return; // Already on a call
      try {
        const res = await fetch(`/api/calls/pending?userId=${encodeURIComponent(user.id)}`);
        if (!isMounted) return;
        
        if (res.ok) {
          const pendingCalls: CallSession[] = await res.json();
          if (pendingCalls.length > 0) {
            const first = pendingCalls[0];
            if (!incomingCall || incomingCall.roomId !== first.roomId) {
              if (activeCallRef.current) return; // double check before ringing
              
              setIncomingCall(first);
              soundEffects.startRingtone();
              // Only trigger a single notification per incoming call session, not every poll
              if (lastNotifiedCallRoomIdRef.current !== first.roomId) {
                lastNotifiedCallRoomIdRef.current = first.roomId;
                notificationService.notify({
                  type: 'call',
                  title: `Incoming ${first.isVideo ? 'Video' : 'Audio'} Call`,
                  body: `${first.callerName} is calling you...`,
                  avatar: first.callerAvatar,
                  playSound: false,
                });
              }
            }
          } else if (incomingCall) {
            // Pending call was cancelled or answered elsewhere
            setIncomingCall(null);
            soundEffects.stopRingtone();
            lastNotifiedCallRoomIdRef.current = null;
          }
        }
      } catch (err) {
        // Network catch
      }
    };

    checkIncomingCalls();
    callPollIntervalRef.current = setInterval(checkIncomingCalls, 1500);

    return () => {
      isMounted = false;
      if (callPollIntervalRef.current) {
        clearInterval(callPollIntervalRef.current);
      }
    };
  }, [user, incomingCall]);

  // Poll active call status from server so caller immediately transitions when receiver answers
  useEffect(() => {
    if (!activeCall) {
      if (activeCallPollRef.current) {
        clearInterval(activeCallPollRef.current);
        activeCallPollRef.current = null;
      }
      return;
    }

    activeCallPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls/${activeCall.roomId}`);
        if (res.ok) {
          const serverSession: CallSession = await res.json();
          if (serverSession.status === 'connected' && activeCall.status === 'calling') {
            if (callTimeoutRef.current) {
              clearTimeout(callTimeoutRef.current);
              callTimeoutRef.current = null;
            }
            soundEffects.stopRingtone();
            soundEffects.playCallConnected();
            setActiveCall(serverSession);
            startDurationTimer();
          } else if (serverSession.status === 'ended' || serverSession.status === 'declined') {
            soundEffects.stopRingtone();
            soundEffects.playCallEnded();
            handleCallTermination();
          }
        }
      } catch (err) {}
    }, 1000);

    return () => {
      if (activeCallPollRef.current) {
        clearInterval(activeCallPollRef.current);
      }
    };
  }, [activeCall]);

  // Listen to same-device broadcast events (multi-tab sync)
  useEffect(() => {
    const unsub = offlineStorage.onBroadcastEvent(({ type, payload }) => {
      if (type === 'call_request') {
        const session: CallSession = payload;
        if (user && session.receiverId === user.id && (!activeCall || activeCall.status === 'idle')) {
          setIncomingCall(session);
          soundEffects.startRingtone();
        }
      } else if (type === 'call_accepted') {
        const session: CallSession = payload;
        if (activeCall && activeCall.roomId === session.roomId && activeCall.callerId === user?.id) {
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
          }
          soundEffects.stopRingtone();
          soundEffects.playCallConnected();
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startedAt: Date.now() } : null));
          startDurationTimer();
        }
      } else if (type === 'call_rejected' || type === 'call_ended') {
        const { roomId } = payload;
        if ((activeCall && activeCall.roomId === roomId) || (incomingCall && incomingCall.roomId === roomId)) {
          soundEffects.stopRingtone();
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
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
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
    
    if (webrtcRef.current) {
      try {
        webrtcRef.current.endCall(false); // don't broadcast, just cleanup local WebRTC to kill ghost audio
      } catch (e) {}
    }
  };

  // Start Call to Target User
  const startCall = async (targetUser: UserProfile, isVideo: boolean = true) => {
    if (!user) return;

    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

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

    // Post to server backend
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
    } catch (err) {
      console.warn('Failed to register call on server:', err);
    }

    // Broadcast across tabs
    offlineStorage.broadcastEvent('call_request', session);

    // Acquire local hardware stream & initiate WebRTC connection
    if (webrtcRef.current) {
      webrtcRef.current.setUserId(user.id);
      await webrtcRef.current.getLocalMedia(isVideo, true);
      await webrtcRef.current.createPeerConnection(roomId, user.id, true);
    }

    // Realistic Ringing Timeout (45 seconds):
    // Never force auto-connect! If no one answers after 45s, ring times out cleanly.
    callTimeoutRef.current = setTimeout(() => {
      setActiveCall((current) => {
        if (current && current.roomId === roomId && current.status === 'calling') {
          soundEffects.stopRingtone();
          soundEffects.playCallEnded();
          fetch(`/api/calls/${roomId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ended' }),
          }).catch(() => {});
          handleCallTermination();
        }
        return current;
      });
    }, 45000);
  };

  // Simulate companion answering on-demand if the user wants to test peer connection
  const simulateCompanionAnswer = () => {
    if (!activeCall || activeCall.status !== 'calling') return;
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    const roomId = activeCall.roomId;
    soundEffects.stopRingtone();
    soundEffects.playCallConnected();
    startDurationTimer();

    // Update status on server
    fetch(`/api/calls/${roomId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'connected' }),
    }).catch(() => {});

    // Generate active remote peer stream (video & audio)
    if (webrtcRef.current) {
      const peerStream = webrtcRef.current.generatePeerStream(activeCall.receiverName, activeCall.receiverAvatar, activeCall.isVideo);
      setRemoteStream(peerStream);
    }

    setActiveCall((current) => (current ? { ...current, status: 'connected', startedAt: Date.now() } : null));
  };

  // Answer Incoming Call
  const answerCall = async (withVideo: boolean = true) => {
    if (!incomingCall || !user) return;
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
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

    // Update status on server
    try {
      await fetch(`/api/calls/${session.roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'connected' }),
      });
    } catch (err) {
      console.warn('Failed to update call status on server:', err);
    }

    // Broadcast accepted event
    offlineStorage.broadcastEvent('call_accepted', session);

    // Connect WebRTC peer
    if (webrtcRef.current) {
      webrtcRef.current.setUserId(user.id);
      await webrtcRef.current.getLocalMedia(withVideo, true);
      await webrtcRef.current.createPeerConnection(session.roomId, user.id, false);
    }
  };

  // Decline Incoming Call
  const declineCall = () => {
    if (!incomingCall) return;
    soundEffects.stopRingtone();
    soundEffects.playCallEnded();

    const roomId = incomingCall.roomId;
    setIncomingCall(null);

    // Update status on server
    fetch(`/api/calls/${roomId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'declined' }),
    }).catch(() => {});

    offlineStorage.broadcastEvent('call_rejected', { roomId });
  };

  // End Call
  const endCall = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    soundEffects.stopRingtone();
    soundEffects.playCallEnded();

    if (activeCall) {
      fetch(`/api/calls/${activeCall.roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      }).catch(() => {});

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

  const toggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    if (webrtcRef.current) {
      webrtcRef.current.setSpeakerphone(next);
    }
  };

  const togglePipMode = () => {
    setIsPipMode((prev) => !prev);
  };

  const switchCamera = useCallback(async (deviceId?: string) => {
    if (webrtcRef.current) {
      const updatedStream = await webrtcRef.current.switchCamera(deviceId);
      if (updatedStream) {
        setLocalStream(new MediaStream(updatedStream.getTracks()));
      }
    }
  }, []);

  const getVideoDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (webrtcRef.current) {
      return await webrtcRef.current.getVideoDevices();
    }
    return [];
  }, []);

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
        isSpeakerOn,
        callDuration,
        isPipMode,
        startCall,
        answerCall,
        simulateCompanionAnswer,
        declineCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        toggleSpeaker,
        togglePipMode,
        switchCamera,
        getVideoDevices,
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
