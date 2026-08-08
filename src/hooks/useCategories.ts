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
  const [categories, setCategories] = useState<FirestoreCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setCategories(discoveryToCategories());
    setLoading(false);
    setError(null);
  }, []);

  return { categories, loading, error };
}

export function useTrendingServices(max = 12) {
  const [services, setServices] = useState<FirestoreServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setServices(discoveryToTrending().slice(0, max));
    setLoading(false);
    setError(null);
  }, [max]);

  return { services, loading, error };
}

/** Map category docs to discovery layout for home chips. */
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
