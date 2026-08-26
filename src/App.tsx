import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { PermissionsProvider, usePermissions } from './context/PermissionsContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { SocialFeed } from './components/feed/SocialFeed';
import { ChatView } from './components/chat/ChatView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { VideoCallModal } from './components/call/VideoCallModal';
import { IncomingCallBanner } from './components/call/IncomingCallBanner';
import { NotificationToastContainer } from './components/notifications/NotificationToastContainer';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { MemberProfileModal } from './components/profile/MemberProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { MatrixSplashScreen } from './components/splash/MatrixSplashScreen';
import { ShareAppModal } from './components/common/ShareAppModal';
import { PermissionBanner } from './components/permissions/PermissionBanner';
import { PermissionsModal } from './components/permissions/PermissionsModal';
import { SaveToHomeModal } from './components/permissions/SaveToHomeModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'bookmarks'>('feed');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalType, setShareModalType] = useState<'general' | 'call' | 'chat'>('general');
  const [shareRoomId, setShareRoomId] = useState<string | undefined>();
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('aura_splash_entered');
    } catch {
      return true;
    }
  });
  const { user, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const { isNotificationsOpen, closeNotifications, openNotifications } = useNotifications();

  React.useEffect(() => {
    const handleTabNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: 'feed' | 'chat' | 'bookmarks' }>;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: 'general' | 'call' | 'chat'; roomId?: string }>;
      if (customEvent.detail?.type) {
        setShareModalType(customEvent.detail.type);
      } else {
        setShareModalType('general');
      }
      setShareRoomId(customEvent.detail?.roomId);
      setIsShareModalOpen(true);
    };
    const handleOpenUserProfile = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string }>;
      if (customEvent.detail?.userId) {
        setViewingUserId(customEvent.detail.userId);
      }
    };

    window.addEventListener('navigate_tab', handleTabNav);
    window.addEventListener('open_share_modal', handleOpenShare);
    window.addEventListener('open_user_profile', handleOpenUserProfile);
    return () => {
      window.removeEventListener('navigate_tab', handleTabNav);
      window.removeEventListener('open_share_modal', handleOpenShare);
      window.removeEventListener('open_user_profile', handleOpenUserProfile);
    };
  }, []);

  const handleOpenShareModal = (type: 'general' | 'call' | 'chat' = 'general', roomId?: string) => {
    setShareModalType(type);
    setShareRoomId(roomId);
    setIsShareModalOpen(true);
  };

  const handleEnterMatrix = () => {
    try {
      sessionStorage.setItem('aura_splash_entered', 'true');
    } catch {}
    setShowSplashScreen(false);
    // Upon entering the app for the first time, greet the user with sign up / sign in onboarding experience if not logged in
    if (!user) {
      setIsAuthModalOpen(true);
    }
  };

  const handleReplayMatrix = () => {
    setShowSplashScreen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#05060f] text-white flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      {/* Matrix Style Splash Screen with Touch to Enter */}
      {showSplashScreen && (
        <MatrixSplashScreen onEnter={handleEnterMatrix} />
      )}

      {/* Frosted Glass ambient background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] bg-blue-600/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] bg-pink-600/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[15%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenShare={() => handleOpenShareModal('general')}
      />

      {/* Permissions & Save to Home Screen Smart Banner */}
      <PermissionBanner />

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 flex flex-col min-h-0 ${activeTab === 'chat' ? 'pb-16 md:pb-4 overflow-hidden' : 'pb-20 md:pb-6'}`}>
        {activeTab === 'feed' && <SocialFeed />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'bookmarks' && <BookmarksView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenShare={() => handleOpenShareModal('general')}
      />

      {/* WebRTC Video Call & Incoming Call Overlay */}
      <VideoCallModal />
      <IncomingCallBanner />

      {/* Toast Notifications */}
      <NotificationToastContainer />

      {/* Notifications Center Modal */}
      <NotificationsModal isOpen={isNotificationsOpen} onClose={closeNotifications} />

      {/* App Permissions Setup & Diagnostic Modal */}
      <PermissionsModal />

      {/* Save to Home Screen & PWA Modal */}
      <SaveToHomeModal />

      {/* User Profile Modal (Self) */}
      {isProfileOpen && (
        <UserProfileModal
          onClose={() => setIsProfileOpen(false)}
          onTriggerMatrixSplash={handleReplayMatrix}
          onOpenShare={() => {
            setIsProfileOpen(false);
            handleOpenShareModal('general');
          }}
        />
      )}

      {/* Member Profile Modal (Other Users / Profile Cards) */}
      {viewingUserId && (
        <MemberProfileModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
          onOpenSelfEdit={() => {
            setViewingUserId(null);
            setIsProfileOpen(true);
          }}
        />
      )}

      {/* Invite Friends & Share App Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialType={shareModalType}
        roomId={shareRoomId}
      />

      {/* Authentication / Onboarding Modal */}
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <PermissionsProvider>
            <SocialProvider>
              <ChatProvider>
                <CallProvider>
                  <MainApp />
                </CallProvider>
              </ChatProvider>
            </SocialProvider>
          </PermissionsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

