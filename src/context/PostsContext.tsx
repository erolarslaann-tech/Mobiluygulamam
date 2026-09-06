import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { bildirimGoster } from '@/services/notifications';
import { commentsStore, postsStore } from '@/services/storage';
import type { Comment, Post, PostType } from '@/types';

interface YeniPostGirdisi {
  type: PostType;
  baslik: string;
  icerik: string;
  etkinlikTarihi?: string;
  konum?: string;
  yazanId: string;
  yazanAdSoyad: string;
}

interface PostsContextValue {
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  addPost: (girdi: YeniPostGirdisi) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, userId: string, adSoyad: string, icerik: string) => Promise<void>;
  commentsForPost: (postId: string) => Comment[];
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

export function PostsProvider({ children }: PropsWithChildren) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([postsStore.getAll(), commentsStore.getAll()]);
      setPosts(p);
      setComments(c);
      setLoading(false);
    })();
  }, []);

  const addPost: PostsContextValue['addPost'] = async (girdi) => {
    const yeni: Post = {
      id: `post-${Date.now()}`,
      begenenler: [],
      createdAt: new Date().toISOString(),
      ...girdi,
    };
    const updated = [yeni, ...posts];
    setPosts(updated);
    await postsStore.saveAll(updated);

    if (yeni.type === 'duyuru') {
      bildirimGoster('Yeni Muhtar Duyurusu', yeni.baslik);
    }
  };

  const toggleLike: PostsContextValue['toggleLike'] = async (postId, userId) => {
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const begeniyorMu = p.begenenler.includes(userId);
      return {
        ...p,
        begenenler: begeniyorMu
          ? p.begenenler.filter((id) => id !== userId)
          : [...p.begenenler, userId],
      };
    });
    setPosts(updated);
    await postsStore.saveAll(updated);
  };

  const addComment: PostsContextValue['addComment'] = async (postId, userId, adSoyad, icerik) => {
    const yeni: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      yazanId: userId,
      yazanAdSoyad: adSoyad,
      icerik,
      createdAt: new Date().toISOString(),
    };
    const updated = [...comments, yeni];
    setComments(updated);
    await commentsStore.saveAll(updated);
  };

  const commentsForPost: PostsContextValue['commentsForPost'] = (postId) =>
    comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const value = useMemo(
    () => ({ posts, comments, loading, addPost, toggleLike, addComment, commentsForPost }),
    [posts, comments, loading]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts, PostsProvider içinde kullanılmalı');
  return ctx;
}
