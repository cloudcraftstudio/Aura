import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserStatus } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { offlineStorage, STORAGE_KEYS } from '../services/offlineStorage';
import { notificationService } from '../services/notifications';
import { api } from '../services/api';
import { GoogleAccountChooserModal, KnownGoogleAccount } from '../components/common/GoogleAccountChooserModal';

interface AuthContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  loginWithGoogle: (customAccount?: { email: string; name: string; avatarUrl?: string }) => Promise<void>;
  promptGoogleChooser: () => void;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; requiresPassword?: boolean; error?: string }>;
  loginAsUser: (userId: string) => void;
  registerCustomUser: (name: string, email: string, handle: string, avatarUrl?: string, bio?: string, password?: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUserStatus: (status: UserStatus, statusMessage?: string) => Promise<void>;
  setPassword: (newPassword: string, currentPassword?: string) => Promise<boolean>;
  logout: () => void;
  isOnline: boolean;
  isServerConnected: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KNOWN_GOOGLE_STORAGE_KEY = 'aura_known_google_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    return offlineStorage.load<UserProfile[]>('aura_all_users', DEMO_USERS);
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = offlineStorage.load<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
    return saved || null;
  });

  const [isOnline, setIsOnline] = useState<boolean>(offlineStorage.getIsOnline());
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState<boolean>(false);

  // Load known google accounts
  const [knownGoogleAccounts, setKnownGoogleAccounts] = useState<KnownGoogleAccount[]>(() => {
    const saved = offlineStorage.load<KnownGoogleAccount[]>(KNOWN_GOOGLE_STORAGE_KEY, [
      {
        email: 'alex.rivera@gmail.com',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      },
      {
        email: 'maya.chen@gmail.com',
        name: 'Maya Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      },
      {
        email: 'liam.vance.photo@gmail.com',
        name: 'Liam Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      },
    ]);
    return saved;
  });

  // Fetch all users from server on mount & re-sync active user details
  useEffect(() => {
    const fetchUsers = async () => {
      const serverUsers = await api.getUsers();
      if (serverUsers && serverUsers.length > 0) {
        setAllUsers(serverUsers);
        offlineStorage.save('aura_all_users', serverUsers);
        setIsServerConnected(true);

        // If user is currently signed in, ensure latest state is synced from server
        setUser((currentUser) => {
          if (!currentUser) return null;
          const fresh = serverUsers.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
          return fresh ? { ...currentUser, ...fresh } : currentUser;
        });
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
    } else {
      offlineStorage.save(STORAGE_KEYS.CURRENT_USER, null);
    }
  }, [user]);

  useEffect(() => {
    offlineStorage.save('aura_all_users', allUsers);
  }, [allUsers]);

  const promptGoogleChooser = () => {
    setIsGoogleChooserOpen(true);
  };

  // Google Sign-In with selected account
  const loginWithGoogle = async (customAccount?: { email: string; name: string; avatarUrl?: string }) => {
    const targetEmail = customAccount?.email || 'user.design@gmail.com';
    const targetName = customAccount?.name || targetEmail.split('@')[0];
    const targetAvatar = customAccount?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetEmail}`;

    // Save to known google accounts list
    setKnownGoogleAccounts((prev) => {
      const exists = prev.some((a) => a.email.toLowerCase() === targetEmail.toLowerCase());
      const updated = exists ? prev : [{ email: targetEmail, name: targetName, avatarUrl: targetAvatar }, ...prev];
      offlineStorage.save(KNOWN_GOOGLE_STORAGE_KEY, updated);
      return updated;
    });

    const serverUser = await api.googleAuth(targetName, targetEmail, targetAvatar);
    const activeUser = serverUser || {
      id: 'user_google_' + targetEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      name: targetName,
      email: targetEmail,
      handle: targetEmail.split('@')[0].toLowerCase(),
      avatarUrl: targetAvatar,
      bio: 'Connected via Google Account ✨',
      status: 'online' as UserStatus,
      statusMessage: 'Ready to collaborate',
      followersCount: 0,
      followingCount: 4,
      isVerified: true,
      joinedAt: new Date().toISOString().split('T')[0],
      authProvider: 'google' as const,
    };

    setUser(activeUser);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === activeUser.id || u.email.toLowerCase() === activeUser.email.toLowerCase());
      return exists ? prev.map((u) => (u.email.toLowerCase() === activeUser.email.toLowerCase() ? activeUser : u)) : [activeUser, ...prev];
    });

    notificationService.notify({
      type: 'system',
      title: `Signed in with Google`,
      body: `Welcome to Aura, ${activeUser.name}! Retaining your saved profile and posts.`,
      avatar: activeUser.avatarUrl,
      playSound: true,
    });
  };

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; requiresPassword?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // First verify with server
    try {
      const serverUser = await api.login(cleanEmail, password);
      if (serverUser) {
        setUser(serverUser);
        setAllUsers((prev) => (prev.some((u) => u.id === serverUser.id) ? prev.map((u) => u.id === serverUser.id ? serverUser : u) : [serverUser, ...prev]));
        notificationService.notify({
          type: 'system',
          title: `Welcome back, ${serverUser.name}`,
          body: 'Successfully logged into your protected account.',
          avatar: serverUser.avatarUrl,
          playSound: true,
        });
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Login error:', err);
    }

    // Check if account exists in server check
    const check = await api.checkEmail(cleanEmail);
    if (check?.exists) {
      if (check.hasPassword && !password) {
        return { success: false, requiresPassword: true, error: 'Password required for this protected account' };
      }
      return { success: false, error: 'Incorrect password or authentication failed.' };
    }

    // Look in offline allUsers cache
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail || u.handle.toLowerCase() === cleanEmail);
    if (existing) {
      setUser(existing);
      return { success: true };
    }

    return { success: false, error: 'No account found with this email. Please create an account.' };
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

  const registerCustomUser = async (name: string, email: string, handle: string, avatarUrl?: string, bio?: string, password?: string) => {
    const cleanHandle = handle.replace('@', '').toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const serverUser = await api.register(name, cleanEmail, cleanHandle, avatarUrl, bio, password);

    const newUser: UserProfile = serverUser || {
      id: 'user_' + Date.now(),
      name,
      email: cleanEmail,
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
      hasPassword: Boolean(password),
      authProvider: 'email',
    };

    setAllUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setUser(newUser);

    notificationService.notify({
      type: 'system',
      title: 'Welcome to Aura!',
      body: 'Your account is protected and saved to the server database.',
      avatar: newUser.avatarUrl,
      playSound: true,
    });
  };

  const setPassword = async (newPassword: string, currentPassword?: string): Promise<boolean> => {
    if (!user) return false;
    const res = await api.setPassword(user.id, newPassword, currentPassword);
    if (res) {
      setUser(res);
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? res : u)));
      notificationService.notify({
        type: 'system',
        title: 'Password Updated',
        body: 'Your account password protection has been updated.',
        playSound: true,
      });
      return true;
    }
    return false;
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
        promptGoogleChooser,
        loginWithEmail,
        loginAsUser,
        registerCustomUser,
        updateProfile,
        setUserStatus,
        setPassword,
        logout,
        isOnline,
        isServerConnected,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
      }}
    >
      {children}

      {/* Google Account Selector Dialog */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        knownAccounts={knownGoogleAccounts}
        onSelectAccount={async (acc) => {
          setIsGoogleChooserOpen(false);
          await loginWithGoogle(acc);
          setIsAuthModalOpen(false);
        }}
        onUseAnotherAccount={() => {}}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
