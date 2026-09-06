import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useAuth } from '@/context/AuthContext';
import { gonderiEkle, gonderiGuncelle, gonderileriDinle, yorumEkle, yorumlariDinle } from '@/services/firestoreRepo';
import { bildirimGoster } from '@/services/notifications';
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
  // Firestore güvenlik kuralları giriş yapmış (anonim de olsa) istemci
  // ister; AuthContext hazır olana kadar bekliyoruz.
  const { loading: authHazirDegil } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postsYuklendi, setPostsYuklendi] = useState(false);
  const [commentsYuklendi, setCommentsYuklendi] = useState(false);

  useEffect(() => {
    if (authHazirDegil) return;

    const kaldirPosts = gonderileriDinle(
      (p) => {
        setPosts(p);
        setPostsYuklendi(true);
      },
      () => setPostsYuklendi(true)
    );
    const kaldirComments = yorumlariDinle(
      (c) => {
        setComments(c);
        setCommentsYuklendi(true);
      },
      () => setCommentsYuklendi(true)
    );
    return () => {
      kaldirPosts();
      kaldirComments();
    };
  }, [authHazirDegil]);

  const addPost: PostsContextValue['addPost'] = async (girdi) => {
    const yeni: Post = {
      id: `post-${Date.now()}`,
      begenenler: [],
      createdAt: new Date().toISOString(),
      ...girdi,
    };
    await gonderiEkle(yeni);

    if (yeni.type === 'duyuru') {
      bildirimGoster('Yeni Muhtar Duyurusu', yeni.baslik);
    }
  };

  const toggleLike: PostsContextValue['toggleLike'] = async (postId, userId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const begeniyorMu = post.begenenler.includes(userId);
    const yeniBegenenler = begeniyorMu
      ? post.begenenler.filter((id) => id !== userId)
      : [...post.begenenler, userId];
    await gonderiGuncelle(postId, { begenenler: yeniBegenenler });
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
    await yorumEkle(yeni);
  };

  const commentsForPost: PostsContextValue['commentsForPost'] = (postId) =>
    comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const loading = authHazirDegil || !postsYuklendi || !commentsYuklendi;

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
