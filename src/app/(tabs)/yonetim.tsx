import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleBadge } from '@/components/RoleBadge';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MUHTAR_UNVANI, type User } from '@/types';

const ONERILEN_UNVANLAR = [MUHTAR_UNVANI, 'İmam', 'Köy Azası', 'Bekçi'];

function OnayBekleyenSatiri({
  kullanici,
  onOnayla,
  onReddet,
}: {
  kullanici: User;
  onOnayla: (userId: string) => void;
  onReddet: (userId: string) => void;
}) {
  const reddetOnaySor = () => {
    Alert.alert(
      'Kaydı sil',
      `${kullanici.adSoyad} adlı kaydı silmek istediğinize emin misiniz? Bu kişi sahte/taklit görünüyorsa ya da yanlış bilgi girildiyse silin.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => onReddet(kullanici.id) },
      ]
    );
  };

  return (
    <View style={[styles.satir, styles.bekleyenSatir]}>
      <Text style={styles.adSoyad}>{kullanici.adSoyad}</Text>
      <Text style={styles.detay}>
        Yaş: {kullanici.yas}
        {kullanici.babaAdi ? `  ·  Baba Adı: ${kullanici.babaAdi}` : ''}
      </Text>
      <Text style={styles.uyariText}>
        Aynı isimde onaylı başka biri varsa, gerçekten farklı bir kişi mi
        kontrol edin (yaş/baba adına bakın).
      </Text>
      <View style={styles.formSatir}>
        <Pressable style={styles.onaylaButon} onPress={() => onOnayla(kullanici.id)}>
          <Text style={styles.kaydetText}>Onayla</Text>
        </Pressable>
        <Pressable style={styles.reddetButon} onPress={reddetOnaySor}>
          <Text style={styles.reddetText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  const { user, users, setUnvan, kullaniciOnayla, kullaniciReddet } = useAuth();

  if (!user || user.role !== 'admin') {
    return null;
  }

  const onayBekleyenler = users
    .filter((u) => u.onayli === false)
    .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, 'tr'));

  const onayliKullanicilar = users
    .filter((u) => u.role !== 'admin' && u.onayli !== false)
    .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, 'tr'));

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={onayliKullanicilar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {onayBekleyenler.length > 0 ? (
              <View style={styles.bekleyenBolum}>
                <Text style={styles.bolumBaslik}>
                  Onay Bekleyen Kayıtlar ({onayBekleyenler.length})
                </Text>
                {onayBekleyenler.map((aday) => (
                  <OnayBekleyenSatiri
                    key={aday.id}
                    kullanici={aday}
                    onOnayla={kullaniciOnayla}
                    onReddet={kullaniciReddet}
                  />
                ))}
              </View>
            ) : null}
            <Text style={styles.aciklama}>
              Kullanıcılara unvan verin ya da geri alın. Yalnızca "Muhtar"
              unvanı olan kişi "Duyurular" sekmesinden resmi duyuru
              paylaşabilir; diğer unvanlar sadece profilde görünen bir
              etikettir.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <KullaniciSatiri kullanici={item} onUnvanKaydet={setUnvan} />
        )}
        ListEmptyComponent={
          <Text style={styles.bosText}>Henüz onaylı köylü yok.</Text>
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
  bekleyenBolum: {
    marginBottom: Spacing.lg,
  },
  bolumBaslik: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  bekleyenSatir: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  uyariText: {
    fontSize: 12,
    color: Colors.accent,
    fontStyle: 'italic',
  },
  onaylaButon: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  reddetButon: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  reddetText: {
    color: Colors.danger,
    fontWeight: '700',
  },
});
