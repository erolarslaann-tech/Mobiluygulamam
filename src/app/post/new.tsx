import { router, useLocalSearchParams } from 'expo-router';
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
import { usePosts } from '@/context/PostsContext';
import type { PostType } from '@/types';
import { canPostDuyuru } from '@/utils/yetki';

export default function YeniPaylasimScreen() {
  const { type } = useLocalSearchParams<{ type?: PostType }>();
  const postType: PostType = type === 'duyuru' ? 'duyuru' : 'etkinlik';

  const { user } = useAuth();
  const { addPost } = usePosts();

  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [etkinlikTarihi, setEtkinlikTarihi] = useState('');
  const [konum, setKonum] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  if (!user) return null;

  if (postType === 'duyuru' && !canPostDuyuru(user)) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.yetkiYok}>
          Duyuru paylaşmak için uygulama sahibinin size "Muhtar" unvanı
          vermesi gerekir.
        </Text>
      </SafeAreaView>
    );
  }

  const paylas = async () => {
    setHata(null);
    if (!baslik.trim() || !icerik.trim()) {
      setHata('Başlık ve içerik zorunludur.');
      return;
    }
    setGonderiliyor(true);
    await addPost({
      type: postType,
      baslik: baslik.trim(),
      icerik: icerik.trim(),
      etkinlikTarihi: postType === 'etkinlik' ? etkinlikTarihi.trim() || undefined : undefined,
      konum: postType === 'etkinlik' ? konum.trim() || undefined : undefined,
      yazanId: user.id,
      yazanAdSoyad: user.adSoyad,
    });
    setGonderiliyor(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.baslikMetni}>
            {postType === 'duyuru' ? 'Yeni Duyuru' : 'Yeni Davetiye'}
          </Text>

          <Text style={styles.label}>Başlık</Text>
          <TextInput
            value={baslik}
            onChangeText={setBaslik}
            placeholder={postType === 'duyuru' ? 'Örn: Su kesintisi' : 'Örn: Ali ile Zeynep\'in Düğünü'}
            style={styles.input}
          />

          {postType === 'etkinlik' ? (
            <>
              <Text style={styles.label}>Tarih / Saat</Text>
              <TextInput
                value={etkinlikTarihi}
                onChangeText={setEtkinlikTarihi}
                placeholder="Örn: 20 Eylül Pazar, 19:00"
                style={styles.input}
              />

              <Text style={styles.label}>Konum</Text>
              <TextInput
                value={konum}
                onChangeText={setKonum}
                placeholder="Örn: Köy Düğün Salonu"
                style={styles.input}
              />
            </>
          ) : null}

          <Text style={styles.label}>İçerik</Text>
          <TextInput
            value={icerik}
            onChangeText={setIcerik}
            placeholder="Detayları yazın..."
            style={[styles.input, styles.textArea]}
            multiline
          />

          {hata ? <Text style={styles.hataText}>{hata}</Text> : null}

          <Pressable
            style={[styles.buton, gonderiliyor && styles.butonDisabled]}
            onPress={paylas}
            disabled={gonderiliyor}>
            <Text style={styles.butonText}>{gonderiliyor ? 'Paylaşılıyor...' : 'Paylaş'}</Text>
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
  yetkiYok: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    color: Colors.textMuted,
  },
  baslikMetni: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hataText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  buton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
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
