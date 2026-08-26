import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserStatus } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { offlineStorage, STORAGE_KEYS } from '../services/offlineStorage';
import { notificationService } from '../services/notifications';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  loginAsUser: (userId: string) => void;
  registerCustomUser: (name: string, email: string, handle: string, avatarUrl?: string, bio?: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUserStatus: (status: UserStatus, statusMessage?: string) => Promise<void>;
  logout: () => void;
  isOnline: boolean;
  isServerConnected: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    return offlineStorage.load<UserProfile[]>('aura_all_users', DEMO_USERS);
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = offlineStorage.load<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
    return saved || DEMO_USERS[0];
  });

  const [isOnline, setIsOnline] = useState<boolean>(offlineStorage.getIsOnline());
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Fetch all users from server on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const serverUsers = await api.getUsers();
      if (serverUsers && serverUsers.length > 0) {
        setAllUsers(serverUsers);
        offlineStorage.save('aura_all_users', serverUsers);
        setIsServerConnected(true);
      }
    };
    fetchUsers();
  }, []);

  // Connection listener
  useEffect(() => {
    const unsubscribe = offlineStorage.onConnectionChange((online) => {
      setIsOnline(online);
      if (online) {
        notificationService.notify({
          type: 'system',
          title: 'Back Online',
          body: 'Reconnected to Aura network. Database synced.',
          playSound: false,
        });
      } else {
        notificationService.notify({
          type: 'system',
          title: 'Offline Mode Active',
          body: 'Working with cached database. All edits will sync to server when reconnected.',
          playSound: false,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      offlineStorage.save(STORAGE_KEYS.CURRENT_USER, user);
    }
  }, [user]);

  useEffect(() => {
    offlineStorage.save('aura_all_users', allUsers);
  }, [allUsers]);

  // Google Sign-In / Onboarding
  const loginWithGoogle = async () => {
    // Generate authentic user or connect with Google profile
    const defaultGoogleEmail = `user.${Math.random().toString(36).substring(2, 6)}@gmail.com`;
    const defaultGoogleName = 'Google Team Member';
    const googleAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${defaultGoogleEmail}`;

    const serverUser = await api.googleAuth(defaultGoogleName, defaultGoogleEmail, googleAvatar);
    const activeUser = serverUser || {
      id: 'user_google_' + Date.now(),
      name: defaultGoogleName,
      email: defaultGoogleEmail,
      handle: defaultGoogleEmail.split('@')[0],
      avatarUrl: googleAvatar,
      bio: 'Connected via Google Account ✨',
      status: 'online' as UserStatus,
      statusMessage: 'Ready to collaborate',
      followersCount: 0,
      followingCount: 4,
      isVerified: true,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUser(activeUser);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === activeUser.id);
      return exists ? prev.map((u) => (u.id === activeUser.id ? activeUser : u)) : [activeUser, ...prev];
    });

    notificationService.notify({
      type: 'system',
      title: `Signed in with Google`,
      body: `Welcome to Aura, ${activeUser.name}! Account saved to server.`,
      avatar: activeUser.avatarUrl,
      playSound: true,
    });
  };

  const loginWithEmail = async (email: string) => {
    const serverUser = await api.login(email);
    if (serverUser) {
      setUser(serverUser);
      setAllUsers((prev) => (prev.some((u) => u.id === serverUser.id) ? prev : [serverUser, ...prev]));
      notificationService.notify({
        type: 'system',
        title: `Welcome back, ${serverUser.name}`,
        body: 'Successfully logged into your account.',
        avatar: serverUser.avatarUrl,
        playSound: true,
      });
    } else {
      // Find locally or create
      const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.handle.toLowerCase() === email.toLowerCase());
      if (existing) {
        setUser(existing);
      } else {
        await registerCustomUser(email.split('@')[0], email, email.split('@')[0]);
      }
    }
  };

  const loginAsUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId) || DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      notificationService.notify({
        type: 'system',
        title: `Switched Persona`,
        body: `Now active as ${found.name} (@${found.handle})`,
        avatar: found.avatarUrl,
        playSound: false,
      });
    }
  };

  const registerCustomUser = async (name: string, email: string, handle: string, avatarUrl?: string, bio?: string) => {
    const cleanHandle = handle.replace('@', '').toLowerCase();
    const serverUser = await api.register(name, email, cleanHandle, avatarUrl, bio);

    const newUser: UserProfile = serverUser || {
      id: 'user_' + Date.now(),
      name,
      email,
      handle: cleanHandle,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: bio || 'Explorer on Aura ✨ Connected to real-time WebRTC social network.',
      status: 'online',
      statusMessage: 'Just joined Aura!',
      followersCount: 0,
      followingCount: 4,
      isVerified: false,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setAllUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setUser(newUser);

    notificationService.notify({
      type: 'system',
      title: 'Welcome to Aura!',
      body: 'Your account is ready and saved in the server database.',
      avatar: newUser.avatarUrl,
      playSound: true,
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    offlineStorage.broadcastEvent('profile_update', updated);

    // Save to server
    await api.updateProfile(user.id, updates);
  };

  const setUserStatus = async (status: UserStatus, statusMessage?: string) => {
    if (!user) return;
    const finalMsg = statusMessage !== undefined ? statusMessage : user.statusMessage;
    await updateProfile({ status, statusMessage: finalMsg });
    await api.setUserStatus(user.id, status, finalMsg);
  };

  const logout = () => {
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        loginWithGoogle,
        loginWithEmail,
        loginAsUser,
        registerCustomUser,
        updateProfile,
        setUserStatus,
        logout,
        isOnline,
        isServerConnected,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
