import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { firebaseYapilandirildiMi } from '@/services/firebaseConfig';

export default function Index() {
  const { user, loading, baglantiHatasi } = useAuth();

  if (!firebaseYapilandirildiMi) {
    return (
      <View style={styles.container}>
        <Text style={styles.hataBaslik}>Firebase henüz bağlanmadı</Text>
        <Text style={styles.hataMetin}>
          Uygulamanın çalışması için `src/services/firebaseConfig.ts`
          dosyasındaki "BURAYA_YAPISTIR" değerlerinin Firebase Console'dan
          alınan gerçek proje bilgileriyle değiştirilmesi gerekiyor.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.primary} size="large" />
        {baglantiHatasi ? (
          <Text style={styles.hataMetin}>
            Bağlantı sorunu: {baglantiHatasi}
          </Text>
        ) : null}
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  hataBaslik: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.danger,
    textAlign: 'center',
  },
  hataMetin: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
