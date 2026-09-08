import DateTimePicker from '@react-native-community/datetimepicker';
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
import {
  CENAZE_NAMAZI_CAMILERI,
  DAVET_TURLERI,
  DAVET_TURU_ALANLARI,
  type DavetTuru,
  type PostType,
} from '@/types';
import { canPostDuyuru } from '@/utils/yetki';

function birlestirTarihSaat(tarih: Date, saat: Date) {
  const sonuc = new Date(tarih);
  sonuc.setHours(saat.getHours(), saat.getMinutes(), 0, 0);
  return sonuc;
}

export default function YeniPaylasimScreen() {
  const { type } = useLocalSearchParams<{ type?: PostType }>();
  const postType: PostType = type === 'duyuru' ? 'duyuru' : 'etkinlik';

  const { user } = useAuth();
  const { addPost } = usePosts();

  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [davetTuru, setDavetTuru] = useState<DavetTuru | null>(null);
  const [detaylar, setDetaylar] = useState<Record<string, string>>({});
  const [konum, setKonum] = useState('');
  const [cenazeCamii, setCenazeCamii] = useState<string | null>(null);
  const [tarih, setTarih] = useState(new Date());
  const [saat, setSaat] = useState(new Date());
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

  const davetTuruSec = (yeni: DavetTuru) => {
    setDavetTuru(yeni);
    setDetaylar({});
    setCenazeCamii(null);
  };

  const paylas = async () => {
    setHata(null);
    if (!baslik.trim() || !icerik.trim()) {
      setHata('Başlık ve içerik zorunludur.');
      return;
    }
    if (postType === 'etkinlik' && !davetTuru) {
      setHata('Davet türü seçin.');
      return;
    }
    if (postType === 'etkinlik' && davetTuru === 'Cenaze' && !cenazeCamii) {
      setHata('Cenaze namazının kılınacağı camiyi seçin.');
      return;
    }

    setGonderiliyor(true);
    await addPost({
      type: postType,
      davetTuru: postType === 'etkinlik' ? davetTuru ?? undefined : undefined,
      baslik: baslik.trim(),
      icerik: icerik.trim(),
      etkinlikTarihi: postType === 'etkinlik' ? birlestirTarihSaat(tarih, saat).toISOString() : undefined,
      konum:
        postType === 'etkinlik'
          ? davetTuru === 'Cenaze'
            ? cenazeCamii ?? undefined
            : konum.trim() || undefined
          : undefined,
      detaylar:
        postType === 'etkinlik' && Object.values(detaylar).some((v) => v.trim())
          ? Object.fromEntries(
              Object.entries(detaylar)
                .map(([k, v]) => [k, v.trim()])
                .filter(([, v]) => v)
            )
          : undefined,
      yazanId: user.id,
      yazanAdSoyad: user.adSoyad,
    });
    setGonderiliyor(false);
    router.back();
  };

  const alanlar = davetTuru ? DAVET_TURU_ALANLARI[davetTuru] : [];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.baslikMetni}>
            {postType === 'duyuru' ? 'Yeni Duyuru' : 'Yeni Davetiye'}
          </Text>

          {postType === 'etkinlik' ? (
            <>
              <Text style={styles.label}>Davet Türü</Text>
              <View style={styles.chipSatir}>
                {DAVET_TURLERI.map((tur) => (
                  <Pressable
                    key={tur}
                    style={[styles.chip, davetTuru === tur && styles.chipSecili]}
                    onPress={() => davetTuruSec(tur)}>
                    <Text style={[styles.chipText, davetTuru === tur && styles.chipTextSecili]}>
                      {tur}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.label}>Başlık</Text>
          <TextInput
            value={baslik}
            onChangeText={setBaslik}
            placeholder={postType === 'duyuru' ? 'Örn: Su kesintisi' : "Örn: Ali ile Zeynep'in Düğünü"}
            style={styles.input}
          />

          {postType === 'etkinlik' ? (
            <>
              <Text style={styles.label}>Tarih</Text>
              <View style={styles.pickerKutu}>
                <DateTimePicker
                  value={tarih}
                  mode="date"
                  display="spinner"
                  locale="tr-TR"
                  onChange={(_e, secilen) => secilen && setTarih(secilen)}
                />
              </View>

              <Text style={styles.label}>Saat</Text>
              <View style={styles.pickerKutu}>
                <DateTimePicker
                  value={saat}
                  mode="time"
                  display="spinner"
                  is24Hour
                  locale="tr-TR"
                  onChange={(_e, secilen) => secilen && setSaat(secilen)}
                />
              </View>

              {davetTuru === 'Cenaze' ? (
                <>
                  <Text style={styles.label}>Cenaze Namazı Kılınacak Cami</Text>
                  <View style={styles.chipSatir}>
                    {CENAZE_NAMAZI_CAMILERI.map((cami) => (
                      <Pressable
                        key={cami}
                        style={[styles.chip, cenazeCamii === cami && styles.chipSecili]}
                        onPress={() => setCenazeCamii(cami)}>
                        <Text
                          style={[styles.chipText, cenazeCamii === cami && styles.chipTextSecili]}>
                          {cami}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Konum</Text>
                  <TextInput
                    value={konum}
                    onChangeText={setKonum}
                    placeholder="Örn: Köy Düğün Salonu"
                    style={styles.input}
                  />
                </>
              )}

              {alanlar.length > 0 ? (
                <View style={styles.detayKutu}>
                  <Text style={styles.detayBaslik}>Ek Bilgiler (istersen boş bırakabilirsin)</Text>
                  {alanlar.map((alan) => (
                    <View key={alan}>
                      <Text style={styles.label}>{alan}</Text>
                      <TextInput
                        value={detaylar[alan] ?? ''}
                        onChangeText={(v) => setDetaylar((mevcut) => ({ ...mevcut, [alan]: v }))}
                        placeholder={alan}
                        style={styles.input}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
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
    fontSize: 14,
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
    paddingVertical: Spacing.md,
    fontSize: 18,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hataText: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  buton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  butonDisabled: {
    opacity: 0.6,
  },
  butonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  chipSatir: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  chipSecili: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextSecili: {
    color: '#fff',
    fontWeight: '700',
  },
  pickerKutu: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  detayKutu: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  detayBaslik: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
});
