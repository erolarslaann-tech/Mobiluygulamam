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

/**
 * Firestore, bir alana `undefined` değeri yazılmasına izin vermez (hata
 * fırlatır). Formlarda boş bırakılan opsiyonel alanlar (ör. konum,
 * detaylar) `undefined` olarak gelebildiği için, yazmadan önce bu
 * alanları nesneden tamamen çıkarıyoruz.
 */
function undefinedAlanlariCikar<T extends Record<string, unknown>>(veri: T): T {
  const sonuc = { ...veri };
  for (const anahtar of Object.keys(sonuc)) {
    if (sonuc[anahtar] === undefined) delete sonuc[anahtar];
  }
  return sonuc;
}

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
  return setDoc(doc(kullanicilarRef, id), undefinedAlanlariCikar(veri));
}

export function kullaniciGuncelle(userId: string, degisiklik: Partial<Omit<User, 'id'>>) {
  return updateDoc(doc(kullanicilarRef, userId), undefinedAlanlariCikar(degisiklik));
}

export function kullaniciSil(userId: string) {
  return deleteDoc(doc(kullanicilarRef, userId));
}

export function gonderiEkle(post: Post) {
  const { id, ...veri } = post;
  return setDoc(doc(gonderilerRef, id), undefinedAlanlariCikar(veri));
}

export function gonderiGuncelle(postId: string, degisiklik: Partial<Omit<Post, 'id'>>) {
  return updateDoc(doc(gonderilerRef, postId), undefinedAlanlariCikar(degisiklik));
}

export function yorumEkle(comment: Comment) {
  const { id, ...veri } = comment;
  return setDoc(doc(yorumlarRef, id), undefinedAlanlariCikar(veri));
}

/** İlk hiç kullanıcı yoksa (yeni Firebase projesi) demo/seed veri eklemek için. */
export async function tohumVeriGerekliMi(): Promise<boolean> {
  const snap = await getDocs(query(kullanicilarRef, limit(1)));
  return snap.empty;
}
