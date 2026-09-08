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
  /** Firebase Storage'daki profil fotoğrafının indirme adresi. */
  profilFoto?: string;
  pushToken?: string;
}

export const MUHTAR_UNVANI = 'Muhtar';

export type PostType = 'duyuru' | 'etkinlik';

export const DAVET_TURLERI = [
  'Düğün',
  'Nişan',
  'Sünnet Düğünü',
  'Mevlüd',
  'İftar Yemeği',
  'Toplantı',
  'Cenaze',
  'Diğer',
] as const;

export type DavetTuru = (typeof DAVET_TURLERI)[number];

/**
 * Her davet türü için sorulacak, serbest bırakılabilir (opsiyonel) ek
 * bilgi alanları. Kullanıcı doldurmak istemezse boş bırakabilir — ör.
 * anne/baba ile ilişkisi olmayan biri o alanı boş geçebilmeli.
 */
export const DAVET_TURU_ALANLARI: Record<DavetTuru, string[]> = {
  Düğün: ['Gelin Adı', 'Gelinin Annesi', 'Gelinin Babası', 'Damat Adı', 'Damadın Babası'],
  Nişan: ['Kızın Adı', 'Erkeğin Adı'],
  'Sünnet Düğünü': ['Çocuğun Adı', "Babasının Adı"],
  Mevlüd: ['Kimin İçin Okunuyor'],
  'İftar Yemeği': ['Yemeği Veren Aile'],
  Toplantı: ['Toplantı Konusu'],
  Cenaze: ['Vefat Eden'],
  Diğer: [],
};

/** Cenaze namazı için köydeki camiler — konum serbest metin değil, bu listeden seçilir. */
export const CENAZE_NAMAZI_CAMILERI = [
  'Kışla Köyü Merkez Camii',
  'Burunören Mah. Camii',
  'Halı Mah. Camii',
  'Dal Mah. Camii',
] as const;

export interface Post {
  id: string;
  type: PostType;
  /** Yalnızca type 'etkinlik' (Davetiye) olduğunda dolu. */
  davetTuru?: DavetTuru;
  baslik: string;
  icerik: string;
  /** Etkinlik/davet tarihi, ISO string (tarih+saat seçiciden gelir). */
  etkinlikTarihi?: string;
  /** Cenaze dışındaki türler için serbest metin konum. */
  konum?: string;
  /** Davet türüne özel ek bilgiler (ör. Düğün: Gelin Adı, Damat Adı...). */
  detaylar?: Record<string, string>;
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
