import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { auth } from '@/services/firebaseConfig';
import {
  kullaniciEkle,
  kullaniciGuncelle,
  kullaniciSil,
  kullanicilariDinle,
} from '@/services/firestoreRepo';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { sessionStore } from '@/services/storage';
import { tohumVeriEkleGerekirse } from '@/services/tohumVeri';
import type { User } from '@/types';

export type GirisSonucu =
  | { durum: 'basarili' }
  | { durum: 'hata'; mesaj: string }
  | { durum: 'coklu-eslesme'; adaylar: User[] };

interface AuthContextValue {
  user: User | null;
  /** Tüm kullanıcılar (onaylı + onay bekleyen) — Firestore ile canlı senkronize. */
  users: User[];
  loading: boolean;
  baglantiHatasi: string | null;
  login: (ad: string, soyad: string, sifre: string) => Promise<GirisSonucu>;
  /** Aynı ad+soyad+şifreye sahip birden fazla kişi çıkarsa, doğru kişiyi seçmek için. */
  girisSecimiYap: (userId: string) => Promise<void>;
  register: (
    ad: string,
    soyad: string,
    yas: number,
    babaAdi: string,
    sifre: string
  ) => Promise<{ ok: boolean; hata?: string }>;
  logout: () => Promise<void>;
  /** Sadece admin çağırmalı: bir kullanıcıya unvan verir/kaldırır (boş = unvanı kaldır). */
  setUnvan: (userId: string, unvan: string) => Promise<void>;
  /** Sadece admin: onay bekleyen bir kaydı onaylar. */
  kullaniciOnayla: (userId: string) => Promise<void>;
  /** Sadece admin: sahte/yanlış bir kaydı tamamen siler. */
  kullaniciReddet: (userId: string) => Promise<void>;
  /** Giriş yapmış kullanıcı kendi bilgilerini (ad, yaş, baba adı, foto) günceller. */
  profilGuncelle: (
    degisiklik: Partial<Pick<User, 'adSoyad' | 'yas' | 'babaAdi' | 'profilFoto'>>
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAd(s: string) {
  return s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authHazir, setAuthHazir] = useState(false);
  const [usersYuklendi, setUsersYuklendi] = useState(false);
  const [baglantiHatasi, setBaglantiHatasi] = useState<string | null>(null);

  // 1) Firestore güvenlik kuralları "giriş yapmış" (anonim de olsa) istemci
  // ister; bu yüzden uygulama açılır açılmaz sessizce anonim oturum açılır.
  useEffect(() => {
    const kaldir = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthHazir(true);
      } else {
        signInAnonymously(auth).catch((e) => setBaglantiHatasi(String(e?.message ?? e)));
      }
    });
    return kaldir;
  }, []);

  // 2) Anonim oturum hazır olunca: gerekiyorsa demo veriyi ekle, sonra tüm
  // kullanıcıları canlı dinlemeye başla.
  useEffect(() => {
    if (!authHazir) return;
    let kaldirildi = false;

    tohumVeriEkleGerekirse().catch((e) => setBaglantiHatasi(String(e?.message ?? e)));

    const kaldir = kullanicilariDinle(
      (allUsers) => {
        if (kaldirildi) return;
        setUsers(allUsers);
        setUsersYuklendi(true);
      },
      (e) => setBaglantiHatasi(String(e?.message ?? e))
    );
    return () => {
      kaldirildi = true;
      kaldir();
    };
  }, [authHazir]);

  // 3) Kullanıcı listesi her güncellendiğinde: henüz oturum açılmadıysa bu
  // cihazda daha önce kim giriş yapmışsa geri yükle; açıksa unvan gibi
  // bilgileri güncel tut (kullanıcı silinirse oturumu da kapatır).
  useEffect(() => {
    if (!usersYuklendi) return;
    setUser((mevcut) => {
      if (mevcut) {
        return users.find((u) => u.id === mevcut.id) ?? null;
      }
      return mevcut;
    });
    if (!user) {
      sessionStore.getUserId().then((userId) => {
        if (!userId) return;
        const found = users.find((u) => u.id === userId);
        if (found) setUser(found);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, usersYuklendi]);

  const oturumAc = async (secilen: User) => {
    await sessionStore.setUserId(secilen.id);
    setUser(secilen);
    registerForPushNotificationsAsync().then((token) => {
      if (!token) return;
      kullaniciGuncelle(secilen.id, { pushToken: token }).catch(() => {});
    });
  };

  const login: AuthContextValue['login'] = async (ad, soyad, sifre) => {
    if (!ad.trim() || !soyad.trim() || !sifre) {
      return { durum: 'hata', mesaj: 'Ad, soyisim ve şifre girin.' };
    }
    const hedef = normalizeAd(`${ad} ${soyad}`);
    const eslesenler = users.filter(
      (u) => normalizeAd(u.adSoyad) === hedef && u.sifre === sifre
    );

    if (eslesenler.length === 0) {
      return { durum: 'hata', mesaj: 'Ad, soyisim ya da şifre hatalı.' };
    }

    const onayliOlanlar = eslesenler.filter((u) => u.onayli !== false);
    if (onayliOlanlar.length === 0) {
      return {
        durum: 'hata',
        mesaj: 'Kaydınız henüz köy yöneticisi tarafından onaylanmadı.',
      };
    }
    if (onayliOlanlar.length === 1) {
      await oturumAc(onayliOlanlar[0]);
      return { durum: 'basarili' };
    }
    return { durum: 'coklu-eslesme', adaylar: onayliOlanlar };
  };

  const girisSecimiYap: AuthContextValue['girisSecimiYap'] = async (userId) => {
    const secilen = users.find((u) => u.id === userId);
    if (!secilen) return;
    await oturumAc(secilen);
  };

  const register: AuthContextValue['register'] = async (ad, soyad, yas, babaAdi, sifre) => {
    if (!ad.trim() || !soyad.trim()) {
      return { ok: false, hata: 'Ad ve soyisim girin.' };
    }
    if (!Number.isFinite(yas) || yas < 1 || yas > 120) {
      return { ok: false, hata: 'Geçerli bir yaş girin.' };
    }
    if (sifre.length < 4) {
      return { ok: false, hata: 'Şifre en az 4 karakter olmalı.' };
    }
    // Kayıt olan herkes admin onayı bekleyen sade "kullanıcı"dır. Unvan
    // (Muhtar dahil) yalnızca admin tarafından sonradan atanır.
    const newUser: User = {
      id: `user-${Date.now()}`,
      adSoyad: `${ad.trim()} ${soyad.trim()}`,
      yas,
      babaAdi: babaAdi.trim() || undefined,
      sifre,
      role: 'kullanici',
      onayli: false,
    };
    try {
      await kullaniciEkle(newUser);
    } catch (e: any) {
      return { ok: false, hata: e?.message ?? 'Kayıt sırasında bir hata oluştu.' };
    }
    return { ok: true };
  };

  const logout = async () => {
    await sessionStore.clear();
    setUser(null);
  };

  const setUnvan: AuthContextValue['setUnvan'] = async (userId, unvan) => {
    await kullaniciGuncelle(userId, { unvan: unvan.trim() || undefined });
  };

  const kullaniciOnayla: AuthContextValue['kullaniciOnayla'] = async (userId) => {
    await kullaniciGuncelle(userId, { onayli: true });
  };

  const kullaniciReddet: AuthContextValue['kullaniciReddet'] = async (userId) => {
    await kullaniciSil(userId);
  };

  const profilGuncelle: AuthContextValue['profilGuncelle'] = async (degisiklik) => {
    if (!user) return;
    await kullaniciGuncelle(user.id, degisiklik);
    setUser((mevcut) => (mevcut ? { ...mevcut, ...degisiklik } : mevcut));
  };

  const loading = !usersYuklendi;

  const value = useMemo(
    () => ({
      user,
      users,
      loading,
      baglantiHatasi,
      login,
      girisSecimiYap,
      register,
      logout,
      setUnvan,
      kullaniciOnayla,
      kullaniciReddet,
      profilGuncelle,
    }),
    [user, users, loading, baglantiHatasi]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
