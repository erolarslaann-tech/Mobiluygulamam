import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Role } from '@/types';

export function RoleBadge({ role }: { role: Role }) {
  const isMuhtar = role === 'muhtar';
  return (
    <View style={[styles.badge, isMuhtar ? styles.muhtar : styles.koylu]}>
      <Text style={[styles.text, isMuhtar ? styles.muhtarText : styles.koyluText]}>
        {isMuhtar ? 'Muhtar' : 'Köylü'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  muhtar: {
    backgroundColor: '#F0E2CE',
  },
  koylu: {
    backgroundColor: '#DEEADF',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  muhtarText: {
    color: Colors.accent,
  },
  koyluText: {
    color: Colors.primary,
  },
});
