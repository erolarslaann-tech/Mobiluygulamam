import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { registerForPushNotificationsAsync } from '@/services/notifications';
import { ensureSeedData, sessionStore, usersStore } from '@/services/storage';
import type { Role, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (telefon: string, sifre: string) => Promise<{ ok: boolean; hata?: string }>;
  register: (
    adSoyad: string,
    telefon: string,
    sifre: string
  ) => Promise<{ ok: boolean; hata?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeTelefon(telefon: string) {
  return telefon.replace(/\D/g, '');
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureSeedData();
      const userId = await sessionStore.getUserId();
      if (userId) {
        const users = await usersStore.getAll();
        const found = users.find((u) => u.id === userId) ?? null;
        setUser(found);
      }
      setLoading(false);
    })();
  }, []);

  const login: AuthContextValue['login'] = async (telefon, sifre) => {
    const users = await usersStore.getAll();
    const tel = normalizeTelefon(telefon);
    const found = users.find((u) => u.telefon === tel);
    if (!found || found.sifre !== sifre) {
      return { ok: false, hata: 'Telefon numarası veya şifre hatalı.' };
    }
    await sessionStore.setUserId(found.id);
    setUser(found);
    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      const all = await usersStore.getAll();
      const updated = all.map((u) => (u.id === found.id ? { ...u, pushToken: token } : u));
      await usersStore.saveAll(updated);
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
    const users = await usersStore.getAll();
    if (users.some((u) => u.telefon === tel)) {
      return { ok: false, hata: 'Bu telefon numarası zaten kayıtlı.' };
    }
    const role: Role = 'koylu';
    const newUser: User = {
      id: `user-${Date.now()}`,
      adSoyad: adSoyad.trim(),
      telefon: tel,
      sifre,
      role,
    };
    await usersStore.saveAll([...users, newUser]);
    await sessionStore.setUserId(newUser.id);
    setUser(newUser);
    return { ok: true };
  };

  const logout = async () => {
    await sessionStore.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}
