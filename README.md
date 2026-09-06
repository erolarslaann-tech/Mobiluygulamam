# Köyüm

Köy halkı ile muhtarı buluşturan bir topluluk uygulaması. Muhtar resmi
duyurular paylaşır, köylüler düğün/mevlit/cenaze gibi önemli günleri ve
davetleri paylaşır; herkes beğeni ve yorum ile etkileşime girebilir.

React Native + Expo (expo-router) ile TypeScript kullanılarak geliştirildi.

## Başlarken

```bash
npm install
npm run start   # sonra Expo Go ile QR kodu okutun, ya da:
npm run android
npm run ios
```

## Demo hesaplar

Uygulama ilk açıldığında iki demo hesap otomatik oluşturulur:

- **Muhtar:** `5550000000` / `muhtar123`
- **Köylü:** `5551111111` / `123456`

Yeni köylüler "Kayıt Ol" ekranından telefon numarası + şifre ile kendi
hesaplarını oluşturabilir. Muhtar rolü güvenlik amacıyla self-servis
kayıttan atanmaz; şu an için sadece seed hesapla geliyor.

## Mevcut özellikler (MVP)

- Telefon numarası + şifre ile giriş / kayıt
- Muhtar duyuruları (Duyurular sekmesi) — sadece muhtar ekleyebilir
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
3. Muhtarın paylaştığı her duyuru için, sunucudan kayıtlı tüm köylülerin
   push token'larına bildirim göndermek.

## Proje yapısı

```
src/
  app/            expo-router ekranları (dosya tabanlı yönlendirme)
    login.tsx, register.tsx
    (tabs)/       Duyurular, Etkinlikler, Profil sekmeleri
    post/[id].tsx Gönderi detayı (beğeni + yorumlar)
    post/new.tsx  Yeni duyuru/etkinlik ekleme formu
  context/        AuthContext (oturum), PostsContext (gönderi/yorum state)
  services/       storage.ts (yerel veri), notifications.ts (bildirimler)
  components/     PostCard, RoleBadge
  types/          Ortak TypeScript tipleri
```
