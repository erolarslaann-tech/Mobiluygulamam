import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { registerForPushNotificationsAsync } from '@/services/notifications';
import { ensureSeedData, sessionStore, usersStore } from '@/services/storage';
import type { User } from '@/types';

export type GirisSonucu =
  | { durum: 'basarili' }
  | { durum: 'hata'; mesaj: string }
  | { durum: 'coklu-eslesme'; adaylar: User[] };

interface AuthContextValue {
  user: User | null;
  /** Tüm kullanıcılar — yalnızca admin ekranında unvan atamak için kullanılır. */
  users: User[];
  loading: boolean;
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAd(s: string) {
  return s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureSeedData();
      const allUsers = await usersStore.getAll();
      setUsers(allUsers);
      const userId = await sessionStore.getUserId();
      if (userId) {
        const found = allUsers.find((u) => u.id === userId) ?? null;
        setUser(found);
      }
      setLoading(false);
    })();
  }, []);

  const oturumAc = async (secilen: User) => {
    await sessionStore.setUserId(secilen.id);
    setUser(secilen);
    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      const all = await usersStore.getAll();
      const updated = all.map((u) => (u.id === secilen.id ? { ...u, pushToken: token } : u));
      await usersStore.saveAll(updated);
      setUsers(updated);
    });
  };

  const login: AuthContextValue['login'] = async (ad, soyad, sifre) => {
    if (!ad.trim() || !soyad.trim() || !sifre) {
      return { durum: 'hata', mesaj: 'Ad, soyisim ve şifre girin.' };
    }
    const allUsers = await usersStore.getAll();
    setUsers(allUsers);
    const hedef = normalizeAd(`${ad} ${soyad}`);
    const adaylar = allUsers.filter(
      (u) => normalizeAd(u.adSoyad) === hedef && u.sifre === sifre
    );

    if (adaylar.length === 0) {
      return { durum: 'hata', mesaj: 'Ad, soyisim ya da şifre hatalı.' };
    }
    if (adaylar.length === 1) {
      await oturumAc(adaylar[0]);
      return { durum: 'basarili' };
    }
    return { durum: 'coklu-eslesme', adaylar };
  };

  const girisSecimiYap: AuthContextValue['girisSecimiYap'] = async (userId) => {
    const allUsers = await usersStore.getAll();
    const secilen = allUsers.find((u) => u.id === userId);
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
    const allUsers = await usersStore.getAll();
    // Kayıt olan herkes sade "kullanıcı"dır. Unvan (Muhtar dahil) yalnızca
    // admin tarafından, uygulama içinden sonradan atanır.
    const newUser: User = {
      id: `user-${Date.now()}`,
      adSoyad: `${ad.trim()} ${soyad.trim()}`,
      yas,
      babaAdi: babaAdi.trim() || undefined,
      sifre,
      role: 'kullanici',
    };
    const updated = [...allUsers, newUser];
    await usersStore.saveAll(updated);
    setUsers(updated);
    await oturumAc(newUser);
    return { ok: true };
  };

  const logout = async () => {
    await sessionStore.clear();
    setUser(null);
  };

  const setUnvan: AuthContextValue['setUnvan'] = async (userId, unvan) => {
    const allUsers = await usersStore.getAll();
    const updated = allUsers.map((u) =>
      u.id === userId ? { ...u, unvan: unvan.trim() || undefined } : u
    );
    await usersStore.saveAll(updated);
    setUsers(updated);
    setUser((current) => {
      if (!current || current.id !== userId) return current;
      const yeni = updated.find((u) => u.id === userId) ?? current;
      return yeni;
    });
  };

  const value = useMemo(
    () => ({ user, users, loading, login, girisSecimiYap, register, logout, setUnvan }),
    [user, users, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
