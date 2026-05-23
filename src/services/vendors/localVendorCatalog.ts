import type { VendorRecord } from "@/types/vendorMarketplace";
import {
  compareVendorRank,
  vendorAvailableNow,
  vendorMatchesArea,
  vendorMatchesSearch,
} from "./vendorQueryHelpers";
import { haversineKm } from "./vendorGeo";
import type { VendorCatalogPort, VendorCatalogQuery } from "./vendorCatalogTypes";

import RAW from "@/data/bangalore-vendors.json";

const ROWS = RAW as VendorRecord[];

function distanceKey(
  v: VendorRecord,
  user: { lat: number; lng: number } | null,
): number | null {
  if (!user || !v.coordinates) return null;
  return haversineKm(user, v.coordinates);
}

export class LocalJsonVendorCatalog implements VendorCatalogPort {
  readonly source = "local_json" as const;

  getAll(): VendorRecord[] {
    return ROWS;
  }

  getById(id: string): VendorRecord | undefined {
    return ROWS.find((r) => r.id === id);
  }

  query(input: VendorCatalogQuery): VendorRecord[] {
    const q = input.search.trim().toLowerCase();

    let list = ROWS.filter((v) => vendorMatchesArea(v, input.areaKey)).filter(
      (v) => vendorMatchesSearch(v, q),
    );

    if (input.category?.trim()) {
      const cat = input.category.trim().toLowerCase();
      list = list.filter((v) => v.category.trim().toLowerCase() === cat);
    }

    if (input.verifiedOnly) {
      list = list.filter((v) => v.isVerified);
    }

    if (input.availableNowOnly) {
      list = list.filter((v) => vendorAvailableNow(v));
    }

    const user = input.userLocation;

    switch (input.sort) {
      case "distance":
        return [...list].sort((a, b) =>
          compareVendorRank(a, b, {
            primary: "distance",
            distanceOf: (v) => distanceKey(v, user),
          }),
        );
      case "rating":
        return [...list].sort((a, b) =>
          compareVendorRank(a, b, {
            primary: "rating",
            distanceOf: (v) => distanceKey(v, user),
          }),
        );
      case "reviews":
        return [...list].sort((a, b) =>
          compareVendorRank(a, b, {
            primary: "reviews",
            distanceOf: (v) => distanceKey(v, user),
          }),
        );
      default:
        return [...list].sort((a, b) =>
          compareVendorRank(a, b, {
            primary: "recommended",
            distanceOf: (v) => distanceKey(v, user),
          }),
        );
    }
  }
}

