import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { soundEffects } from '../services/audio';
import { notificationService } from '../services/notifications';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type PwaInstallState = 'available' | 'installed' | 'ios_manual' | 'unsupported';

interface PermissionsContextType {
  cameraStatus: PermissionState;
  micStatus: PermissionState;
  notificationStatus: PermissionState;
  pwaStatus: PwaInstallState;
  isStandalone: boolean;
  isIos: boolean;
  isBannerDismissed: boolean;
  isPermissionsModalOpen: boolean;
  isSaveToHomeModalOpen: boolean;
  
  // Actions
  requestCameraPermission: () => Promise<boolean>;
  requestMicPermission: () => Promise<boolean>;
  requestMediaPermissions: () => Promise<{ camera: boolean; mic: boolean }>;
  requestNotificationPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<{ camera: boolean; mic: boolean; notifications: boolean }>;
  promptSaveToHome: () => Promise<void>;
  
  // Modal toggles
  openPermissionsModal: () => void;
  closePermissionsModal: () => void;
  openSaveToHomeModal: () => void;
  closeSaveToHomeModal: () => void;
  dismissBanner: () => void;
  restoreBanner: () => void;
  
  // Verification helpers
  checkAllPermissions: () => Promise<void>;
  sendTestNotification: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const BANNER_DISMISSED_KEY = 'aura_permissions_banner_dismissed';

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameraStatus, setCameraStatus] = useState<PermissionState>('prompt');
  const [micStatus, setMicStatus] = useState<PermissionState>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<PermissionState>('prompt');
  const [pwaStatus, setPwaStatus] = useState<PwaInstallState>('available');
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isSaveToHomeModalOpen, setIsSaveToHomeModalOpen] = useState(false);

  // Store deferred PWA install prompt
  const deferredPromptRef = useRef<any>(null);

  // Check platform environment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Detect Standalone (already added to Home Screen)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(Boolean(isInStandaloneMode));

    if (isInStandaloneMode) {
      setPwaStatus('installed');
    } else if (isIosDevice) {
      setPwaStatus('ios_manual');
    }

    // Listen for BeforeInstallPrompt event (Chrome, Android, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      if (!isInStandaloneMode) {
        setPwaStatus('available');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed event listener
    const handleAppInstalled = () => {
      setPwaStatus('installed');
      deferredPromptRef.current = null;
      soundEffects.playLevelUp();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check current permission queries
  const checkAllPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Notification status check
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationStatus('granted');
      } else if (Notification.permission === 'denied') {
        setNotificationStatus('denied');
      } else {
        setNotificationStatus('prompt');
      }
    } else {
      setNotificationStatus('unsupported');
    }

    // Modern permissions API query if available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const camPerm = await navigator.permissions.query({ name: 'camera' as any }).catch(() => null);
        if (camPerm) {
          setCameraStatus(camPerm.state as PermissionState);
          camPerm.onchange = () => setCameraStatus(camPerm.state as PermissionState);
        }

        const micPerm = await navigator.permissions.query({ name: 'microphone' as any }).catch(() => null);
        if (micPerm) {
          setMicStatus(micPerm.state as PermissionState);
          micPerm.onchange = () => setMicStatus(micPerm.state as PermissionState);
        }
      } catch {
        // Some browsers don't support camera/mic in permissions.query
      }
    }
  }, []);

  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions]);

  // Request Camera
  const requestCameraPermission = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      return false;
    }
    try {
      soundEffects.playTap();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop tracks immediately after granting
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus('granted');
      soundEffects.playSuccessTone();
      return true;
    } catch (err: any) {
      console.warn('Camera permission denied or unavailable:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
      }
      return false;
    }
  };

  // Request Microphone
  const requestMicPermission = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('unsupported');
      return false;
    }
    try {
      soundEffects.playTap();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus('granted');
      soundEffects.playSuccessTone();
      return true;
    } catch (err: any) {
      console.warn('Mic permission denied or unavailable:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatus('denied');
      }
      return false;
    }
  };

  // Request Both Camera & Microphone
  const requestMediaPermissions = async (): Promise<{ camera: boolean; mic: boolean }> => {
    soundEffects.playTap();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setMicStatus('unsupported');
      return { camera: false, mic: false };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus('granted');
      setMicStatus('granted');
      soundEffects.playSuccessTone();
      return { camera: true, mic: true };
    } catch (err: any) {
      console.warn('Combined media request error, trying separate requests:', err);
      const cameraResult = await requestCameraPermission();
      const micResult = await requestMicPermission();
      return { camera: cameraResult, mic: micResult };
    }
  };

  // Request Notifications
  const requestNotificationPermission = async (): Promise<boolean> => {
    soundEffects.playTap();
    const granted = await notificationService.requestPermission();
    if (granted) {
      setNotificationStatus('granted');
      soundEffects.playSuccessTone();
      notificationService.notify({
        type: 'system',
        title: 'Notifications Enabled 🎉',
        body: 'You will receive instant alerts for incoming WebRTC calls, messages, and social updates!',
        playSound: true,
      });
      return true;
    } else {
      setNotificationStatus(Notification.permission === 'denied' ? 'denied' : 'prompt');
      return false;
    }
  };

  // Request All (Camera, Mic & Notifications)
  const requestAllPermissions = async (): Promise<{ camera: boolean; mic: boolean; notifications: boolean }> => {
    const media = await requestMediaPermissions();
    const notif = await requestNotificationPermission();
    return {
      camera: media.camera,
      mic: media.mic,
      notifications: notif,
    };
  };

  // Trigger Save to Home / Add to Home Screen
  const promptSaveToHome = async () => {
    soundEffects.playTap();
    if (deferredPromptRef.current) {
      try {
        deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;
        if (outcome === 'accepted') {
          setPwaStatus('installed');
          deferredPromptRef.current = null;
        }
      } catch (e) {
        console.warn('PWA install error:', e);
        setIsSaveToHomeModalOpen(true);
      }
    } else {
      // If prompt not directly available (e.g. iOS or manual), open step-by-step visual modal
      setIsSaveToHomeModalOpen(true);
    }
  };

  const sendTestNotification = () => {
    soundEffects.playMessageReceived();
    notificationService.notify({
      type: 'chat',
      title: 'Aura Test Notification ✨',
      body: 'Push & chime notifications are working smoothly across your device.',
      playSound: true,
    });
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    } catch {}
  };

  const restoreBanner = () => {
    setIsBannerDismissed(false);
    try {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    } catch {}
  };

  return (
    <PermissionsContext.Provider
      value={{
        cameraStatus,
        micStatus,
        notificationStatus,
        pwaStatus,
        isStandalone,
        isIos,
        isBannerDismissed,
        isPermissionsModalOpen,
        isSaveToHomeModalOpen,
        requestCameraPermission,
        requestMicPermission,
        requestMediaPermissions,
        requestNotificationPermission,
        requestAllPermissions,
        promptSaveToHome,
        openPermissionsModal: () => setIsPermissionsModalOpen(true),
        closePermissionsModal: () => setIsPermissionsModalOpen(false),
        openSaveToHomeModal: () => setIsSaveToHomeModalOpen(true),
        closeSaveToHomeModal: () => setIsSaveToHomeModalOpen(false),
        dismissBanner,
        restoreBanner,
        checkAllPermissions,
        sendTestNotification,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
