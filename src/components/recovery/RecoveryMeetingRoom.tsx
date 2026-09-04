import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  Hand,
  Shield,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Heart,
  BookOpen,
  Info,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';
import { RecoveryMeeting, MeetingParticipant, MeetingChatMessage, WebRTCSignalPayload } from '../../types/recovery';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';

interface RecoveryMeetingRoomProps {
  meeting: RecoveryMeeting;
  onLeave: () => void;
  onMeetingStatusChange?: (status: 'scheduled' | 'live' | 'completed') => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const RecoveryMeetingRoom: React.FC<RecoveryMeetingRoomProps> = ({
  meeting,
  onLeave,
  onMeetingStatusChange
}) => {
  const { user } = useAuth();

  // Local media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants & Signaling state
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageType, setMessageType] = useState<'chat' | 'prayer_request' | 'scripture' | 'amen'>('chat');

  // Host panel state
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [hostAnnouncement, setHostAnnouncement] = useState('');

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const lastSignalTimestamp = useRef<number>(0);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Identity resolution
  const currentUserId = user?.id || 'guest_' + Math.random().toString(36).substring(2, 8);
  const isHost =
    user?.id === meeting.hostId ||
    user?.handle?.toLowerCase() === 'tex' ||
    user?.email?.toLowerCase().includes('lightsouttattootex') ||
    user?.email?.toLowerCase().includes('tex@aura.social');

  const displayName = isAnonymous
    ? 'Anonymous Overcomer'
    : (user?.name || 'Fellow Believer');

  const displayAvatar = isAnonymous
    ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Anonymous'
    : (user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + currentUserId);

  // 1. Initialize Local Media Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: !isAudioOnly,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Could not access full media (camera/mic):', err);
        // Fallback to audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setLocalStream(stream);
          setIsVideoOff(true);
          setIsAudioOnly(true);
        } catch (audioErr) {
          console.warn('Could not access microphone either:', audioErr);
        }
      }
    }

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isAudioOnly]);

  // 2. Join Meeting & Sync Participants
  useEffect(() => {
    // Join endpoint
    const myParticipant: MeetingParticipant = {
      userId: currentUserId,
      userName: displayName,
      avatarUrl: displayAvatar,
      isAudioOnly,
      isMuted,
      isVideoOff,
      isHandRaised,
      role: isHost ? 'host' : 'member',
      joinedAt: Date.now(),
      isAnonymous
    };

    fetch(`/api/recovery/meetings/${meeting.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant: myParticipant })
    })
      .then(res => res.json())
      .then(data => {
        if (data.participants) {
          setParticipants(data.participants);
        }
      })
      .catch(console.error);

    // Periodic polling for participants & chat & signals
    const syncInterval = setInterval(() => {
      // 1. Participants sync
      fetch(`/api/recovery/meetings/${meeting.id}/participants`)
        .then(res => res.json())
        .then(data => {
          if (data.participants) {
            setParticipants(data.participants);
          }
        })
        .catch(console.error);

      // 2. Chat sync
      fetch(`/api/recovery/meetings/${meeting.id}/chat`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setChatMessages(data.messages);
          }
        })
        .catch(console.error);

      // 3. WebRTC Signals sync
      fetch(`/api/recovery/meetings/${meeting.id}/signals?forUserId=${encodeURIComponent(currentUserId)}&since=${lastSignalTimestamp.current}`)
        .then(res => res.json())
        .then(data => {
          if (data.signals && data.signals.length > 0) {
            handleIncomingSignals(data.signals);
            const latest = Math.max(...data.signals.map((s: WebRTCSignalPayload) => s.timestamp));
            lastSignalTimestamp.current = latest;
          }
        })
        .catch(console.error);
    }, 2000);

    return () => {
      clearInterval(syncInterval);
      // Leave meeting on unmount
      fetch(`/api/recovery/meetings/${meeting.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      }).catch(console.error);

      // Close all peer connections
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [meeting.id, currentUserId, displayName, displayAvatar, isHost, isAnonymous]);

  // Handle Incoming WebRTC Signals
  const handleIncomingSignals = async (signals: WebRTCSignalPayload[]) => {
    for (const sig of signals) {
      if (sig.type === 'host_command') {
        if (sig.payload.command === 'mute_all' && !isHost) {
          muteLocalAudio();
        } else if (sig.payload.command === 'mute') {
          muteLocalAudio();
        } else if (sig.payload.command === 'kick') {
          alert('You have been excused from the meeting by the host.');
          onLeave();
        }
      } else if (sig.type === 'offer') {
        await handleReceiveOffer(sig.fromUserId, sig.payload);
      } else if (sig.type === 'answer') {
        await handleReceiveAnswer(sig.fromUserId, sig.payload);
      } else if (sig.type === 'candidate') {
        await handleReceiveCandidate(sig.fromUserId, sig.payload);
      }
    }
  };

  const getOrCreatePeerConnection = (peerId: string): RTCPeerConnection => {
    if (peerConnections.current[peerId]) {
      return peerConnections.current[peerId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream!));
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
      }
    };

    // Send ICE candidates to peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(peerId, 'candidate', event.candidate);
      }
    };

    peerConnections.current[peerId] = pc;
    return pc;
  };

  const sendSignal = (toUserId: string, type: 'offer' | 'answer' | 'candidate', payload: any) => {
    fetch(`/api/recovery/meetings/${meeting.id}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signal: {
          fromUserId: currentUserId,
          toUserId,
          type,
          payload,
          timestamp: Date.now()
        }
      })
    }).catch(console.error);
  };

  const handleReceiveOffer = async (fromPeerId: string, offer: RTCSessionDescriptionInit) => {
    const pc = getOrCreatePeerConnection(fromPeerId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal(fromPeerId, 'answer', answer);
  };

  const handleReceiveAnswer = async (fromPeerId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current[fromPeerId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleReceiveCandidate = async (fromPeerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current[fromPeerId];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Error adding ICE candidate:', e);
      }
    }
  };

  // Toggle Mic
  const toggleMute = () => {
    soundEffects.playTap();
    if (localStream) {
      localStream.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      const newState = !isMuted;
      setIsMuted(newState);
      updateParticipantState({ isMuted: newState });
    }
  };

  const muteLocalAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = false));
      setIsMuted(true);
      updateParticipantState({ isMuted: true });
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    soundEffects.playTap();
    if (localStream) {
      localStream.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      const newState = !isVideoOff;
      setIsVideoOff(newState);
      updateParticipantState({ isVideoOff: newState });
    }
  };

  // Toggle Hand Raised
  const toggleHandRaise = () => {
    soundEffects.playTap();
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    updateParticipantState({ isHandRaised: newState });
    if (newState) {
      // Send chat note
      sendChatMessage(`${displayName} raised a hand to share.`, 'amen');
    }
  };

  // Toggle Anonymous Mode
  const toggleAnonymousMode = () => {
    soundEffects.playTap();
    const nextVal = !isAnonymous;
    setIsAnonymous(nextVal);
    updateParticipantState({
      isAnonymous: nextVal,
      userName: nextVal ? 'Anonymous Overcomer' : (user?.name || 'Fellow Believer')
    });
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    soundEffects.playTap();
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      const camTrack = localStream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && camTrack) {
          sender.replaceTrack(camTrack);
        }
      });
    }
    setIsScreenSharing(false);
  };

  const updateParticipantState = (updates: Partial<MeetingParticipant>) => {
    fetch(`/api/recovery/meetings/${meeting.id}/participant-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, updates })
    }).catch(console.error);
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendChatMessage(messageInput.trim(), messageType);
    setMessageInput('');
  };

  const sendChatMessage = (content: string, type: 'chat' | 'prayer_request' | 'scripture' | 'amen') => {
    soundEffects.playTap();
    fetch(`/api/recovery/meetings/${meeting.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUserId,
        senderName: displayName,
        senderAvatar: displayAvatar,
        type,
        content
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setChatMessages(prev => [...prev, data.message]);
          setTimeout(() => {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      })
      .catch(console.error);
  };

  // Pray with someone
  const handlePrayWithPerson = (messageId: string) => {
    soundEffects.playSuccess();
    fetch(`/api/recovery/meetings/${meeting.id}/chat/${messageId}/pray`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setChatMessages(prev =>
            prev.map(m => (m.id === data.message.id ? data.message : m))
          );
        }
      })
      .catch(console.error);
  };

  // Host Action: Mute All
  const handleHostMuteAll = () => {
    soundEffects.playTap();
    fetch(`/api/recovery/meetings/${meeting.id}/host-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'mute_all' })
    }).catch(console.error);
  };

  // Host Action: Broadcast
  const handleHostBroadcast = () => {
    if (!hostAnnouncement.trim()) return;
    soundEffects.playTap();
    fetch(`/api/recovery/meetings/${meeting.id}/host-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'broadcast_notice',
        noticeText: hostAnnouncement.trim()
      })
    })
      .then(() => setHostAnnouncement(''))
      .catch(console.error);
  };

  // Host Action: End Meeting
  const handleHostEndMeeting = () => {
    if (confirm('Are you sure you want to end this live recovery meeting for everyone?')) {
      soundEffects.playTap();
      fetch(`/api/recovery/meetings/${meeting.id}/host-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'set_status', status: 'completed' })
      })
        .then(() => {
          onMeetingStatusChange?.('completed');
          onLeave();
        })
        .catch(console.error);
    }
  };

  // Other participants (excluding local user)
  const otherParticipants = participants.filter(p => p.userId !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 bg-[#030612] text-white flex flex-col overflow-hidden">
      {/* Top Meeting Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#070b1e]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {meeting.title}
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-2">
              <span>📖 {meeting.scriptureFocus}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300">Topic: {meeting.topic}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Fellowship Guidelines Modal Trigger */}
          <button
            onClick={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Meeting Guidelines & Anonymity"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Guidelines</span>
          </button>

          {/* Host Controls Toggle */}
          {isHost && (
            <button
              onClick={() => setIsHostPanelOpen(!isHostPanelOpen)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isHostPanelOpen
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-purple-300'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Host Controls</span>
            </button>
          )}

          {/* Toggle Chat Drawer */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all relative ${
              isChatOpen
                ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Prayer Chat</span>
            {chatMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-400 absolute top-1 right-1" />
            )}
          </button>

          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Video & Chat Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Video Tiles Grid */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto flex flex-col justify-center">
          <div
            className={`grid gap-3 sm:gap-4 w-full h-full max-h-[85vh] items-center ${
              participants.length <= 1
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : participants.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                : participants.length <= 4
                ? 'grid-cols-2 max-w-5xl mx-auto'
                : 'grid-cols-2 sm:grid-cols-3 max-w-6xl mx-auto'
            }`}
          >
            {/* Local Video Tile */}
            <div className="relative aspect-video rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center group">
              {!isVideoOff && !isAudioOnly ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-3">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-blue-400/50 shadow-lg object-cover"
                    />
                    {!isMuted && (
                      <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-white mb-0.5">{displayName}</span>
                  <span className="text-[11px] text-blue-300">
                    {isAudioOnly ? 'Audio Only Mode' : 'Camera Off'}
                  </span>
                </div>
              )}

              {/* Tile Badges: Name, Role, Mute Status */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                  <span>{displayName} (You)</span>
                  {isHost && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 text-purple-300 text-[10px] font-bold">
                      Host
                    </span>
                  )}
                  {isAnonymous && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-500/30 text-slate-300 text-[10px]">
                      Anon
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isHandRaised && (
                    <span className="px-2 py-1 rounded-xl bg-amber-500/80 text-black text-xs font-bold animate-bounce flex items-center gap-1 shadow-md">
                      <span>✋</span> Hand Raised
                    </span>
                  )}
                  <div className={`p-1.5 rounded-xl backdrop-blur-md ${isMuted ? 'bg-red-500/30 text-red-300' : 'bg-black/60 text-emerald-400'}`}>
                    {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Remote Participants Tiles */}
            {otherParticipants.map(participant => {
              const stream = remoteStreams[participant.userId];
              return (
                <div
                  key={participant.userId}
                  className="relative aspect-video rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center group"
                >
                  {stream && !participant.isVideoOff && !participant.isAudioOnly ? (
                    <video
                      autoPlay
                      playsInline
                      ref={el => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative mb-3">
                        <img
                          src={participant.avatarUrl}
                          alt={participant.userName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-slate-600 shadow-lg object-cover"
                        />
                        {!participant.isMuted && (
                          <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/40 animate-pulse pointer-events-none" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-white mb-0.5">{participant.userName}</span>
                      <span className="text-[11px] text-slate-400">Fellow Overcomer</span>
                    </div>
                  )}

                  {/* Remote Tile Badges */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                      <span>{participant.userName}</span>
                      {participant.role === 'host' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 text-purple-300 text-[10px] font-bold">
                          Host
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {participant.isHandRaised && (
                        <span className="px-2 py-1 rounded-xl bg-amber-500/80 text-black text-xs font-bold animate-bounce flex items-center gap-1">
                          <span>✋</span>
                        </span>
                      )}
                      <div className={`p-1.5 rounded-xl backdrop-blur-md ${participant.isMuted ? 'bg-red-500/30 text-red-300' : 'bg-black/60 text-emerald-400'}`}>
                        {participant.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Drawer: Synchronized Real-Time Prayer & Fellowship Chat */}
        {isChatOpen && (
          <aside className="w-full sm:w-80 md:w-96 bg-[#070a1c] border-l border-white/10 flex flex-col shrink-0 h-full">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Live Fellowship & Prayer
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {chatMessages.length} messages
              </span>
            </div>

            {/* Chat message filters */}
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setMessageType('chat')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  messageType === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMessageType('prayer_request')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  messageType === 'prayer_request'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                🙏 Prayer
              </button>
              <button
                onClick={() => setMessageType('scripture')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  messageType === 'scripture'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                ✝️ Scripture
              </button>
              <button
                onClick={() => setMessageType('amen')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  messageType === 'amen'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                ❤️ Amen
              </button>
            </div>

            {/* Messages Scroll List */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Heart className="w-8 h-8 text-blue-400/40 mb-2 animate-pulse" />
                  <p className="font-semibold text-slate-300">Welcome to Fellowship</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Feel free to share prayer requests, scriptures, or an encouraging Amen.
                  </p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      msg.type === 'prayer_request'
                        ? 'bg-amber-950/30 border-amber-500/30'
                        : msg.type === 'scripture'
                        ? 'bg-indigo-950/30 border-indigo-500/30'
                        : msg.type === 'system'
                        ? 'bg-blue-950/40 border-blue-500/20 text-center'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-200">{msg.senderName}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {msg.type === 'prayer_request' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                            Prayer Need
                          </span>
                        )}
                        {msg.type === 'scripture' && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                            Scripture
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className={`text-slate-200 leading-relaxed ${msg.type === 'scripture' ? 'italic font-serif text-blue-200' : ''}`}>
                      {msg.content}
                    </p>

                    {/* Prayer Reaction / Pledge Button */}
                    {msg.type === 'prayer_request' && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between">
                        <button
                          onClick={() => handlePrayWithPerson(msg.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Praying with you</span>
                        </button>
                        <span className="text-[11px] font-semibold text-amber-400">
                          {msg.prayingCount || 0} praying
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder={
                    messageType === 'prayer_request'
                      ? 'Type a prayer request...'
                      : messageType === 'scripture'
                      ? 'Share a verse...'
                      : 'Share fellowship encouragement...'
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* Bottom Control Toolbar */}
      <footer className="h-20 px-4 sm:px-8 bg-[#050817] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Audio & Video toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isMuted
                ? 'bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleVideo}
            disabled={isAudioOnly}
            className={`p-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isVideoOff || isAudioOnly
                ? 'bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}
            title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoOff || isAudioOnly ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-blue-400" />}
            <span className="hidden sm:inline">{isVideoOff ? 'Camera Off' : 'Camera'}</span>
          </button>
        </div>

        {/* Center: Fellowship Actions (Hand Raise, Audio-Only, Anonymity) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Raise Hand Button */}
          <button
            onClick={toggleHandRaise}
            className={`px-3.5 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isHandRaised
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>

          {/* Audio Only Mode (Privacy) */}
          <button
            onClick={() => {
              soundEffects.playTap();
              setIsAudioOnly(!isAudioOnly);
              updateParticipantState({ isAudioOnly: !isAudioOnly });
            }}
            className={`px-3.5 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isAudioOnly
                ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
            title="Audio-only mode (conserves data & hides camera)"
          >
            <Volume2 className="w-4 h-4 text-indigo-300" />
            <span className="hidden md:inline">{isAudioOnly ? 'Audio Only Active' : 'Audio Only'}</span>
          </button>

          {/* Anonymous Display Name Toggle */}
          <button
            onClick={toggleAnonymousMode}
            className={`px-3.5 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isAnonymous
                ? 'bg-slate-700 text-slate-100 border border-slate-500'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
            }`}
            title="Toggle anonymous display name"
          >
            <Shield className="w-4 h-4 text-slate-300" />
            <span className="hidden lg:inline">{isAnonymous ? 'Anonymous Mode' : 'Go Anonymous'}</span>
          </button>

          {/* Screen Sharing */}
          <button
            onClick={toggleScreenShare}
            className={`px-3.5 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-md ${
              isScreenSharing
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
            title="Share screen for scriptures or presentations"
          >
            <Share2 className="w-4 h-4 text-emerald-300" />
            <span className="hidden lg:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>
        </div>

        {/* Right: End/Leave Call */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLeave}
            className="px-4 sm:px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden xs:inline">Leave Room</span>
          </button>
        </div>
      </footer>

      {/* Host Controls Modal / Panel */}
      {isHostPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#090e24] border border-purple-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white">Host Management Panel</h3>
              </div>
              <button
                onClick={() => setIsHostPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Quick Actions */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Audio & Room Controls
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleHostMuteAll}
                    className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MicOff className="w-4 h-4 text-purple-400" />
                    <span>Mute All Participants</span>
                  </button>

                  <button
                    onClick={handleHostEndMeeting}
                    className="p-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <PhoneOff className="w-4 h-4 text-red-400" />
                    <span>End Meeting for All</span>
                  </button>
                </div>
              </div>

              {/* Broadcast Announcement */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Broadcast Host Announcement
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hostAnnouncement}
                    onChange={e => setHostAnnouncement(e.target.value)}
                    placeholder="e.g. Opening the floor for 3-minute testimonies..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleHostBroadcast}
                    disabled={!hostAnnouncement.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/30"
                  >
                    Broadcast
                  </button>
                </div>
              </div>

              {/* Participants Roster with Mute/Kick */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Current Attendees ({participants.length})
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {participants.map(p => (
                    <div
                      key={p.userId}
                      className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.avatarUrl} alt={p.userName} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-white">{p.userName}</span>
                        {p.role === 'host' && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 text-[10px]">
                            Host
                          </span>
                        )}
                        {p.isHandRaised && <span>✋</span>}
                      </div>

                      {p.role !== 'host' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              fetch(`/api/recovery/meetings/${meeting.id}/host-action`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ type: 'mute_user', targetUserId: p.userId })
                              });
                            }}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px]"
                            title="Mute user"
                          >
                            <MicOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${p.userName} from this meeting?`)) {
                                fetch(`/api/recovery/meetings/${meeting.id}/host-action`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ type: 'kick_user', targetUserId: p.userId })
                                });
                              }
                            }}
                            className="p-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-300 text-[10px]"
                            title="Remove user"
                          >
                            Kick
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Guidelines Modal */}
      {isGuidelinesOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#080d24] border border-blue-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">Fellowship Guidelines</h3>
              </div>
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-1">1. Absolute Confidentiality</h4>
                <p>What is shared in this meeting stays in this meeting. We protect each other’s reputation and trust.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-1">2. Christ as Our Higher Power</h4>
                <p>We do not rely on vague spiritualities. We look to Jesus Christ, the Living Savior and Deliverer.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-1">3. No Crosstalk or Unsolicited Advice</h4>
                <p>Listen with compassion. Allow each person uninterrupted time to speak without debate or fixing.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-1">4. Anonymous & Camera-Free</h4>
                <p>Camera is completely optional. You may toggle audio-only and anonymous name at any time.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
