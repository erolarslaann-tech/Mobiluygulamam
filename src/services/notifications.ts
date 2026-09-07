import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Expo Go içinde (SDK 53'ten beri) 'expo-notifications' paketini
 * İÇE AKTARMAK bile hata fırlatıyor — sadece belirli API'leri çağırmak
 * değil. Bu yüzden bu paketi normal `import` ile değil, yalnızca Expo
 * Go dışındayken (gerçek bir development/production derlemesinde)
 * çalışan fonksiyonların İÇİNDE `require` ile geç yüklüyoruz. Böylece
 * Expo Go'dayken bu paketin kodu hiç çalıştırılmıyor.
 */
const expoGoIcinde = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Bildirim izni ister ve bu cihaz için bir Expo push token'ı döndürür.
 * NOT: Token'ı gerçek anlamda başka köylülere duyuru göndermek için
 * kullanabilmek üzere bir sunucuda saklamak gerekir; bu MVP'de token
 * yalnızca kullanıcı kaydına ekleniyor, gönderim yapılmıyor.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (expoGoIcinde) return undefined;

  const Device = require('expo-device') as typeof import('expo-device');
  const Notifications = require('expo-notifications') as typeof import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('duyurular', {
      name: 'Muhtar Duyuruları',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  if (!Device.isDevice) {
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return undefined;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return undefined;
  }
}

/**
 * Bir duyuru paylaşıldığında bu cihazda anında bildirim gösterir.
 * Gerçek kullanımda bunun yerine sunucu, kayıtlı tüm köylülerin push
 * token'larına bildirim yollamalıdır.
 */
export async function bildirimGoster(baslik: string, govde: string) {
  if (expoGoIcinde) return;
  try {
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: { title: baslik, body: govde },
      trigger: null,
    });
  } catch {
    // Bildirim gösterilemezse sessizce yut — kritik bir işlev değil.
  }
}
