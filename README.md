# Köyüm

Köy halkı ile muhtarı buluşturan bir topluluk uygulaması. Uygulama
kimsenin değil, **uygulama sahibinin (admin)** kontrolündedir: admin
kullanıcılara "Muhtar" gibi unvanlar verir/geri alır. Unvanı "Muhtar"
olan kişi resmi duyurular paylaşır, köylüler düğün/mevlit/cenaze gibi
önemli günleri ve davetleri paylaşır; herkes beğeni ve yorum ile
etkileşime girebilir.

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
- **Köylü:** Unvansız her kayıtlı kullanıcı. "Kayıt Ol" ekranından
  telefon numarası + şifre ile herkes köylü olarak katılabilir; etkinlik/
  davet paylaşabilir, beğeni/yorum yapabilir.

## Demo hesaplar

Uygulama ilk açıldığında üç demo hesap otomatik oluşturulur:

- **Uygulama Sahibi (admin):** `5559999999` / `admin123`
- **Muhtar unvanlı köylü:** `5550000000` / `muhtar123`
- **Sade köylü:** `5551111111` / `123456`

> ⚠️ Bu şifreler sadece demo/geliştirme amaçlıdır ve `src/services/storage.ts`
> içinde açık metin olarak duruyor (gerçek bir backend olmadığı için basit
> tutuldu). Gerçek kullanıcılarla paylaşmadan önce mutlaka admin şifresini
> değiştirin ve backend'e geçtiğinizde düzgün bir kimlik doğrulama (hash'li
> şifre, vb.) kurun.

## Mevcut özellikler (MVP)

- Telefon numarası + şifre ile giriş / kayıt
- Admin'e özel "Yönetim" sekmesi: kullanıcılara unvan verme/kaldırma
- Muhtar unvanlı kişinin duyuruları (Duyurular sekmesi)
- Etkinlik / davet paylaşımı (Etkinlikler sekmesi) — herkes ekleyebilir
- Gönderilere beğeni ve yorum
- Yeni bir duyuru paylaşıldığında cihazda anlık bildirim

## Önemli sınırlama: veriler şu an sadece cihazda

`src/services/storage.ts` içindeki veri katmanı, gerçek bir sunucu
kurulana kadar **AsyncStorage ile cihaz üzerinde** çalışan geçici bir
"sahte backend"dir. Yani şu anki haliyle:

- Bir kullanıcının eklediği duyuru/etkinlik **başka bir cihazda görünmez**.
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
    (tabs)/       Duyurular, Etkinlikler, Yönetim (sadece admin), Profil
    post/[id].tsx Gönderi detayı (beğeni + yorumlar)
    post/new.tsx  Yeni duyuru/etkinlik ekleme formu
  context/        AuthContext (oturum + kullanıcı/unvan yönetimi), PostsContext
  services/       storage.ts (yerel veri), notifications.ts (bildirimler)
  utils/          yetki.ts (kim duyuru paylaşabilir mantığı)
  components/     PostCard, RoleBadge
  types/          Ortak TypeScript tipleri
```
