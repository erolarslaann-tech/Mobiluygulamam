import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
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
import { usePosts } from '@/context/PostsContext';

function formatTarih(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { posts, commentsForPost, toggleLike, addComment } = usePosts();
  const [yeniYorum, setYeniYorum] = useState('');

  const post = posts.find((p) => p.id === id);
  const yorumlar = commentsForPost(id ?? '');

  if (!post || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.bulunamadi}>Paylaşım bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const begeniyorMu = post.begenenler.includes(user.id);

  const yorumGonder = async () => {
    if (!yeniYorum.trim()) return;
    await addComment(post.id, user.id, user.adSoyad, yeniYorum.trim());
    setYeniYorum('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <FlatList
          data={yorumlar}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <View
                style={[
                  styles.pill,
                  post.type === 'duyuru' ? styles.pillDuyuru : styles.pillEtkinlik,
                ]}>
                <Text style={styles.pillText}>
                  {post.type === 'duyuru' ? 'DUYURU' : (post.davetTuru ?? 'DAVETİYE').toLocaleUpperCase('tr-TR')}
                </Text>
              </View>

              <Text style={styles.baslik}>{post.baslik}</Text>
              <Text style={styles.meta}>
                {post.yazanAdSoyad} · {formatTarih(post.createdAt)}
              </Text>

              {post.type === 'etkinlik' && (post.etkinlikTarihi || post.konum) ? (
                <View style={styles.etkinlikKutu}>
                  {post.etkinlikTarihi ? (
                    <Text style={styles.etkinlikText}>📅 {formatTarih(post.etkinlikTarihi)}</Text>
                  ) : null}
                  {post.konum ? <Text style={styles.etkinlikText}>📍 {post.konum}</Text> : null}
                  {post.detaylar && Object.keys(post.detaylar).length > 0
                    ? Object.entries(post.detaylar).map(([etiket, deger]) => (
                        <Text key={etiket} style={styles.detaySatiri}>
                          <Text style={styles.detayEtiket}>{etiket}: </Text>
                          {deger}
                        </Text>
                      ))
                    : null}
                </View>
              ) : null}

              <Text style={styles.icerik}>{post.icerik}</Text>

              <Pressable
                style={styles.begenButon}
                onPress={() => toggleLike(post.id, user.id)}>
                <Text style={styles.begenText}>
                  {begeniyorMu ? '❤️' : '🤍'} {post.begenenler.length} Beğeni
                </Text>
              </Pressable>

              <Text style={styles.yorumBaslik}>Yorumlar ({yorumlar.length})</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.yorumSatir}>
              <Text style={styles.yorumYazan}>{item.yazanAdSoyad}</Text>
              <Text style={styles.yorumIcerik}>{item.icerik}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.yorumYok}>Henüz yorum yok. İlk yorumu sen yaz.</Text>
          }
        />

        <View style={styles.yorumForm}>
          <TextInput
            value={yeniYorum}
            onChangeText={setYeniYorum}
            placeholder="Yorum yaz..."
            style={styles.yorumInput}
            multiline
          />
          <Pressable style={styles.gonderButon} onPress={yorumGonder}>
            <Text style={styles.gonderText}>Gönder</Text>
          </Pressable>
        </View>
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
  list: {
    padding: Spacing.md,
  },
  bulunamadi: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    color: Colors.textMuted,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  pillDuyuru: { backgroundColor: '#F0E2CE' },
  pillEtkinlik: { backgroundColor: '#DEEADF' },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  baslik: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  etkinlikKutu: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  etkinlikText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  detaySatiri: {
    color: Colors.text,
    fontSize: 14,
  },
  detayEtiket: {
    fontWeight: '700',
  },
  icerik: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  begenButon: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  begenText: {
    fontWeight: '600',
    color: Colors.text,
  },
  yorumBaslik: {
    fontWeight: '700',
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  yorumSatir: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yorumYazan: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.primaryDark,
  },
  yorumIcerik: {
    color: Colors.text,
    marginTop: 2,
  },
  yorumYok: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  yorumForm: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  yorumInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  gonderButon: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  gonderText: {
    color: '#fff',
    fontWeight: '700',
  },
});
