import { router } from 'expo-router';
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const kayitOl = async () => {
    setHata(null);
    if (!adSoyad.trim()) {
      setHata('Ad soyad girin.');
      return;
    }
    setGonderiliyor(true);
    const sonuc = await register(adSoyad, telefon, sifre);
    setGonderiliyor(false);
    if (!sonuc.ok) {
      setHata(sonuc.hata ?? 'Kayıt olunamadı.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.aciklama}>
            Köyümüze hoş geldiniz. Kayıt olduktan sonra köylü olarak duyuruları
            görebilir, etkinlik/davet paylaşabilir ve yorum yapabilirsiniz.
          </Text>

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            value={adSoyad}
            onChangeText={setAdSoyad}
            placeholder="Adınız Soyadınız"
            style={styles.input}
          />

          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput
            value={telefon}
            onChangeText={setTelefon}
            placeholder="05xx xxx xx xx"
            keyboardType="phone-pad"
            style={styles.input}
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
    gap: Spacing.sm,
  },
  aciklama: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
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
    marginTop: Spacing.md,
  },
  butonDisabled: {
    opacity: 0.6,
  },
  butonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
