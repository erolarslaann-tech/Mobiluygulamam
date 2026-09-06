import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleBadge } from '@/components/RoleBadge';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MUHTAR_UNVANI, type User } from '@/types';

const ONERILEN_UNVANLAR = [MUHTAR_UNVANI, 'İmam', 'Köy Azası', 'Bekçi'];

function KullaniciSatiri({
  kullanici,
  onUnvanKaydet,
}: {
  kullanici: User;
  onUnvanKaydet: (userId: string, unvan: string) => void;
}) {
  const [taslak, setTaslak] = useState(kullanici.unvan ?? '');

  return (
    <View style={styles.satir}>
      <View style={styles.satirUst}>
        <View style={styles.flex1}>
          <Text style={styles.adSoyad}>{kullanici.adSoyad}</Text>
          <Text style={styles.detay}>
            Yaş: {kullanici.yas}
            {kullanici.babaAdi ? `  ·  Baba Adı: ${kullanici.babaAdi}` : ''}
          </Text>
        </View>
        <RoleBadge role={kullanici.role} unvan={kullanici.unvan} />
      </View>

      <View style={styles.onerilerSatir}>
        {ONERILEN_UNVANLAR.map((onerilen) => (
          <Pressable
            key={onerilen}
            style={[styles.oneriChip, taslak === onerilen && styles.oneriChipSecili]}
            onPress={() => setTaslak(onerilen)}>
            <Text
              style={[styles.oneriChipText, taslak === onerilen && styles.oneriChipTextSecili]}>
              {onerilen}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.formSatir}>
        <TextInput
          value={taslak}
          onChangeText={setTaslak}
          placeholder="Unvan (boş = sade köylü)"
          style={styles.input}
        />
        <Pressable style={styles.kaydetButon} onPress={() => onUnvanKaydet(kullanici.id, taslak)}>
          <Text style={styles.kaydetText}>Kaydet</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function YonetimScreen() {
  const { user, users, setUnvan } = useAuth();

  if (!user || user.role !== 'admin') {
    return null;
  }

  const digerKullanicilar = users
    .filter((u) => u.role !== 'admin')
    .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, 'tr'));

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={digerKullanicilar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.aciklama}>
            Kullanıcılara unvan verin ya da geri alın. Yalnızca "Muhtar" unvanı
            olan kişi "Duyurular" sekmesinden resmi duyuru paylaşabilir; diğer
            unvanlar sadece profilde görünen bir etikettir.
          </Text>
        }
        renderItem={({ item }) => (
          <KullaniciSatiri kullanici={item} onUnvanKaydet={setUnvan} />
        )}
        ListEmptyComponent={
          <Text style={styles.bosText}>Henüz kayıtlı köylü yok.</Text>
        }
      />
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
    gap: Spacing.sm,
  },
  aciklama: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  bosText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  satir: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  satirUst: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  adSoyad: {
    fontWeight: '700',
    fontSize: 15,
    color: Colors.text,
  },
  detay: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  onerilerSatir: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  oneriChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  oneriChipSecili: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  oneriChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  oneriChipTextSecili: {
    color: '#fff',
    fontWeight: '600',
  },
  formSatir: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  kaydetButon: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  kaydetText: {
    color: '#fff',
    fontWeight: '700',
  },
});
