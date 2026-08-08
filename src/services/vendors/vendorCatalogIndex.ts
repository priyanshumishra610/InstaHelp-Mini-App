import type { VendorRecord } from "@/types/vendorMarketplace";
import {
  compareVendorRank,
  vendorAvailableNow,
  vendorMatchesArea,
  vendorMatchesCity,
  vendorMatchesSearch,
} from "./vendorQueryHelpers";
import { haversineKm } from "./vendorGeo";
import type { VendorCatalogQuery, VendorCatalogSort } from "./vendorCatalogTypes";

import RAW from "@/data/all-vendors.json";

export const ALL_VENDOR_ROWS = RAW as VendorRecord[];

type IndexMaps = {
  byArea: Map<string, VendorRecord[]>;
  byCity: Map<string, VendorRecord[]>;
  byCategory: Map<string, VendorRecord[]>;
  recommendedSorted: VendorRecord[];
  ratingSorted: VendorRecord[];
  reviewsSorted: VendorRecord[];
};

function pushToMap(map: Map<string, VendorRecord[]>, key: string, row: VendorRecord) {
  const bucket = map.get(key);
  if (bucket) {
    bucket.push(row);
  } else {
    map.set(key, [row]);
  }
}

function sortByMode(
  rows: VendorRecord[],
  sort: VendorCatalogSort,
  user: { lat: number; lng: number } | null,
): VendorRecord[] {
  const distanceOf = (v: VendorRecord) => {
    if (!user || !v.coordinates) return null;
    return haversineKm(user, v.coordinates);
  };

  switch (sort) {
    case "distance":
      return [...rows].sort((a, b) =>
        compareVendorRank(a, b, { primary: "distance", distanceOf }),
      );
    case "rating":
      return [...rows].sort((a, b) =>
        compareVendorRank(a, b, { primary: "rating", distanceOf }),
      );
    case "reviews":
      return [...rows].sort((a, b) =>
        compareVendorRank(a, b, { primary: "reviews", distanceOf }),
      );
    default:
      return [...rows].sort((a, b) =>
        compareVendorRank(a, b, { primary: "recommended", distanceOf }),
      );
  }
}

function buildIndex(): IndexMaps {
  const byArea = new Map<string, VendorRecord[]>();
  const byCity = new Map<string, VendorRecord[]>();
  const byCategory = new Map<string, VendorRecord[]>();

  for (const row of ALL_VENDOR_ROWS) {
    pushToMap(byArea, row.areaKey, row);
    pushToMap(byCity, row.cityKey, row);
    const cat = row.category.trim().toLowerCase() || "general";
    pushToMap(byCategory, cat, row);
  }

  const distanceOf = () => null;

  return {
    byArea,
    byCity,
    byCategory,
    recommendedSorted: [...ALL_VENDOR_ROWS].sort((a, b) =>
      compareVendorRank(a, b, { primary: "recommended", distanceOf }),
    ),
    ratingSorted: [...ALL_VENDOR_ROWS].sort((a, b) =>
      compareVendorRank(a, b, { primary: "rating", distanceOf }),
    ),
    reviewsSorted: [...ALL_VENDOR_ROWS].sort((a, b) =>
      compareVendorRank(a, b, { primary: "reviews", distanceOf }),
    ),
  };
}

const INDEX = buildIndex();

function narrowPool(input: VendorCatalogQuery): VendorRecord[] {
  const { areaKey, cityKey, category } = input;

  if (areaKey) {
    return INDEX.byArea.get(areaKey) ?? [];
  }

  if (category?.trim()) {
    const cat = category.trim().toLowerCase();
    return INDEX.byCategory.get(cat) ?? [];
  }

  if (cityKey) {
    return INDEX.byCity.get(cityKey) ?? [];
  }

  return ALL_VENDOR_ROWS;
}

function hasExtraFilters(input: VendorCatalogQuery): boolean {
  const q = input.search.trim();
  return (
    Boolean(q) ||
    Boolean(input.areaKey && input.cityKey) ||
    Boolean(input.category?.trim() && (input.areaKey || input.cityKey)) ||
    input.verifiedOnly ||
    input.availableNowOnly ||
    input.sort === "distance"
  );
}

/** Indexed vendor query — narrows candidate set before filter/sort. */
export function queryIndexedCatalog(input: VendorCatalogQuery): VendorRecord[] {
  const q = input.search.trim().toLowerCase();
  const cat = input.category?.trim().toLowerCase();

  if (
    !q &&
    !input.areaKey &&
    !input.cityKey &&
    !cat &&
    !input.verifiedOnly &&
    !input.availableNowOnly
  ) {
    switch (input.sort) {
      case "rating":
        return input.userLocation
          ? sortByMode(INDEX.ratingSorted, "rating", input.userLocation)
          : INDEX.ratingSorted;
      case "reviews":
        return input.userLocation
          ? sortByMode(INDEX.reviewsSorted, "reviews", input.userLocation)
          : INDEX.reviewsSorted;
      case "distance":
        return sortByMode(ALL_VENDOR_ROWS, "distance", input.userLocation);
      default:
        return input.userLocation
          ? sortByMode(INDEX.recommendedSorted, "recommended", input.userLocation)
          : INDEX.recommendedSorted;
    }
  }

  let list = narrowPool(input);

  if (input.areaKey) {
    list = list.filter((v) => vendorMatchesArea(v, input.areaKey));
  }
  if (input.cityKey) {
    list = list.filter((v) => vendorMatchesCity(v, input.cityKey ?? null));
  }
  if (cat) {
    list = list.filter((v) => v.category.trim().toLowerCase() === cat);
  }
  if (q) {
    list = list.filter((v) => vendorMatchesSearch(v, q));
  }
  if (input.verifiedOnly) {
    list = list.filter((v) => v.isVerified);
  }
  if (input.availableNowOnly) {
    list = list.filter((v) => vendorAvailableNow(v));
  }

  if (!hasExtraFilters(input) && list.length === ALL_VENDOR_ROWS.length) {
    switch (input.sort) {
      case "rating":
        return INDEX.ratingSorted;
      case "reviews":
        return INDEX.reviewsSorted;
      case "distance":
        return sortByMode(list, "distance", input.userLocation);
      default:
        return INDEX.recommendedSorted;
    }
  }

  return sortByMode(list, input.sort, input.userLocation);
}
