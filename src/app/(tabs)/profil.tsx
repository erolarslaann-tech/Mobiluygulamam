import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleBadge } from '@/components/RoleBadge';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfilScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const cikisYap = () => {
    Alert.alert('Çıkış yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.adSoyad.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.adSoyad}>{user.adSoyad}</Text>
        <RoleBadge role={user.role} unvan={user.unvan} />
        <Text style={styles.detay}>
          Yaş: {user.yas}
          {user.babaAdi ? `  ·  Baba Adı: ${user.babaAdi}` : ''}
        </Text>

        {user.role === 'admin' ? (
          <View style={styles.bilgiKutu}>
            <Text style={styles.bilgiText}>
              Uygulamanın sahibisiniz. "Yönetim" sekmesinden köylülere Muhtar
              gibi unvanlar verip geri alabilirsiniz. Unvan verdiğiniz kişi
              "Duyurular" sekmesinden köy geneline resmi duyuru paylaşabilir.
            </Text>
          </View>
        ) : user.unvan ? (
          <View style={styles.bilgiKutu}>
            <Text style={styles.bilgiText}>
              Uygulama sahibi tarafından size "{user.unvan}" unvanı verildi.
              "Duyurular" sekmesinden köy geneline resmi duyuru
              paylaşabilirsiniz. Paylaştığınızda köylülere bildirim gider.
            </Text>
          </View>
        ) : (
          <View style={styles.bilgiKutu}>
            <Text style={styles.bilgiText}>
              "Davetiyeler" sekmesinden düğün, mevlit, cenaze gibi önemli
              günleri ve davetleri köy halkıyla paylaşabilirsiniz.
            </Text>
          </View>
        )}

        <Pressable style={styles.cikisButon} onPress={cikisYap}>
          <Text style={styles.cikisText}>Çıkış Yap</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  adSoyad: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  detay: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  bilgiKutu: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  bilgiText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  cikisButon: {
    marginTop: 'auto',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  cikisText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
});
