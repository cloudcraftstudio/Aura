// WebRTC Peer Connection & Media Management Engine

export interface WebRTCConfig {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
  onError?: (err: Error) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private config: WebRTCConfig = {};
  private signalingChannel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private isAudioMuted: boolean = false;
  private isVideoMuted: boolean = false;
  private isScreenSharing: boolean = false;

  constructor(config: WebRTCConfig = {}) {
    this.config = config;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.signalingChannel = new BroadcastChannel('aura_webrtc_signaling');
        this.signalingChannel.onmessage = this.handleSignalingMessage.bind(this);
      } catch (e) {
        console.warn('BroadcastChannel signaling unavailable', e);
      }
    }
  }

  public setConfig(config: WebRTCConfig) {
    this.config = { ...this.config, ...config };
  }

  // Get local user media (Camera + Mic)
  public async getLocalMedia(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      if (this.localStream) {
        this.stopLocalMedia();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
          audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
        });
      } else {
        // Fallback canvas video stream if hardware media blocked or in restrictive iframe
        this.localStream = this.createSyntheticStream(video);
      }

      if (this.config.onLocalStream && this.localStream) {
        this.config.onLocalStream(this.localStream);
      }

      return this.localStream;
    } catch (err: any) {
      console.warn('getUserMedia error, providing synthetic stream:', err);
      this.localStream = this.createSyntheticStream(video);
      if (this.config.onLocalStream && this.localStream) {
        this.config.onLocalStream(this.localStream);
      }
      return this.localStream;
    }
  }

  // Create clean animated synthetic fallback stream if device camera is busy/denied
  private createSyntheticStream(withVideo: boolean): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const draw = () => {
      if (!ctx) return;
      // Ambient gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Glowing orb
      const x = 320 + Math.cos(angle) * 80;
      const y = 240 + Math.sin(angle) * 50;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.fill();

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aura WebRTC Live Stream', 320, 240);

      angle += 0.04;
      requestAnimationFrame(draw);
    };

    if (withVideo) {
      draw();
    }

    const stream = canvas.captureStream(30);
    // Add empty audio track
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const dst = audioCtx.createMediaStreamDestination();
        const gain = audioCtx.createGain();
        gain.gain.value = 0.001; // Silent
        osc.connect(gain);
        gain.connect(dst);
        osc.start();
        dst.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }
    } catch (e) {
      console.warn('Synthetic audio track error:', e);
    }
    return stream;
  }

  // Toggle Screen Sharing
  public async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing) {
      // Revert to camera
      if (this.screenStream) {
        this.screenStream.getTracks().forEach((t) => t.stop());
        this.screenStream = null;
      }
      this.isScreenSharing = false;
      const cameraStream = await this.getLocalMedia(!this.isVideoMuted, !this.isAudioMuted);
      this.replaceVideoTrack(cameraStream.getVideoTracks()[0]);
      return false;
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen share not supported on this device');
        }
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const screenTrack = this.screenStream.getVideoTracks()[0];
        screenTrack.onended = () => {
          this.toggleScreenShare();
        };

        this.replaceVideoTrack(screenTrack);
        this.isScreenSharing = true;

        if (this.config.onLocalStream && this.localStream) {
          this.config.onLocalStream(new MediaStream([screenTrack, ...this.localStream.getAudioTracks()]));
        }
        return true;
      } catch (e) {
        console.warn('Screen share cancelled or failed:', e);
        return false;
      }
    }
  }

  private replaceVideoTrack(newTrack: MediaStreamTrack | undefined) {
    if (!newTrack || !this.peerConnection) return;
    const senders = this.peerConnection.getSenders();
    const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
    if (videoSender) {
      videoSender.replaceTrack(newTrack);
    }
  }

  // Toggle Mute Audio
  public toggleAudio(): boolean {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        this.isAudioMuted = !track.enabled;
      });
      return !this.isAudioMuted;
    }
    return false;
  }

  // Toggle Camera Video
  public toggleVideo(): boolean {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        this.isVideoMuted = !track.enabled;
      });
      return !this.isVideoMuted;
    }
    return false;
  }

  // Initiate peer connection
  public async createPeerConnection(roomId: string, isInitiator: boolean = false) {
    this.currentRoomId = roomId;
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    this.remoteStream = new MediaStream();
    if (this.config.onRemoteStream) {
      this.config.onRemoteStream(this.remoteStream);
    }

    // Attach local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Remote track received
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (this.remoteStream) {
          this.remoteStream.addTrack(track);
        }
      });
      if (this.config.onRemoteStream && this.remoteStream) {
        this.config.onRemoteStream(this.remoteStream);
      }
    };

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signalingChannel) {
        this.signalingChannel.postMessage({
          type: 'ice_candidate',
          roomId: this.currentRoomId,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'disconnected' || this.peerConnection?.connectionState === 'failed') {
        this.endCall();
      }
    };

    if (isInitiator) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      if (this.signalingChannel) {
        this.signalingChannel.postMessage({
          type: 'call_offer',
          roomId: this.currentRoomId,
          sdp: offer,
        });
      }
    }
  }

  private async handleSignalingMessage(event: MessageEvent) {
    const { type, roomId, sdp, candidate } = event.data || {};
    if (!roomId || roomId !== this.currentRoomId) return;

    try {
      if (type === 'call_offer' && this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        if (this.signalingChannel) {
          this.signalingChannel.postMessage({
            type: 'call_answer',
            roomId: this.currentRoomId,
            sdp: answer,
          });
        }
      } else if (type === 'call_answer' && this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } else if (type === 'ice_candidate' && this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else if (type === 'call_end') {
        this.endCall(false);
      }
    } catch (err: any) {
      console.warn('WebRTC signaling handler error:', err);
    }
  }

  public endCall(broadcast: boolean = true) {
    if (broadcast && this.signalingChannel && this.currentRoomId) {
      this.signalingChannel.postMessage({
        type: 'call_end',
        roomId: this.currentRoomId,
      });
    }

    this.stopLocalMedia();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.currentRoomId = null;
    this.isScreenSharing = false;

    if (this.config.onCallEnded) {
      this.config.onCallEnded();
    }
  }

  public stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
  }
}
