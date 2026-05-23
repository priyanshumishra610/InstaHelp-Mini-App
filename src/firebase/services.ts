import { COLLECTIONS, getFirestoreDb } from "@/firebase/config";
import type {
  FirestoreCategoryDoc,
  FirestoreFeaturedVendorDoc,
  FirestoreServiceDoc,
} from "@/types/firestore";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

function mapCategory(id: string, raw: DocumentData): FirestoreCategoryDoc {
  return {
    id,
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? id),
    icon: String(raw.icon ?? "grid-outline"),
    subtitle: raw.subtitle ? String(raw.subtitle) : undefined,
    order: Number(raw.order ?? 0),
    active: raw.active !== false,
  };
}

function mapService(id: string, raw: DocumentData): FirestoreServiceDoc {
  return {
    id,
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? id),
    categoryId: String(raw.categoryId ?? ""),
    icon: String(raw.icon ?? "construct-outline"),
    trending: Boolean(raw.trending),
    popular: Boolean(raw.popular),
    order: Number(raw.order ?? 0),
    active: raw.active !== false,
    formServiceId: raw.formServiceId
      ? String(raw.formServiceId)
      : undefined,
  };
}

export async function fetchCategories(): Promise<FirestoreCategoryDoc[]> {
  const q = query(
    collection(getFirestoreDb(), COLLECTIONS.categories),
    where("active", "==", true),
    orderBy("order", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapCategory(d.id, d.data()));
}

export function subscribeCategories(
  onData: (categories: FirestoreCategoryDoc[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), COLLECTIONS.categories),
    where("active", "==", true),
    orderBy("order", "asc"),
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapCategory(d.id, d.data()))),
    (err) => onError(err),
  );
}

export async function fetchTrendingServices(
  max = 12,
): Promise<FirestoreServiceDoc[]> {
  const q = query(
    collection(getFirestoreDb(), COLLECTIONS.services),
    where("active", "==", true),
    where("trending", "==", true),
    orderBy("order", "asc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapService(d.id, d.data()));
}

export function subscribeTrendingServices(
  max: number,
  onData: (services: FirestoreServiceDoc[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), COLLECTIONS.services),
    where("active", "==", true),
    where("trending", "==", true),
    orderBy("order", "asc"),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapService(d.id, d.data()))),
    (err) => onError(err),
  );
}

export async function fetchFeaturedVendorRefs(): Promise<
  FirestoreFeaturedVendorDoc[]
> {
  const q = query(
    collection(getFirestoreDb(), COLLECTIONS.featuredVendors),
    where("active", "==", true),
    orderBy("order", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    vendorId: String(d.data().vendorId ?? ""),
    order: Number(d.data().order ?? 0),
    active: d.data().active !== false,
  }));
}
