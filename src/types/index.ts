/**
 * 'admin' = uygulamanın sahibi/yöneticisi (sen). Uygulama kimsenin değil,
 * yalnızca admin'in kontrolündedir. Admin, kullanıcılara "unvan" (ör.
 * Muhtar, İmam, Köy Azası) verir/geri alır — unvan bir rol değil, admin'in
 * atadığı bir etikettir.
 */
export type Role = 'admin' | 'kullanici';

export interface User {
  id: string;
  adSoyad: string;
  telefon: string;
  sifre: string;
  role: Role;
  /** Yalnızca admin tarafından atanır/kaldırılır. Boşsa sade köylüdür. */
  unvan?: string;
  pushToken?: string;
}

export const MUHTAR_UNVANI = 'Muhtar';

export type PostType = 'duyuru' | 'etkinlik';

export interface Post {
  id: string;
  type: PostType;
  baslik: string;
  icerik: string;
  /** Etkinlik gönderileri için: davetin/olayın tarihi (serbest metin, ör. "12 Ekim Cumartesi") */
  etkinlikTarihi?: string;
  konum?: string;
  yazanId: string;
  yazanAdSoyad: string;
  begenenler: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  yazanId: string;
  yazanAdSoyad: string;
  icerik: string;
  createdAt: string;
}
