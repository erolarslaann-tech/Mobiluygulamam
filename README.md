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

React Native + Expo (expo-router) ile TypeScript kullanılarak geliştirildi.

## Başlarken

```bash
npm install
npm run start   # sonra Expo Go ile QR kodu okutun, ya da:
npm run android
npm run ios
```

## Yetki modeli: admin, unvan, köylü

- **Admin (uygulama sahibi):** Tek yetki kaynağı budur. "Yönetim"
  sekmesinden herhangi bir kullanıcıya unvan (ör. Muhtar, İmam, Köy
  Azası) verebilir veya geri alabilir. Admin hesabı kayıt ekranından
  oluşturulamaz, yalnızca seed veride var.
- **Unvan:** Admin'in bir kullanıcıya verdiği etikettir, bir "rol"
  değildir — sadece admin atar/kaldırır. Yalnızca **"Muhtar"** unvanı
  resmi duyuru paylaşma yetkisi verir; diğer unvanlar (İmam, Köy Azası,
  Bekçi vb.) profilde görünen birer etikettir, ek yetki taşımaz.
- **Köylü:** Unvansız her kayıtlı kullanıcı. "Kayıt Ol" ekranından ad,
  soyad, yaş ve şifre ile herkes köylü olarak katılabilir; davetiye
  paylaşabilir, beğeni/yorum yapabilir.

## Giriş: telefon yerine ad + soyad + şifre

SMS doğrulama gerektirmesin ve köylüler için basit olsun diye giriş
telefon numarası yerine **ad, soyad ve şifre** ile yapılıyor. Kayıtta
ayrıca **yaş** zorunlu, **baba adı** ise opsiyonel — aynı ad soyada
sahip birden fazla kişi olursa (küçük köylerde sık rastlanan bir
durum) hem kayıt sırasında karışıklığı önlemek hem de böyle bir
çakışma girişte gerçekleşirse doğru kişiyi ayırt edebilmek için.
Giriş sırasında aynı ad+soyad+şifreye sahip birden fazla kişi çıkarsa
(çok nadir), uygulama bu kişileri baba adı ve yaşıyla listeler ve
doğru kişiyi seçmenizi ister.

## Demo hesaplar

Uygulama ilk açıldığında üç demo hesap otomatik oluşturulur:

- **Yönetici Hesap (admin):** Şifre `admin123`
- **Ahmet Yılmaz (Muhtar unvanlı):** Şifre `muhtar123`
- **Ayşe Demir (sade köylü):** Şifre `123456`

> ⚠️ Bu şifreler sadece demo/geliştirme amaçlıdır ve `src/services/storage.ts`
> içinde açık metin olarak duruyor (gerçek bir backend olmadığı için basit
> tutuldu). Gerçek kullanıcılarla paylaşmadan önce mutlaka admin şifresini
> değiştirin ve backend'e geçtiğinizde düzgün bir kimlik doğrulama (hash'li
> şifre, vb.) kurun.

## Mevcut özellikler (MVP)

- Ad, soyad, yaş (+opsiyonel baba adı) ve şifre ile giriş / kayıt
- Admin'e özel "Yönetim" sekmesi: kullanıcılara unvan verme/kaldırma
- Muhtar unvanlı kişinin duyuruları (Duyurular sekmesi)
- Davetiye paylaşımı (Davetiyeler sekmesi) — herkes ekleyebilir
- Gönderilere beğeni ve yorum
- Yeni bir duyuru paylaşıldığında cihazda anlık bildirim
- Köylüler için sade dil, büyük yazı/dokunma alanları, göz yormayan
  toprak tonu renk paleti

## Önemli sınırlama: veriler şu an sadece cihazda

`src/services/storage.ts` içindeki veri katmanı, gerçek bir sunucu
kurulana kadar **AsyncStorage ile cihaz üzerinde** çalışan geçici bir
"sahte backend"dir. Yani şu anki haliyle:

- Bir kullanıcının eklediği duyuru/davetiye **başka bir cihazda görünmez**.
- Muhtarın duyurusu diğer köylülerin telefonuna **gerçek push bildirimi
  olarak gitmez** (yalnızca duyuruyu ekleyen cihazda anlık bildirim
  gösterilir — bu bir demodur).

Uygulamanın gerçek anlamda köy genelinde çalışması için bir sonraki adım:

1. Basit bir backend kurmak (ör. Firebase: Auth + Firestore + Cloud
   Messaging, ya da küçük bir Node.js/PostgreSQL API).
2. `src/services/storage.ts` ve `src/services/notifications.ts`
   içindeki fonksiyonları bu gerçek backend'e bağlamak — ekranların
   kendisi değişmeden kalabilir, çünkü tüm veri erişimi bu iki dosya
   üzerinden yapılıyor.
3. Muhtar unvanlı kişinin paylaştığı her duyuru için, sunucudan kayıtlı
   tüm köylülerin push token'larına bildirim göndermek.

## Proje yapısı

```
src/
  app/            expo-router ekranları (dosya tabanlı yönlendirme)
    login.tsx, register.tsx
    (tabs)/       Duyurular, Davetiyeler, Yönetim (sadece admin), Profil
    post/[id].tsx Gönderi detayı (beğeni + yorumlar)
    post/new.tsx  Yeni duyuru/davetiye ekleme formu
  context/        AuthContext (oturum + kullanıcı/unvan yönetimi), PostsContext
  services/       storage.ts (yerel veri), notifications.ts (bildirimler)
  utils/          yetki.ts (kim duyuru paylaşabilir mantığı)
  components/     PostCard, RoleBadge
  types/          Ortak TypeScript tipleri
```

## Sırada ne var? (öneriler)

Aşağıdakiler henüz eklenmedi, sadece köylü gözünden faydalı olabilecek
fikirler — istediğini seçip söylemen yeterli:

1. **Vefat/taziye duyurusu ayrı kategori** — ölüm ilanları özel bir
   görünümle (siyah çerçeve vb.) işaretlenip herkese anında bildirim
   gitsin; en hassas ve en hızlı ulaşılması gereken duyuru türü.
2. **Duyuru kategorileri/filtre** — Genel, Su-Elektrik, Sağlık, Vefat,
   Doğum gibi etiketler; köylü ilgilendiği duyuruyu hızlı bulur.
3. **Önemli telefonlar sayfası** — muhtar, sağlık ocağı, jandarma,
   nöbetçi eczane gibi numaralara tek dokunuşla ulaşım.
4. **Gönderiye fotoğraf ekleme** — düğün/duyuru paylaşımı görselle çok
   daha anlaşılır olur.
5. **Büyük yazı / erişilebilirlik modu** — yaşlı kullanıcılar için tüm
   uygulamada tek dokunuşla daha büyük yazı boyutuna geçiş.

Bunların hiçbiri zorunlu değil; mevcut 4 sekme (Duyurular, Davetiyeler,
Yönetim, Profil) zaten eksiksiz çalışıyor. Karmaşayı önlemek için
öneri listesini kısa tuttum — istersen bunlardan sadece 1-2'sini
seçip ekleyelim.
