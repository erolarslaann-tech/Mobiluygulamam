import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Uygulama açılırken (Firebase'e bağlanırken) gösterilen dekoratif ekran.
 * Basit geometrik şekillerle stilize bir köy manzarası — gerçek bir
 * görsel dosyaya ihtiyaç duymadan sıcak ve "ev" hissi veren bir arka plan.
 */
export function AcilisEkrani() {
  return (
    <View style={styles.kok}>
      <LinearGradient
        colors={['#FCE7B0', '#F4C68C', '#EAA96E']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.gunes} />

      <View style={[styles.tepe, styles.tepeArka]} />
      <View style={[styles.tepe, styles.tepeOrta]} />
      <View style={[styles.tepe, styles.tepeOn]} />

      <View style={styles.icerik}>
        <View style={styles.yaziKutu}>
          <Text style={styles.belediye}>KDZ. EREĞLİ BELEDİYESİ</Text>
          <Text style={styles.koyAdi}>ORTACI KÖYÜM</Text>
        </View>

        <ActivityIndicator color="#FFFFFF" size="large" style={styles.yukleniyor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kok: {
    flex: 1,
    backgroundColor: '#F4C68C',
    overflow: 'hidden',
  },
  gunes: {
    position: 'absolute',
    top: '14%',
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 250, 224, 0.85)',
  },
  tepe: {
    position: 'absolute',
    left: -40,
    right: -40,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
  },
  tepeArka: {
    height: 220,
    bottom: -40,
    backgroundColor: '#7FA06B',
    opacity: 0.55,
  },
  tepeOrta: {
    height: 170,
    bottom: -60,
    backgroundColor: '#5D8A55',
    opacity: 0.75,
  },
  tepeOn: {
    height: 120,
    bottom: -80,
    backgroundColor: '#3D6B45',
  },
  icerik: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  yaziKutu: {
    backgroundColor: 'rgba(32, 40, 26, 0.38)',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
  },
  belediye: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  koyAdi: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  yukleniyor: {
    marginTop: 28,
  },
});
