import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AcilisEkrani } from '@/components/AcilisEkrani';
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
      <View style={styles.flex}>
        <AcilisEkrani />
        {baglantiHatasi ? (
          <View style={styles.hataBandi}>
            <Text style={styles.hataBandiText}>Bağlantı sorunu: {baglantiHatasi}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  hataBandi: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Spacing.md,
  },
  hataBandiText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },
});
