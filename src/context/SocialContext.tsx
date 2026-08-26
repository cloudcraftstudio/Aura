import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SocialPost, UserStory, PostComment } from '../types';
import { INITIAL_POSTS, INITIAL_STORIES } from '../data/mockData';
import { offlineStorage, STORAGE_KEYS } from '../services/offlineStorage';
import { notificationService } from '../services/notifications';
import { soundEffects } from '../services/audio';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SocialContextType {
  posts: SocialPost[];
  stories: UserStory[];
  savedPostIds: string[];
  createPost: (content: string, mediaUrls: string[], tags: string[], location?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  addStory: (mediaUrl: string, caption?: string) => Promise<void>;
  markStorySeen: (storyId: string) => Promise<void>;
  getPostById: (postId: string) => SocialPost | undefined;
  refreshFeed: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<SocialPost[]>(() => {
    return offlineStorage.load<SocialPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  });

  const [stories, setStories] = useState<UserStory[]>(() => {
    return offlineStorage.load<UserStory[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  });

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    return offlineStorage.load<string[]>(STORAGE_KEYS.BOOKMARKS, ['post_1']);
  });

  // Fetch posts & stories from server API with smart real-time merging
  const refreshFeed = async () => {
    try {
      const [serverPosts, serverStories] = await Promise.all([api.getPosts(), api.getStories()]);
      if (serverPosts && serverPosts.length > 0) {
        setPosts((prevPosts) => {
          // Merge server posts with any optimistic local posts
          const serverMap = new Map<string, SocialPost>();
          serverPosts.forEach((sp) => serverMap.set(sp.id, sp));

          // Include any pending offline posts that are not yet on the server
          const merged: SocialPost[] = [];
          const seenIds = new Set<string>();

          // Server posts take canonical precedence for comments and likes
          serverPosts.forEach((sp) => {
            seenIds.add(sp.id);
            merged.push(sp);
          });

          // Check if local has any temp/offline pending posts
          prevPosts.forEach((lp) => {
            if (lp.isPendingSync && !seenIds.has(lp.id)) {
              merged.unshift(lp);
            }
          });

          return merged;
        });
        offlineStorage.save(STORAGE_KEYS.POSTS, serverPosts);
      }

      if (serverStories && serverStories.length > 0) {
        setStories(serverStories);
        offlineStorage.save(STORAGE_KEYS.STORIES, serverStories);
      }
    } catch (err) {
      console.warn('Feed refresh error:', err);
    }
  };

  useEffect(() => {
    refreshFeed();
    // Real-time cross-device sync interval (every 2.5 seconds)
    const interval = setInterval(refreshFeed, 2500);
    return () => clearInterval(interval);
  }, []);

  // Save to offline storage
  useEffect(() => {
    offlineStorage.save(STORAGE_KEYS.POSTS, posts);
  }, [posts]);

  useEffect(() => {
    offlineStorage.save(STORAGE_KEYS.STORIES, stories);
  }, [stories]);

  useEffect(() => {
    offlineStorage.save(STORAGE_KEYS.BOOKMARKS, savedPostIds);
  }, [savedPostIds]);

  // Listen to cross-tab updates
  useEffect(() => {
    const unsub = offlineStorage.onBroadcastEvent(({ type, payload }) => {
      if (type === 'new_post') {
        setPosts((prev) => [payload, ...prev.filter((p) => p.id !== payload.id)]);
      } else if (type === 'post_liked') {
        setPosts((prev) =>
          prev.map((p) => (p.id === payload.postId ? { ...p, likesCount: payload.likesCount, likedByUserIds: payload.likedByUserIds } : p))
        );
      } else if (type === 'new_comment') {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === payload.postId) {
              const comments = p.comments || [];
              if (comments.some((c) => c.id === payload.comment.id)) {
                return p;
              }
              return {
                ...p,
                commentsCount: comments.length + 1,
                comments: [...comments, payload.comment],
              };
            }
            return p;
          })
        );
      } else if (type === 'new_story') {
        setStories((prev) => [payload, ...prev.filter((s) => s.id !== payload.id)]);
      }
    });
    return () => unsub();
  }, []);

  const createPost = async (content: string, mediaUrls: string[], tags: string[], location?: string) => {
    if (!user) return;

    const newPostData = {
      authorId: user.id,
      authorName: user.name,
      authorHandle: user.handle,
      authorAvatar: user.avatarUrl,
      content,
      mediaUrls,
      tags,
      location,
    };

    // Optimistic UI update
    const tempPost: SocialPost = {
      ...newPostData,
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      likesCount: 0,
      likedByUserIds: [],
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      savedByUserIds: [],
      createdAt: Date.now(),
    };

    setPosts((prev) => [tempPost, ...prev]);

    // Save to server database
    const savedServerPost = await api.createPost(newPostData);
    if (savedServerPost) {
      setPosts((prev) => [savedServerPost, ...prev.filter((p) => p.id !== tempPost.id)]);
      offlineStorage.broadcastEvent('new_post', savedServerPost);
    } else {
      offlineStorage.broadcastEvent('new_post', tempPost);
    }

    notificationService.notify({
      type: 'system',
      title: 'Post Published',
      body: 'Your photo and thoughts are saved in the server database ✨',
      avatar: user.avatarUrl,
      playSound: false,
    });
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likedByUserIds.includes(user.id);
          const updatedLikes = isLiked
            ? post.likedByUserIds.filter((id) => id !== user.id)
            : [...post.likedByUserIds, user.id];
          const newCount = isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1;

          if (!isLiked) {
            soundEffects.playLikeSparkle();
            try {
              confetti({
                particleCount: 25,
                spread: 40,
                origin: { y: 0.8 },
                colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
              });
            } catch (e) {}

            if (post.authorId !== user.id) {
              notificationService.notify({
                type: 'like',
                title: `${user.name} liked your post`,
                body: post.content.slice(0, 60) + '...',
                avatar: user.avatarUrl,
                actionId: post.id,
                playSound: true,
              });
            }
          }

          const updatedPost = {
            ...post,
            likesCount: newCount,
            likedByUserIds: updatedLikes,
          };

          offlineStorage.broadcastEvent('post_liked', {
            postId: post.id,
            likesCount: newCount,
            likedByUserIds: updatedLikes,
          });

          return updatedPost;
        }
        return post;
      })
    );

    // Call server
    await api.likePost(postId, user.id);
  };

  const addComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;

    const newComment: PostComment = {
      id: 'comment_' + Date.now(),
      postId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      content: content.trim(),
      createdAt: Date.now(),
      likesCount: 0,
      likedByUserIds: [],
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updated = {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...(post.comments || []), newComment],
          };

          offlineStorage.broadcastEvent('new_comment', {
            postId,
            comment: newComment,
          });

          if (post.authorId !== user.id) {
            notificationService.notify({
              type: 'comment',
              title: `${user.name} commented on your post`,
              body: content.slice(0, 60),
              avatar: user.avatarUrl,
              actionId: post.id,
              playSound: true,
            });
          }

          return updated;
        }
        return post;
      })
    );

    soundEffects.playMessageSent();
    await api.addComment(postId, user.id, content.trim());
  };

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    await api.deletePost(postId);
  };

  const toggleSavePost = async (postId: string) => {
    if (!user) return;
    setSavedPostIds((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
    await api.bookmarkPost(postId, user.id);
  };

  const addStory = async (mediaUrl: string, caption?: string) => {
    if (!user) return;
    const newStory: UserStory = {
      id: 'story_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      mediaUrl,
      caption,
      createdAt: Date.now(),
      seenByUserIds: [user.id],
    };

    setStories((prev) => [newStory, ...prev]);
    offlineStorage.broadcastEvent('new_story', newStory);

    await api.createStory(user.id, mediaUrl, caption);

    notificationService.notify({
      type: 'system',
      title: 'Story Added',
      body: 'Your 24-hour visual story is now saved to the server database!',
      avatar: user.avatarUrl,
      playSound: false,
    });
  };

  const markStorySeen = async (storyId: string) => {
    if (!user) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId && !s.seenByUserIds.includes(user.id)) {
          return { ...s, seenByUserIds: [...s.seenByUserIds, user.id] };
        }
        return s;
      })
    );
    await api.markStorySeen(storyId, user.id);
  };

  const getPostById = (postId: string) => {
    return posts.find((p) => p.id === postId);
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        stories,
        savedPostIds,
        createPost,
        likePost,
        addComment,
        deletePost,
        toggleSavePost,
        addStory,
        markStorySeen,
        getPostById,
        refreshFeed,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
