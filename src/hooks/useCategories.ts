import { subscribeCategories, subscribeTrendingServices } from "@/firebase/services";
import { useFirestoreCatalog } from "@/firebase/config";
import { DISCOVERY_CATEGORIES } from "@/constants/discoveryCategories";
import type { FirestoreCategoryDoc, FirestoreServiceDoc } from "@/types/firestore";
import type { DiscoveryCategory } from "@/types/discovery";
import { useEffect, useState } from "react";

function discoveryToCategories(): FirestoreCategoryDoc[] {
  return DISCOVERY_CATEGORIES.map((c, i) => ({
    id: c.id,
    name: c.title,
    slug: c.id,
    icon: c.services[0]?.icon ?? "grid-outline",
    subtitle: c.subtitle,
    order: i,
    active: true,
  }));
}

function discoveryToTrending(): FirestoreServiceDoc[] {
  const rows: FirestoreServiceDoc[] = [];
  let order = 0;
  for (const cat of DISCOVERY_CATEGORIES) {
    for (const svc of cat.services) {
      if (!svc.popular && !svc.recommended) continue;
      rows.push({
        id: svc.id,
        name: svc.label,
        slug: svc.id,
        categoryId: cat.id,
        icon: svc.icon,
        trending: true,
        popular: Boolean(svc.popular),
        order: order++,
        active: true,
        formServiceId: svc.formServiceId,
      });
      if (rows.length >= 12) return rows;
    }
  }
  return rows;
}

export function useCategories() {
  const firestore = useFirestoreCatalog();
  const [categories, setCategories] = useState<FirestoreCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      setCategories(discoveryToCategories());
      setLoading(false);
      return;
    }

    const unsub = subscribeCategories(
      (rows) => {
        setCategories(rows.length ? rows : discoveryToCategories());
        setLoading(false);
        setError(null);
      },
      (err) => {
        setCategories(discoveryToCategories());
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [firestore]);

  return { categories, loading, error };
}

export function useTrendingServices(max = 12) {
  const firestore = useFirestoreCatalog();
  const [services, setServices] = useState<FirestoreServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      setServices(discoveryToTrending());
      setLoading(false);
      return;
    }

    const unsub = subscribeTrendingServices(
      max,
      (rows) => {
        setServices(rows.length ? rows : discoveryToTrending());
        setLoading(false);
        setError(null);
      },
      (err) => {
        setServices(discoveryToTrending());
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [firestore, max]);

  return { services, loading, error };
}

/** Map Firestore categories to discovery layout for home chips. */
export function toDiscoveryCategories(
  categories: FirestoreCategoryDoc[],
): DiscoveryCategory[] {
  return categories.map((c) => ({
    id: c.slug || c.id,
    title: c.name,
    subtitle: c.subtitle ?? "",
    services: [],
  }));
}
