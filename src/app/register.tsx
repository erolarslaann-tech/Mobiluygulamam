import { router } from 'expo-router';
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [yas, setYas] = useState('');
  const [babaAdi, setBabaAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [kayitTamam, setKayitTamam] = useState(false);

  const kayitOl = async () => {
    setHata(null);
    setGonderiliyor(true);
    const sonuc = await register(ad, soyad, Number(yas), babaAdi, sifre);
    setGonderiliyor(false);
    if (!sonuc.ok) {
      setHata(sonuc.hata ?? 'Kayıt olunamadı.');
      return;
    }
    setKayitTamam(true);
  };

  if (kayitTamam) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <View style={styles.container}>
          <Text style={styles.onaySembol}>✓</Text>
          <Text style={styles.onayBaslik}>Kaydınız alındı</Text>
          <Text style={styles.aciklama}>
            Köy yöneticisi kaydınızı onayladıktan sonra Ad, Soyad ve
            şifrenizle giriş yapabilirsiniz. Aynı isimde başka biri varsa
            karışıklık olmasın diye yönetici gerekirse sizinle iletişime
            geçebilir.
          </Text>
          <Pressable style={styles.buton} onPress={() => router.replace('/login')}>
            <Text style={styles.butonText}>Girişe Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.aciklama}>
            Köyümüze hoş geldiniz. Kayıt olduktan sonra duyuruları görebilir,
            davetiye/duyuru paylaşabilir ve yorum yapabilirsiniz.
          </Text>

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

          <Text style={styles.label}>Yaşınız</Text>
          <TextInput
            value={yas}
            onChangeText={setYas}
            placeholder="Ör: 45"
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Baba Adı (opsiyonel)</Text>
          <TextInput
            value={babaAdi}
            onChangeText={setBabaAdi}
            placeholder="Köyünüzde aynı isimde biri varsa yazın"
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={sifre}
            onChangeText={setSifre}
            placeholder="En az 4 karakter"
            secureTextEntry
            style={styles.input}
          />

          {hata ? <Text style={styles.hataText}>{hata}</Text> : null}

          <Pressable
            style={[styles.buton, gonderiliyor && styles.butonDisabled]}
            onPress={kayitOl}
            disabled={gonderiliyor}>
            <Text style={styles.butonText}>{gonderiliyor ? 'Kaydediliyor...' : 'Kayıt Ol'}</Text>
          </Pressable>
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
    gap: Spacing.sm,
  },
  aciklama: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  onaySembol: {
    fontSize: 56,
    textAlign: 'center',
    color: Colors.primary,
    marginTop: Spacing.xl,
  },
  onayBaslik: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
    marginTop: Spacing.md,
  },
  butonDisabled: {
    opacity: 0.6,
  },
  butonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
