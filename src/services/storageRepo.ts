import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

/**
 * Seçilen profil fotoğrafını Firebase Storage'a yükler ve indirme
 * adresini döndürür. `uri` genelde expo-image-picker'dan gelen yerel
 * dosya yoludur (file://...).
 */
export async function profilFotografiYukle(userId: string, uri: string): Promise<string> {
  const storage = getStorage();
  const yanit = await fetch(uri);
  const blob = await yanit.blob();
  const dosyaRef = ref(storage, `profil-fotograflari/${userId}.jpg`);
  await uploadBytes(dosyaRef, blob);
  return getDownloadURL(dosyaRef);
}
