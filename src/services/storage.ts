import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Gerçek veriler artık Firestore'da (bkz. firestoreRepo.ts) ve tüm
 * köylüler arasında senkronizedir. Bu dosya sadece "bu cihazda en son kim
 * giriş yapmıştı" bilgisini tutan küçük bir yerel önbellektir — uygulama
 * her açıldığında tekrar ad/soyad/şifre girmemek için.
 */
const SESSION_KEY = '@koyum/oturum-kullanici-id';

export const sessionStore = {
  getUserId: () => AsyncStorage.getItem(SESSION_KEY),
  setUserId: (id: string) => AsyncStorage.setItem(SESSION_KEY, id),
  clear: () => AsyncStorage.removeItem(SESSION_KEY),
};
