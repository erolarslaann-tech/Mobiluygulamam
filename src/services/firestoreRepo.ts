import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebaseConfig';
import type { Comment, Post, User } from '@/types';

const kullanicilarRef = collection(db, 'kullanicilar');
const gonderilerRef = collection(db, 'gonderiler');
const yorumlarRef = collection(db, 'yorumlar');

export function kullanicilariDinle(
  basarili: (users: User[]) => void,
  hata: (e: Error) => void
): Unsubscribe {
  return onSnapshot(
    kullanicilarRef,
    (snap) => basarili(snap.docs.map((d) => ({ ...(d.data() as Omit<User, 'id'>), id: d.id }))),
    hata
  );
}

export function gonderileriDinle(
  basarili: (posts: Post[]) => void,
  hata: (e: Error) => void
): Unsubscribe {
  return onSnapshot(
    gonderilerRef,
    (snap) => basarili(snap.docs.map((d) => ({ ...(d.data() as Omit<Post, 'id'>), id: d.id }))),
    hata
  );
}

export function yorumlariDinle(
  basarili: (comments: Comment[]) => void,
  hata: (e: Error) => void
): Unsubscribe {
  return onSnapshot(
    yorumlarRef,
    (snap) => basarili(snap.docs.map((d) => ({ ...(d.data() as Omit<Comment, 'id'>), id: d.id }))),
    hata
  );
}

export function kullaniciEkle(user: User) {
  const { id, ...veri } = user;
  return setDoc(doc(kullanicilarRef, id), veri);
}

export function kullaniciGuncelle(userId: string, degisiklik: Partial<Omit<User, 'id'>>) {
  return updateDoc(doc(kullanicilarRef, userId), degisiklik);
}

export function kullaniciSil(userId: string) {
  return deleteDoc(doc(kullanicilarRef, userId));
}

export function gonderiEkle(post: Post) {
  const { id, ...veri } = post;
  return setDoc(doc(gonderilerRef, id), veri);
}

export function gonderiGuncelle(postId: string, degisiklik: Partial<Omit<Post, 'id'>>) {
  return updateDoc(doc(gonderilerRef, postId), degisiklik);
}

export function yorumEkle(comment: Comment) {
  const { id, ...veri } = comment;
  return setDoc(doc(yorumlarRef, id), veri);
}

/** İlk hiç kullanıcı yoksa (yeni Firebase projesi) demo/seed veri eklemek için. */
export async function tohumVeriGerekliMi(): Promise<boolean> {
  const snap = await getDocs(query(kullanicilarRef, limit(1)));
  return snap.empty;
}
