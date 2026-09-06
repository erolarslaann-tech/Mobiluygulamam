import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Role } from '@/types';

/**
 * "Rol" sistem içindeki yetki seviyesidir (admin/kullanıcı).
 * "Unvan" admin'in bir kullanıcıya verdiği etikettir (ör. Muhtar).
 * Rozet, admin için her zaman "Yönetici" gösterir; diğerlerinde unvan
 * varsa unvanı, yoksa "Köylü" yazar.
 */
export function RoleBadge({ role, unvan }: { role: Role; unvan?: string }) {
  if (role === 'admin') {
    return (
      <View style={[styles.badge, styles.admin]}>
        <Text style={[styles.text, styles.adminText]}>Yönetici</Text>
      </View>
    );
  }

  const hasUnvan = Boolean(unvan);
  return (
    <View style={[styles.badge, hasUnvan ? styles.unvanli : styles.koylu]}>
      <Text style={[styles.text, hasUnvan ? styles.unvanliText : styles.koyluText]}>
        {hasUnvan ? unvan : 'Köylü'}
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
  admin: {
    backgroundColor: '#E7DEF2',
  },
  unvanli: {
    backgroundColor: '#F0E2CE',
  },
  koylu: {
    backgroundColor: '#DEEADF',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  adminText: {
    color: '#6B3FA0',
  },
  unvanliText: {
    color: Colors.accent,
  },
  koyluText: {
    color: Colors.primary,
  },
});
