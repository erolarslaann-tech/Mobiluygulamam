import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { registerForPushNotificationsAsync } from '@/services/notifications';
import { ensureSeedData, sessionStore, usersStore } from '@/services/storage';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  /** Tüm kullanıcılar — yalnızca admin ekranında unvan atamak için kullanılır. */
  users: User[];
  loading: boolean;
  login: (telefon: string, sifre: string) => Promise<{ ok: boolean; hata?: string }>;
  register: (
    adSoyad: string,
    telefon: string,
    sifre: string
  ) => Promise<{ ok: boolean; hata?: string }>;
  logout: () => Promise<void>;
  /** Sadece admin çağırmalı: bir kullanıcıya unvan verir/kaldırır (boş = unvanı kaldır). */
  setUnvan: (userId: string, unvan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeTelefon(telefon: string) {
  return telefon.replace(/\D/g, '');
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

  const login: AuthContextValue['login'] = async (telefon, sifre) => {
    const allUsers = await usersStore.getAll();
    const tel = normalizeTelefon(telefon);
    const found = allUsers.find((u) => u.telefon === tel);
    if (!found || found.sifre !== sifre) {
      return { ok: false, hata: 'Telefon numarası veya şifre hatalı.' };
    }
    setUsers(allUsers);
    await sessionStore.setUserId(found.id);
    setUser(found);
    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      const all = await usersStore.getAll();
      const updated = all.map((u) => (u.id === found.id ? { ...u, pushToken: token } : u));
      await usersStore.saveAll(updated);
      setUsers(updated);
    });
    return { ok: true };
  };

  const register: AuthContextValue['register'] = async (adSoyad, telefon, sifre) => {
    const tel = normalizeTelefon(telefon);
    if (tel.length < 10) {
      return { ok: false, hata: 'Geçerli bir telefon numarası girin.' };
    }
    if (sifre.length < 4) {
      return { ok: false, hata: 'Şifre en az 4 karakter olmalı.' };
    }
    const allUsers = await usersStore.getAll();
    if (allUsers.some((u) => u.telefon === tel)) {
      return { ok: false, hata: 'Bu telefon numarası zaten kayıtlı.' };
    }
    // Kayıt olan herkes sade "kullanıcı"dır. Unvan (Muhtar dahil) yalnızca
    // admin tarafından, uygulama içinden sonradan atanır.
    const newUser: User = {
      id: `user-${Date.now()}`,
      adSoyad: adSoyad.trim(),
      telefon: tel,
      sifre,
      role: 'kullanici',
    };
    const updated = [...allUsers, newUser];
    await usersStore.saveAll(updated);
    setUsers(updated);
    await sessionStore.setUserId(newUser.id);
    setUser(newUser);
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
    () => ({ user, users, loading, login, register, logout, setUnvan }),
    [user, users, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
