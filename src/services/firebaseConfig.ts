import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth } from '@firebase/auth';
// @firebase/auth'un genel (.d.ts) tip tanımı RN'e özel derlemeyi
// içermiyor (paketin "types" koşulu ortam koşullarından önce geliyor),
// bu yüzden bu satırda tip hatası bekleniyor — Metro çalışma zamanında
// doğru RN derlemesini (getReactNativePersistence dahil) yine de bulur.
// @ts-expect-error — bkz. yukarıdaki not
import { getReactNativePersistence } from '@firebase/auth';

/**
 * Firebase Console (console.firebase.google.com) > Proje Ayarları > Genel >
 * "Your apps" bölümünden "Web app" olarak kaydettiğinde sana bu bilgileri
 * verir. Ücretsiz (Spark) plan yeterlidir, kredi kartı gerekmez.
 *
 * Bu değerler gizli değildir (istemci tarafında herkese açık olarak çalışır);
 * gerçek güvenlik Firestore Security Rules ile sağlanır (bkz. firestore.rules).
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCR8DrKiTbs2ow--uhLnvO-Ytw33E2eS-A',
  authDomain: 'ortaci.firebaseapp.com',
  projectId: 'ortaci',
  storageBucket: 'ortaci.firebasestorage.app',
  messagingSenderId: '577580358060',
  appId: '1:577580358060:web:527710a70df21091318209',
};

export const firebaseYapilandirildiMi = firebaseConfig.apiKey !== 'BURAYA_YAPISTIR';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function authOlustur() {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Fast Refresh sırasında initializeAuth ikinci kez çağrılırsa hata verir.
    return getAuth(app);
  }
}

export const auth = authOlustur();
export const db = getFirestore(app);
