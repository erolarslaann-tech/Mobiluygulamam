import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';

function gunSelamlamasi() {
  const saat = new Date().getHours();
  if (saat < 6) return 'İyi geceler';
  if (saat < 12) return 'Günaydın';
  if (saat < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function AnaSayfaScreen() {
  const { user, users } = useAuth();
  const { posts, comments } = usePosts();

  if (!user) return null;

  const sonDuyuru = posts
    .filter((p) => p.type === 'duyuru')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const sonDavetiye = posts
    .filter((p) => p.type === 'etkinlik')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const onayBekleyenSayisi = users.filter((u) => u.onayli === false).length;
  const ad = user.adSoyad.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.selamlama}>
          {gunSelamlamasi()}, {ad}!
        </Text>
        <Text style={styles.altBaslik}>Ortacı köyünden son gelişmeler burada.</Text>

        {user.role === 'admin' && onayBekleyenSayisi > 0 ? (
          <Pressable
            style={styles.uyariKart}
            onPress={() => router.push('/(tabs)/yonetim')}>
            <Text style={styles.uyariText}>
              {onayBekleyenSayisi} kişi onayınızı bekliyor → Yönetim'e git
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.bolum}>
          <View style={styles.bolumBaslikSatiri}>
            <Text style={styles.bolumBaslik}>Son Duyuru</Text>
            <Pressable onPress={() => router.push('/(tabs)/duyurular')}>
              <Text style={styles.tumunuGor}>Tümünü gör</Text>
            </Pressable>
          </View>
          {sonDuyuru ? (
            <PostCard
              post={sonDuyuru}
              yorumSayisi={comments.filter((c) => c.postId === sonDuyuru.id).length}
            />
          ) : (
            <Text style={styles.bosText}>Henüz duyuru yok.</Text>
          )}
        </View>

        <View style={styles.bolum}>
          <View style={styles.bolumBaslikSatiri}>
            <Text style={styles.bolumBaslik}>Son Davetiye</Text>
            <Pressable onPress={() => router.push('/(tabs)/etkinlikler')}>
              <Text style={styles.tumunuGor}>Tümünü gör</Text>
            </Pressable>
          </View>
          {sonDavetiye ? (
            <PostCard
              post={sonDavetiye}
              yorumSayisi={comments.filter((c) => c.postId === sonDavetiye.id).length}
            />
          ) : (
            <Text style={styles.bosText}>Henüz davetiye yok.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  selamlama: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  altBaslik: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  uyariKart: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  uyariText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  bolum: {
    marginTop: Spacing.md,
  },
  bolumBaslikSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bolumBaslik: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  tumunuGor: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  bosText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
