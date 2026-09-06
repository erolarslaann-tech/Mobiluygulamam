# Ortacı Köyüm

Ortacı köyü halkını buluşturan bir topluluk uygulaması. Uygulama
kimsenin değil, **uygulama sahibinin (admin)** kontrolündedir: admin
kullanıcılara "Muhtar" gibi unvanlar verir/geri alır. Unvanı "Muhtar"
olan kişi resmi duyurular paylaşır, köylüler düğün/mevlit/cenaze gibi
önemli günleri davetiye olarak paylaşır; herkes beğeni ve yorum ile
etkileşime girebilir.

Başka köylerden talep gelirse, bu proje temel alınıp o köye özel bir
sürüm (kendi ismi/logosuyla) çıkarılabilir — şimdilik tek köy (Ortacı)
için tasarlandı.

React Native + Expo (expo-router) + Firebase (Firestore) ile TypeScript
kullanılarak geliştirildi.

## Başlarken

### 1. Firebase projesi kur (bir kere yapılır)

Veriler artık cihazda değil, Firestore'da tutuluyor — bu sayede her
köylünün telefonu aynı duyuru/davetiye listesini görür. Buna ihtiyacın var:

1. [console.firebase.google.com](https://console.firebase.google.com) →
   yeni proje oluştur (ücretsiz **Spark** plan yeterli, kart istemez).
2. Proje içinde **Build > Firestore Database** → "Create database" →
   herhangi bir bölge seç.
3. **Build > Authentication** → "Get started" → **Sign-in method**
   sekmesinden **Anonymous** sağlayıcısını etkinleştir (uygulama kimlik
   doğrulaması için arka planda bunu kullanıyor, kullanıcıya görünmez).
4. Proje Ayarları (dişli ikonu) → **General** → "Your apps" → **Web**
   (`</>`) simgesine tıkla, bir isim ver, kayıt et. Sana bir
   `firebaseConfig` nesnesi verecek.
5. Bu değerleri `src/services/firebaseConfig.ts` dosyasındaki
   `BURAYA_YAPISTIR` yerlerine yapıştır.
6. **Firestore Database > Rules** sekmesine bu projedeki `firestore.rules`
   dosyasının içeriğini yapıştırıp "Publish" de.

### 2. Uygulamayı çalıştır

```bash
npm install
npm run start   # sonra Expo Go ile QR kodu okutun, ya da:
npm run android
npm run ios
```

Firebase config'i doldurmadan açarsan uygulama bunu algılar ve net bir
uyarı ekranı gösterir (kod hatası değil, kasıtlı bir kontrol).

## Yetki modeli: admin, unvan, köylü

- **Admin (uygulama sahibi):** Tek yetki kaynağı budur. "Yönetim"
  sekmesinden herhangi bir kullanıcıya unvan (ör. Muhtar, İmam, Köy
  Azası) verebilir veya geri alabilir, ve yeni kayıtları onaylar.
  Admin hesabı kayıt ekranından oluşturulamaz, yalnızca seed veride var.
- **Unvan:** Admin'in bir kullanıcıya verdiği etikettir, bir "rol"
  değildir — sadece admin atar/kaldırır. Yalnızca **"Muhtar"** unvanı
  resmi duyuru paylaşma yetkisi verir; diğer unvanlar (İmam, Köy Azası,
  Bekçi vb.) profilde görünen birer etikettir, ek yetki taşımaz.
- **Köylü:** Unvansız her onaylı kullanıcı. "Kayıt Ol" ekranından ad,
  soyad, yaş ve şifre ile herkes başvurabilir; davetiye paylaşabilir,
  beğeni/yorum yapabilir.

## Giriş: telefon yerine ad + soyad + şifre, admin onaylı kayıt

SMS doğrulama gerektirmesin ve köylüler için basit olsun diye giriş
telefon numarası yerine **ad, soyad ve şifre** ile yapılıyor. Kayıtta
ayrıca **yaş** zorunlu, **baba adı** ise opsiyonel.

**"Aynı isimde iki hesap olursa ne olur?"** sorusunun çözümü: yeni
kayıtlar direkt aktif olmaz, **admin onayına düşer** ("Yönetim"
sekmesinde "Onay Bekleyen Kayıtlar" listesi). Küçük bir köyde admin
muhtemelen herkesi tanıdığı için, ikinci bir "Ahmet Yılmaz" kaydı
geldiğinde bunun gerçek bir ikinci kişi mi yoksa hatalı/taklit bir
kayıt mı olduğunu yaş/baba adına bakarak ayırt edip onaylar ya da
siler. Ekstra maliyet gerektirmez (SMS doğrulama gibi).

Ayrıca giriş sırasında aynı ad+soyad+şifreye sahip birden fazla
**onaylı** kişi çıkarsa (çok nadir), uygulama bu kişileri baba adı ve
yaşıyla listeler ve doğru kişiyi seçmenizi ister.

## Demo hesaplar

Firebase projesi ilk kez boşken açıldığında üç demo hesap otomatik
oluşturulur (hepsi onaylı):

- **Yönetici Hesap (admin):** Şifre `admin123`
- **Ahmet Yılmaz (Muhtar unvanlı):** Şifre `muhtar123`
- **Ayşe Demir (sade köylü):** Şifre `123456`

> ⚠️ Bu şifreler sadece demo/geliştirme amaçlıdır ve Firestore'da açık
> metin olarak duruyor. Gerçek kullanıcılarla paylaşmadan önce mutlaka
> admin şifresini değiştirin. Şifrelerin gerçek anlamda güvenli
> saklanması (hash'leme) ve unvan/onay işlemlerinin sunucu tarafında
> doğrulanması (şu an "giriş yapmış herkes yazabilir" seviyesinde,
> `firestore.rules` içindeki nota bakın) ileride Cloud Functions ile
> sertleştirilebilecek bir adımdır.

## Mevcut özellikler (MVP)

- Ad, soyad, yaş (+opsiyonel baba adı) ve şifre ile giriş / kayıt
- Admin onayı olmadan yeni kayıt aktif olmaz (taklit/karışıklık önlemi)
- Admin'e özel "Yönetim" sekmesi: kayıt onaylama + unvan verme/kaldırma
- **Firestore ile gerçek zamanlı senkronizasyon** — bir köylünün attığı
  duyuru/davetiye/yorum/beğeni anında tüm cihazlarda görünür
- Muhtar unvanlı kişinin duyuruları (Duyurular sekmesi)
- Davetiye paylaşımı (Davetiyeler sekmesi) — herkes ekleyebilir
- Gönderilere beğeni ve yorum
- Yeni bir duyuru paylaşıldığında cihazda anlık bildirim (yalnızca
  duyuruyu paylaşan cihazda — bkz. aşağıdaki sınırlama)
- Köylüler için sade dil, büyük yazı/dokunma alanları, göz yormayan
  toprak tonu renk paleti

## Kalan sınırlama: gerçek push bildirimi

Duyuru/davetiye verisi artık Firestore'da tüm cihazlar arası senkron,
ama muhtarın attığı duyuru diğer köylülerin telefonuna **gerçek push
bildirimi olarak gitmiyor** — sadece duyuruyu atan kişinin cihazında
anlık bildirim gösteriliyor (bu bir demodur). Bunun için bir sonraki
adım: her kullanıcının `pushToken`'ı zaten Firestore'da tutuluyor,
duyuru eklendiğinde bir **Cloud Function** (Firestore'a yeni duyuru
yazıldığında tetiklenen) tüm token'lara Expo/FCM push bildirimi
göndermeli. Bu, Firebase'in ücretli (Blaze) planını gerektirir ama
küçük bir köy uygulaması için harcama pratikte sıfıra yakın kalır.

## Proje yapısı

```
src/
  app/            expo-router ekranları (dosya tabanlı yönlendirme)
    login.tsx, register.tsx
    (tabs)/       Duyurular, Davetiyeler, Yönetim (sadece admin), Profil
    post/[id].tsx Gönderi detayı (beğeni + yorumlar)
    post/new.tsx  Yeni duyuru/davetiye ekleme formu
  context/        AuthContext (oturum + onay/unvan yönetimi), PostsContext
  services/       firebaseConfig.ts, firestoreRepo.ts (Firestore erişimi),
                   tohumVeri.ts (ilk demo veri), notifications.ts, storage.ts
                   (sadece "bu cihazda kim giriş yapmıştı" önbelleği)
  utils/          yetki.ts (kim duyuru paylaşabilir mantığı)
  components/     PostCard, RoleBadge
  types/          Ortak TypeScript tipleri
firestore.rules    Firebase Console'a yapıştırılacak güvenlik kuralları
```

## Ertelenen fikirler

Bunlar konuşuldu ama **şimdilik bilinçli olarak ertelendi** — önce
uygulamayı köylülere yayıp kullanıcı kazanmaya odaklanmak için:

- **Köylüler arası basit bir "kafa topu" oyunu** (turnuva modu, puan
  tablosu). Hile olmaması için puanların sadece resmi turnuva
  etkinliklerinde toplanması gerekiyor; gerçek zamanlı çevrimiçi
  multiplayer + puan tablosu artık Firestore backend'i sayesinde
  mümkün, ama oyunun fizik/kontrol kısmı başlı başına ayrı ve büyük
  bir geliştirme — ayrı bir oturumda ele alınmalı.
- **Google AdMob reklamları** (banner + ödüllü video). Bunun için
  Expo Go yerine özel derleme (EAS Build) ve senin bir AdMob hesabın
  gerekiyor; oyun ile birlikte ele alınması daha mantıklı.

Diğer küçük öneriler (hâlâ geçerli, istersen tek tek eklenebilir):

1. **Vefat/taziye duyurusu ayrı kategori** — özel görünüm + herkese
   anında bildirim; en hassas duyuru türü.
2. **Duyuru kategorileri/filtre** — Genel, Su-Elektrik, Sağlık, Vefat,
   Doğum gibi etiketler.
3. **Önemli telefonlar sayfası** — muhtar, sağlık ocağı, jandarma,
   nöbetçi eczane numaralarına tek dokunuşla ulaşım.
4. **Gönderiye fotoğraf ekleme.**
5. **Büyük yazı / erişilebilirlik modu.**
