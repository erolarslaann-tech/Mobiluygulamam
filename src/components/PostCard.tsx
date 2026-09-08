import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Post } from '@/types';

function formatTarih(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export function PostCard({ post, yorumSayisi }: { post: Post; yorumSayisi: number }) {
  return (
    <Link href={{ pathname: '/post/[id]', params: { id: post.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.pill, post.type === 'duyuru' ? styles.pillDuyuru : styles.pillEtkinlik]}>
            <Text style={styles.pillText}>
              {post.type === 'duyuru' ? 'DUYURU' : (post.davetTuru ?? 'DAVETİYE').toLocaleUpperCase('tr-TR')}
            </Text>
          </View>
          <Text style={styles.tarih}>{formatTarih(post.createdAt)}</Text>
        </View>

        <Text style={styles.baslik}>{post.baslik}</Text>
        <Text style={styles.icerik} numberOfLines={3}>
          {post.icerik}
        </Text>

        {post.type === 'etkinlik' && post.etkinlikTarihi ? (
          <Text style={styles.meta}>
            📅 {formatTarih(post.etkinlikTarihi)}
            {post.konum ? `  ·  📍 ${post.konum}` : ''}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.yazan}>{post.yazanAdSoyad}</Text>
          <Text style={styles.altBilgi}>
            ❤️ {post.begenenler.length}   💬 {yorumSayisi}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pillDuyuru: {
    backgroundColor: '#F0E2CE',
  },
  pillEtkinlik: {
    backgroundColor: '#DEEADF',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  tarih: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  baslik: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  icerik: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  yazan: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  altBilgi: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
