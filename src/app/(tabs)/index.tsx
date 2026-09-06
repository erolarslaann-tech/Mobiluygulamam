import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import { canPostDuyuru } from '@/utils/yetki';

export default function DuyurularScreen() {
  const { user } = useAuth();
  const { posts, commentsForPost, loading } = usePosts();

  const duyurular = posts
    .filter((p) => p.type === 'duyuru')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={duyurular}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PostCard post={item} yorumSayisi={commentsForPost(item.id).length} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.bosDurum}>
              <Text style={styles.bosText}>Henüz duyuru yok.</Text>
            </View>
          ) : null
        }
      />

      {canPostDuyuru(user) ? (
        <Pressable
          style={styles.fab}
          onPress={() => router.push({ pathname: '/post/new', params: { type: 'duyuru' } })}>
          <Text style={styles.fabText}>+ Duyuru Ekle</Text>
        </Pressable>
      ) : null}
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
  },
  bosText: {
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: Colors.accent,
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
  },
});
