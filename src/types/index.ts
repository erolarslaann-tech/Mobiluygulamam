export type Role = 'muhtar' | 'koylu';

export interface User {
  id: string;
  adSoyad: string;
  telefon: string;
  sifre: string;
  role: Role;
  pushToken?: string;
}

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
