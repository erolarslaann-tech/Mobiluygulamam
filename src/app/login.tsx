import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [telefon, setTelefon] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const girisYap = async () => {
    setHata(null);
    setGonderiliyor(true);
    const sonuc = await login(telefon, sifre);
    setGonderiliyor(false);
    if (!sonuc.ok) {
      setHata(sonuc.hata ?? 'Giriş yapılamadı.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.baslik}>Köyüm</Text>
          <Text style={styles.altBaslik}>Muhtar duyuruları ve köy haberleri tek yerde</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput
              value={telefon}
              onChangeText={setTelefon}
              placeholder="05xx xxx xx xx"
              keyboardType="phone-pad"
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              value={sifre}
              onChangeText={setSifre}
              placeholder="Şifreniz"
              secureTextEntry
              style={styles.input}
            />

            {hata ? <Text style={styles.hataText}>{hata}</Text> : null}

            <Pressable
              style={[styles.buton, gonderiliyor && styles.butonDisabled]}
              onPress={girisYap}
              disabled={gonderiliyor}>
              <Text style={styles.butonText}>{gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
            </Pressable>

            <Link href="/register" asChild>
              <Pressable style={styles.kayitLink}>
                <Text style={styles.kayitLinkText}>Hesabın yok mu? Kayıt ol</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.demoKutu}>
            <Text style={styles.demoBaslik}>Demo hesaplar</Text>
            <Text style={styles.demoText}>Muhtar: 5550000000 / muhtar123</Text>
            <Text style={styles.demoText}>Köylü: 5551111111 / 123456</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  baslik: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  altBaslik: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  hataText: {
    color: Colors.danger,
    fontSize: 13,
  },
  buton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  butonDisabled: {
    opacity: 0.6,
  },
  butonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  kayitLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  kayitLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  demoKutu: {
    backgroundColor: '#EFEAD9',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: 2,
  },
  demoBaslik: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  demoText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
