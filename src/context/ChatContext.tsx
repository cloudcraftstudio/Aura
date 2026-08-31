import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, ChatMessage, UserProfile, MediaType } from '../types';
import { INITIAL_CONVERSATIONS, DEMO_USERS } from '../data/mockData';
import { offlineStorage, STORAGE_KEYS } from '../services/offlineStorage';
import { notificationService } from '../services/notifications';
import { soundEffects } from '../services/audio';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface StoryReplyInfo {
  storyId: string;
  mediaUrl: string;
  caption?: string;
  authorName: string;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, ChatMessage[]>;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (
    content: string,
    mediaUrl?: string,
    mediaType?: MediaType,
    audioDuration?: number,
    replyTo?: ChatMessage
  ) => Promise<void>;
  sendStoryReply: (
    targetUserId: string,
    targetUserName: string,
    targetUserAvatar: string,
    storyInfo: StoryReplyInfo,
    content: string
  ) => Promise<ChatMessage>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  startDirectConversation: (targetUser: UserProfile) => Promise<Conversation>;
  createGroupConversation: (name: string, members: UserProfile[], avatar?: string) => Promise<Conversation>;
  activeTypingUsers: string[];
  setTyping: (isTyping: boolean) => void;
  refreshConversations: () => Promise<void>;
}

const INITIAL_MESSAGES_MAP: Record<string, ChatMessage[]> = {};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, allUsers } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = offlineStorage.load<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    return (loaded || []).filter(
      (c) =>
        c &&
        !c.id.startsWith('conv_alex_') &&
        c.id !== 'conv_design_circle' &&
        !c.participantIds?.some((id) => ['user_alex', 'user_maya', 'user_liam', 'user_elena'].includes(id))
    );
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const loaded = offlineStorage.load<Record<string, ChatMessage[]>>('aura_messages_map', {});
    const clean: Record<string, ChatMessage[]> = {};
    if (loaded) {
      Object.keys(loaded).forEach((k) => {
        if (!k.startsWith('conv_alex_') && k !== 'conv_design_circle') {
          clean[k] = loaded[k];
        }
      });
    }
    return clean;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return conversations[0]?.id || null;
  });

  const [activeTypingUsers, setActiveTypingUsers] = useState<string[]>([]);

  // Fetch conversations from server
  const refreshConversations = async () => {
    try {
      const serverConvs = await api.getConversations(user?.id);
      if (Array.isArray(serverConvs)) {
        const cleanConvs = serverConvs.filter(
          (c) =>
            c &&
            !c.id.startsWith('conv_alex_') &&
            c.id !== 'conv_design_circle' &&
            !c.participantIds?.some((id) => ['user_alex', 'user_maya', 'user_liam', 'user_elena'].includes(id))
        );
        setConversations(cleanConvs);
        offlineStorage.save(STORAGE_KEYS.CONVERSATIONS, cleanConvs);
      }
    } catch (e) {}
  };


  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 2500);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Load and live-sync messages for active conversation from server
  useEffect(() => {
    if (!activeConversationId) return;
    const fetchMsgs = async () => {
      try {
        const serverMsgs = await api.getMessages(activeConversationId);
        if (serverMsgs && serverMsgs.length > 0) {
          setMessages((prev) => {
            const currentList = prev[activeConversationId] || [];
            // Deduplicate server messages with any pending/existing messages
            const idMap = new Map<string, ChatMessage>();
            serverMsgs.forEach((m) => idMap.set(m.id, m));
            currentList.forEach((m) => {
              if (!idMap.has(m.id)) {
                // Check if already represented by a message with same sender, content, and near timestamp
                const exists = Array.from(idMap.values()).some(
                  (sm) => sm.senderId === m.senderId && sm.content === m.content && Math.abs(sm.timestamp - m.timestamp) < 4000
                );
                if (!exists) {
                  idMap.set(m.id, m);
                }
              }
            });
            const merged = Array.from(idMap.values()).sort((a, b) => a.timestamp - b.timestamp);
            return {
              ...prev,
              [activeConversationId]: merged,
            };
          });
        }
      } catch (e) {}
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 2000);
    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Save to offline storage
  useEffect(() => {
    offlineStorage.save(STORAGE_KEYS.CONVERSATIONS, conversations);
  }, [conversations]);

  useEffect(() => {
    offlineStorage.save('aura_messages_map', messages);
  }, [messages]);

  // Cross-tab broadcast listener
  useEffect(() => {
    const unsub = offlineStorage.onBroadcastEvent(({ type, payload }) => {
      if (type === 'chat_message') {
        const msg = payload as ChatMessage;
        setMessages((prev) => {
          const list = prev[msg.conversationId] || [];
          if (list.some((m) => m.id === msg.id || (m.senderId === msg.senderId && m.content === msg.content && Math.abs(m.timestamp - msg.timestamp) < 3000))) {
            return prev;
          }
          return {
            ...prev,
            [msg.conversationId]: [...list, msg],
          };
        });

        setConversations((prev) =>
          prev.map((c) => (c.id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: msg.timestamp } : c))
        );
      } else if (type === 'message_reaction') {
        const { conversationId, messageId, emoji, userId } = payload;
        setMessages((prev) => {
          const list = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: list.map((m) => {
              if (m.id === messageId) {
                const reactions = { ...(m.reactions || {}) };
                const userList = reactions[emoji] || [];
                reactions[emoji] = userList.includes(userId)
                  ? userList.filter((u) => u !== userId)
                  : [...userList, userId];
                return { ...m, reactions };
              }
              return m;
            }),
          };
        });
      }
    });
    return () => unsub();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const sendMessage = async (
    content: string,
    mediaUrl?: string,
    mediaType: MediaType = 'none',
    audioDuration?: number,
    replyTo?: ChatMessage
  ) => {
    if (!user || !activeConversationId) return;

    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newMessageData = {
      id: messageId,
      conversationId: activeConversationId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatarUrl,
      content,
      mediaUrl,
      mediaType,
      audioDuration,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.senderName,
            content: replyTo.content,
            mediaUrl: replyTo.mediaUrl,
          }
        : undefined,
      timestamp: Date.now(),
      isRead: true,
      isDelivered: true,
    };

    const tempMessage: ChatMessage = {
      ...newMessageData,
    };

    // Optimistic UI update
    setMessages((prev) => {
      const existing = prev[activeConversationId] || [];
      if (existing.some((m) => m.id === tempMessage.id)) return prev;
      return {
        ...prev,
        [activeConversationId]: [...existing, tempMessage],
      };
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, lastMessage: tempMessage, updatedAt: Date.now() }
          : c
      )
    );

    soundEffects.playMessageSent();

    // Call server API
    const savedServerMsg = await api.sendMessage(newMessageData);
    if (savedServerMsg) {
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === tempMessage.id ? savedServerMsg : m
        ),
      }));
      offlineStorage.broadcastEvent('chat_message', savedServerMsg);
    } else {
      offlineStorage.broadcastEvent('chat_message', tempMessage);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user || !activeConversationId) return;

    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map((m) => {
          if (m.id === messageId) {
            const reactions = { ...(m.reactions || {}) };
            const current = reactions[emoji] || [];
            const updated = current.includes(user.id)
              ? current.filter((id) => id !== user.id)
              : [...current, user.id];
            reactions[emoji] = updated;
            return { ...m, reactions };
          }
          return m;
        }),
      };
    });

    offlineStorage.broadcastEvent('message_reaction', {
      conversationId: activeConversationId,
      messageId,
      emoji,
      userId: user.id,
    });

    await api.addReaction(activeConversationId, messageId, emoji, user.id);
  };

  const sendStoryReply = async (
    targetUserId: string,
    targetUserName: string,
    targetUserAvatar: string,
    storyInfo: StoryReplyInfo,
    content: string
  ): Promise<ChatMessage> => {
    const currentUser = user || DEMO_USERS[0];

    // Find existing direct conversation with this user
    let conv = conversations.find(
      (c) => !c.isGroup && c.participantIds.includes(targetUserId) && c.participantIds.includes(currentUser.id)
    );

    // If conversation doesn't exist, create it
    if (!conv) {
      let targetUserObj = allUsers.find((u) => u.id === targetUserId);
      if (!targetUserObj) {
        targetUserObj = {
          id: targetUserId,
          name: targetUserName,
          handle: targetUserName.toLowerCase().replace(/\s+/g, ''),
          email: `${targetUserId}@aura.app`,
          avatarUrl: targetUserAvatar,
          bio: 'Aura creator & photographer',
          status: 'online',
          followersCount: 1420,
          followingCount: 380,
          joinedAt: '2024-01-15',
        };
      }

      conv = {
        id: `conv_${currentUser.id}_${targetUserId}`,
        isGroup: false,
        participantIds: [currentUser.id, targetUserId],
        participants: [currentUser, targetUserObj],
        unreadCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setConversations((prev) => [conv!, ...prev]);
      api.createConversation(currentUser.id, [targetUserId], false).catch(() => {});
    }

    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newMsgData = {
      id: messageId,
      conversationId: conv.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: content.trim(),
      storyReply: {
        storyId: storyInfo.storyId,
        mediaUrl: storyInfo.mediaUrl,
        caption: storyInfo.caption,
        authorName: storyInfo.authorName,
      },
      timestamp: Date.now(),
      isRead: true,
      isDelivered: true,
    };

    const tempMessage: ChatMessage = {
      ...newMsgData,
    };

    // Update active conversation & messages map
    setActiveConversationId(conv.id);

    setMessages((prev) => {
      const existing = prev[conv!.id] || [];
      if (existing.some((m) => m.id === tempMessage.id)) return prev;
      return {
        ...prev,
        [conv!.id]: [...existing, tempMessage],
      };
    });

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== conv!.id);
      const updatedConv = {
        ...conv!,
        lastMessage: tempMessage,
        updatedAt: Date.now(),
      };
      return [updatedConv, ...filtered];
    });

    soundEffects.playMessageSent();
    offlineStorage.broadcastEvent('chat_message', tempMessage);

    // Call server API asynchronously
    api.sendMessage(newMsgData).then((savedServerMsg) => {
      if (savedServerMsg) {
        setMessages((prev) => {
          const list = prev[conv!.id] || [];
          return {
            ...prev,
            [conv!.id]: list.map((m) =>
              m.id === tempMessage.id ? savedServerMsg : m
            ),
          };
        });
      }
    }).catch(() => {});

    return tempMessage;
  };

  const startDirectConversation = async (targetUser: UserProfile): Promise<Conversation> => {
    if (!user) throw new Error('Must be logged in');

    const existing = conversations.find(
      (c) => !c.isGroup && c.participantIds.includes(targetUser.id) && c.participantIds.includes(user.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing;
    }

    const newConvData: Conversation = {
      id: `conv_${user.id}_${targetUser.id}`,
      isGroup: false,
      participantIds: [user.id, targetUser.id],
      participants: [user, targetUser],
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConvData, ...prev]);
    setActiveConversationId(newConvData.id);

    await api.createConversation(user.id, [targetUser.id], false);
    return newConvData;
  };

  const createGroupConversation = async (name: string, members: UserProfile[], avatar?: string): Promise<Conversation> => {
    if (!user) throw new Error('Must be logged in');

    const allMembers = [user, ...members.filter((m) => m.id !== user.id)];
    const newConvData: Conversation = {
      id: 'conv_group_' + Date.now(),
      isGroup: true,
      name,
      avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
      participantIds: allMembers.map((m) => m.id),
      participants: allMembers,
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConvData, ...prev]);
    setActiveConversationId(newConvData.id);

    await api.createConversation(user.id, allMembers.map((m) => m.id), true, name);
    return newConvData;
  };

  const setTyping = (isTyping: boolean) => {
    // Local typing indicator
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        setActiveConversationId,
        sendMessage,
        sendStoryReply,
        addReaction,
        startDirectConversation,
        createGroupConversation,
        activeTypingUsers,
        setTyping,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
