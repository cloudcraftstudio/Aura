import { registerPlugin } from '@capacitor/core';
import { audioService } from './audio';

// Interface for Capacitor Incoming Call Kit
export interface IncomingCallPlugin {
  displayIncomingCall(options: {
    id: string;
    name: string;
    avatar?: string;
    handleType?: string;
    hasVideo?: boolean;
    duration?: number;
  }): Promise<void>;
  endCall(options: { id: string }): Promise<void>;
  openApp(): Promise<void>;
}

const IncomingCall = registerPlugin<IncomingCallPlugin>('IncomingCall');

class CallKitService {
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Listen for answer/decline events if running natively on Capacitor
    try {
      // Setup listener handlers when running on mobile
      window.addEventListener('capacitorIncomingCallAnswered', (e: any) => {
        console.log('Call answered via native CallKit:', e);
        audioService.stopRingtone();
      });

      window.addEventListener('capacitorIncomingCallDeclined', (e: any) => {
        console.log('Call declined via native CallKit:', e);
        audioService.stopRingtone();
        audioService.playMarioGameOver();
      });
    } catch (err) {
      console.warn('CallKit event listener setup error:', err);
    }
  }

  public async showIncomingCall(roomId: string, callerName: string, callerAvatar?: string, isVideo = true) {
    try {
      // Play Mario ringtone on web fallback / foreground
      audioService.startRingtone();

      // Trigger native incoming call screen if running on Android/iOS Capacitor
      await IncomingCall.displayIncomingCall({
        id: roomId,
        name: callerName,
        avatar: callerAvatar || '',
        hasVideo: isVideo,
        duration: 30000,
      });
    } catch (err) {
      console.log('Native CallKit display fallback to web notification mode:', err);
    }
  }

  public async endCall(roomId: string) {
    try {
      audioService.stopRingtone();
      audioService.playMarioGameOver();
      await IncomingCall.endCall({ id: roomId });
    } catch (err) {
      console.log('Native CallKit end call fallback:', err);
    }
  }
}

export const callKitService = new CallKitService();
