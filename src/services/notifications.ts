import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Bildirim izni ister ve bu cihaz için bir Expo push token'ı döndürür.
 * NOT: Token'ı gerçek anlamda başka köylülere duyuru göndermek için
 * kullanabilmek üzere bir sunucuda saklamak gerekir; bu MVP'de token
 * yalnızca kullanıcı kaydına ekleniyor, gönderim yapılmıyor.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
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
  await Notifications.scheduleNotificationAsync({
    content: { title: baslik, body: govde },
    trigger: null,
  });
}
