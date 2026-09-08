import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { profilFotografiYukle } from '@/services/storageRepo';

function adSoyadAyir(adSoyad: string) {
  const parcalar = adSoyad.trim().split(/\s+/);
  return { ad: parcalar[0] ?? '', soyad: parcalar.slice(1).join(' ') };
}

export default function ProfilDuzenleScreen() {
  const { user, profilGuncelle } = useAuth();
  const ilkDeger = user ? adSoyadAyir(user.adSoyad) : { ad: '', soyad: '' };

  const [ad, setAd] = useState(ilkDeger.ad);
  const [soyad, setSoyad] = useState(ilkDeger.soyad);
  const [yas, setYas] = useState(String(user?.yas ?? ''));
  const [babaAdi, setBabaAdi] = useState(user?.babaAdi ?? '');
  const [fotoUri, setFotoUri] = useState<string | null>(user?.profilFoto ?? null);
  const [fotoYuklendiMi, setFotoYuklendiMi] = useState(false);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  if (!user) return null;

  const fotoSec = async () => {
    setHata(null);
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      setHata('Fotoğraf seçmek için galeri izni gerekiyor.');
      return;
    }
    const sonuc = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (sonuc.canceled || !sonuc.assets[0]) return;
    setFotoUri(sonuc.assets[0].uri);
    setFotoYuklendiMi(false);
  };

  const kaydet = async () => {
    setHata(null);
    if (!ad.trim() || !soyad.trim()) {
      setHata('Ad ve soyisim girin.');
      return;
    }
    const yasSayi = Number(yas);
    if (!Number.isFinite(yasSayi) || yasSayi < 1 || yasSayi > 120) {
      setHata('Geçerli bir yaş girin.');
      return;
    }

    setKaydediliyor(true);
    try {
      let yuklenenFotoUrl = user.profilFoto;
      if (fotoUri && fotoUri !== user.profilFoto && !fotoYuklendiMi) {
        setFotoYukleniyor(true);
        yuklenenFotoUrl = await profilFotografiYukle(user.id, fotoUri);
        setFotoYuklendiMi(true);
        setFotoYukleniyor(false);
      }
      await profilGuncelle({
        adSoyad: `${ad.trim()} ${soyad.trim()}`,
        yas: yasSayi,
        babaAdi: babaAdi.trim() || undefined,
        profilFoto: yuklenenFotoUrl,
      });
      router.back();
    } catch (e: any) {
      setHata(e?.message ?? 'Kaydedilirken bir hata oluştu.');
    } finally {
      setKaydediliyor(false);
      setFotoYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.avatarAlani} onPress={fotoSec}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarYer}>
                <Text style={styles.avatarYerText}>{ad.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            <Text style={styles.fotoDegistirText}>Fotoğrafı Değiştir</Text>
          </Pressable>

          <Text style={styles.label}>Adınız</Text>
          <TextInput value={ad} onChangeText={setAd} style={styles.input} autoCapitalize="words" />

          <Text style={styles.label}>Soyadınız</Text>
          <TextInput
            value={soyad}
            onChangeText={setSoyad}
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Yaşınız</Text>
          <TextInput
            value={yas}
            onChangeText={setYas}
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Baba Adı (opsiyonel)</Text>
          <TextInput
            value={babaAdi}
            onChangeText={setBabaAdi}
            style={styles.input}
            autoCapitalize="words"
          />

          {hata ? <Text style={styles.hataText}>{hata}</Text> : null}

          <Pressable
            style={[styles.buton, kaydediliyor && styles.butonDisabled]}
            onPress={kaydet}
            disabled={kaydediliyor}>
            {fotoYukleniyor ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.butonText}>{kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  avatarAlani: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarYer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarYerText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  fotoDegistirText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
    marginTop: Spacing.sm,
  },
  buton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.lg,
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
