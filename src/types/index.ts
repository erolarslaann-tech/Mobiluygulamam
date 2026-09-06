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
  yas: number;
  /** Aynı ad soyada sahip başka biri varsa ayırt etmek için. */
  babaAdi?: string;
  sifre: string;
  role: Role;
  /** Yalnızca admin tarafından atanır/kaldırılır. Boşsa sade köylüdür. */
  unvan?: string;
  /**
   * false = admin onayı bekliyor, giriş yapamaz. Kayıt olan herkes false
   * ile başlar; admin "Yönetim" ekranından onaylar. undefined/true = onaylı
   * (seed hesaplar direkt onaylı gelir). Aynı ad soyadla ikinci bir hesap
   * açılmaya çalışıldığında admin bunu görüp gerçek mi taklit mi ayırt eder.
   */
  onayli?: boolean;
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
