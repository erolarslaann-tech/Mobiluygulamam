import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';

export default function LoginScreen() {
  const { login, girisSecimiYap } = useAuth();
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [adaylar, setAdaylar] = useState<User[] | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const girisYap = async () => {
    setHata(null);
    setAdaylar(null);
    setGonderiliyor(true);
    const sonuc = await login(ad, soyad, sifre);
    setGonderiliyor(false);

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj);
      return;
    }
    if (sonuc.durum === 'coklu-eslesme') {
      setAdaylar(sonuc.adaylar);
      return;
    }
    router.replace('/(tabs)');
  };

  const adaySec = async (userId: string) => {
    await girisSecimiYap(userId);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.baslik}>Ortacı Köyüm</Text>
          <Text style={styles.altBaslik}>Muhtar duyuruları ve köy haberleri tek yerde</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Adınız</Text>
            <TextInput
              value={ad}
              onChangeText={setAd}
              placeholder="Ör: Ahmet"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Soyadınız</Text>
            <TextInput
              value={soyad}
              onChangeText={setSoyad}
              placeholder="Ör: Yılmaz"
              style={styles.input}
              autoCapitalize="words"
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

          {adaylar ? (
            <View style={styles.adaylarKutu}>
              <Text style={styles.adaylarBaslik}>
                Aynı isimde birden fazla kişi var. Sizi seçin:
              </Text>
              {adaylar.map((aday) => (
                <Pressable
                  key={aday.id}
                  style={styles.adaySatir}
                  onPress={() => adaySec(aday.id)}>
                  <Text style={styles.adayAdSoyad}>{aday.adSoyad}</Text>
                  <Text style={styles.adayDetay}>
                    {aday.babaAdi ? `Baba adı: ${aday.babaAdi} · ` : ''}Yaş: {aday.yas}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
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
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  baslik: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  altBaslik: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 14,
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
    paddingVertical: Spacing.md,
    fontSize: 18,
  },
  hataText: {
    color: Colors.danger,
    fontSize: 14,
  },
  buton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  butonDisabled: {
    opacity: 0.6,
  },
  butonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  kayitLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  kayitLinkText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  adaylarKutu: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  adaylarBaslik: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  adaySatir: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  adayAdSoyad: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  adayDetay: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
