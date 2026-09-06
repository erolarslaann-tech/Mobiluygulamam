import { MUHTAR_UNVANI, type User } from '@/types';

/**
 * Resmi duyuru paylaşma yetkisi: uygulama sahibi (admin) her zaman, veya
 * admin tarafından "Muhtar" unvanı verilmiş kullanıcı. Diğer unvanlar
 * (İmam, Köy Azası vb.) yalnızca görünür bir etikettir, duyuru yetkisi
 * vermez.
 */
export function canPostDuyuru(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.unvan === MUHTAR_UNVANI;
}
