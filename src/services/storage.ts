import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Comment, Post, User } from '@/types';

/**
 * Bu dosya, gerçek bir sunucu kurulana kadar uygulamayı cihaz üzerinde
 * çalışır durumda tutan yerel bir "sahte backend"dir. Veriler yalnızca
 * bu cihazda saklanır ve köylüler arasında senkronize OLMAZ. Muhtarın
 * duyurularının tüm köye ulaşması için ileride gerçek bir sunucuya
 * (ör. Firebase veya küçük bir Node.js API) taşınması gerekir.
 */

const KEYS = {
  users: '@koyum/users',
  posts: '@koyum/posts',
  comments: '@koyum/comments',
  session: '@koyum/session',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): Promise<void> {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

export const usersStore = {
  getAll: () => readJson<User[]>(KEYS.users, []),
  saveAll: (users: User[]) => writeJson(KEYS.users, users),
};

export const postsStore = {
  getAll: () => readJson<Post[]>(KEYS.posts, []),
  saveAll: (posts: Post[]) => writeJson(KEYS.posts, posts),
};

export const commentsStore = {
  getAll: () => readJson<Comment[]>(KEYS.comments, []),
  saveAll: (comments: Comment[]) => writeJson(KEYS.comments, comments),
};

export const sessionStore = {
  getUserId: () => AsyncStorage.getItem(KEYS.session),
  setUserId: (id: string) => AsyncStorage.setItem(KEYS.session, id),
  clear: () => AsyncStorage.removeItem(KEYS.session),
};

const SEED_MUHTAR_ID = 'seed-muhtar';

export async function ensureSeedData() {
  const users = await usersStore.getAll();
  if (users.length > 0) return;

  const now = new Date().toISOString();

  const seedUsers: User[] = [
    {
      id: SEED_MUHTAR_ID,
      adSoyad: 'Muhtar Ahmet Yılmaz',
      telefon: '5550000000',
      sifre: 'muhtar123',
      role: 'muhtar',
    },
    {
      id: 'seed-koylu-1',
      adSoyad: 'Ayşe Demir',
      telefon: '5551111111',
      sifre: '123456',
      role: 'koylu',
    },
  ];

  const seedPosts: Post[] = [
    {
      id: 'seed-post-1',
      type: 'duyuru',
      baslik: 'İçme suyu bakım çalışması',
      icerik:
        'Yarın 09:00-13:00 arası köy geneli içme suyu bakım çalışması nedeniyle su kesintisi olacaktır. Anlayışınız için teşekkür ederiz.',
      yazanId: SEED_MUHTAR_ID,
      yazanAdSoyad: 'Muhtar Ahmet Yılmaz',
      begenenler: [],
      createdAt: now,
    },
    {
      id: 'seed-post-2',
      type: 'etkinlik',
      baslik: 'Mehmet ile Fatma\'nın Düğünü',
      icerik: 'Tüm köy halkımız davetlidir. Köy düğün salonunda buluşuyoruz.',
      etkinlikTarihi: '20 Eylül Pazar, 19:00',
      konum: 'Köy Düğün Salonu',
      yazanId: 'seed-koylu-1',
      yazanAdSoyad: 'Ayşe Demir',
      begenenler: [],
      createdAt: now,
    },
  ];

  await usersStore.saveAll(seedUsers);
  await postsStore.saveAll(seedPosts);
  await commentsStore.saveAll([]);
}
