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
  apiKey: 'BURAYA_YAPISTIR',
  authDomain: 'BURAYA_YAPISTIR.firebaseapp.com',
  projectId: 'BURAYA_YAPISTIR',
  storageBucket: 'BURAYA_YAPISTIR.appspot.com',
  messagingSenderId: 'BURAYA_YAPISTIR',
  appId: 'BURAYA_YAPISTIR',
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
