import { gonderiEkle, kullaniciEkle, tohumVeriGerekliMi } from './firestoreRepo';
import type { Post, User } from '@/types';

const SEED_ADMIN_ID = 'seed-admin';
const SEED_MUHTAR_ID = 'seed-muhtar';
const SEED_KOYLU_ID = 'seed-koylu-1';

/** Firestore'da hiç kullanıcı yoksa (yeni/boş proje), demo veriyi bir kere ekler. */
export async function tohumVeriEkleGerekirse() {
  const gerekli = await tohumVeriGerekliMi();
  if (!gerekli) return;

  const now = new Date().toISOString();

  const seedUsers: User[] = [
    {
      id: SEED_ADMIN_ID,
      adSoyad: 'Yönetici Hesap',
      yas: 40,
      sifre: 'admin123',
      role: 'admin',
      onayli: true,
    },
    {
      id: SEED_MUHTAR_ID,
      adSoyad: 'Ahmet Yılmaz',
      yas: 52,
      babaAdi: 'Mehmet',
      sifre: 'muhtar123',
      role: 'kullanici',
      unvan: 'Muhtar',
      onayli: true,
    },
    {
      id: SEED_KOYLU_ID,
      adSoyad: 'Ayşe Demir',
      yas: 38,
      babaAdi: 'Hasan',
      sifre: '123456',
      role: 'kullanici',
      onayli: true,
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
      yazanAdSoyad: 'Ahmet Yılmaz',
      begenenler: [],
      createdAt: now,
    },
    {
      id: 'seed-post-2',
      type: 'etkinlik',
      baslik: "Mehmet ile Fatma'nın Düğünü",
      icerik: 'Tüm köy halkımız davetlidir. Köy düğün salonunda buluşuyoruz.',
      etkinlikTarihi: '20 Eylül Pazar, 19:00',
      konum: 'Köy Düğün Salonu',
      yazanId: SEED_KOYLU_ID,
      yazanAdSoyad: 'Ayşe Demir',
      begenenler: [],
      createdAt: now,
    },
  ];

  await Promise.all(seedUsers.map((u) => kullaniciEkle(u)));
  await Promise.all(seedPosts.map((p) => gonderiEkle(p)));
}
