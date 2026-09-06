import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePosts } from '@/context/PostsContext';

export default function EtkinliklerScreen() {
  const { posts, commentsForPost, loading } = usePosts();

  const etkinlikler = posts
    .filter((p) => p.type === 'etkinlik')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={etkinlikler}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PostCard post={item} yorumSayisi={commentsForPost(item.id).length} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.bosDurum}>
              <Text style={styles.bosText}>
                Henüz paylaşılan bir davetiye yok. İlkini sen ekle!
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push({ pathname: '/post/new', params: { type: 'etkinlik' } })}>
        <Text style={styles.fabText}>+ Davetiye Ekle</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  bosDurum: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  bosText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
