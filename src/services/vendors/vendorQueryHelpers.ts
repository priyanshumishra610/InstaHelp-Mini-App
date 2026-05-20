import type { VendorRecord } from "@/types/vendorMarketplace";

export function vendorDisplayName(v: VendorRecord): string {
  const b = v.businessName.trim();
  const n = v.vendorName.trim();
  return (b.length ? b : n).trim();
}

export function vendorMatchesArea(
  v: VendorRecord,
  areaKey: string | null,
): boolean {
  if (!areaKey) return true;
  return v.areaKey === areaKey;
}

export function vendorMatchesSearch(v: VendorRecord, q: string): boolean {
  if (!q) return true;
  const hay = [
    v.vendorName,
    v.businessName,
    v.category,
    v.subCategory,
    v.servicesText,
    v.areaLabel,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/** Heuristic: Bing-style “Closed · …” lines mean not available right now. */
export function vendorAvailableNow(v: VendorRecord): boolean {
  const t = v.servicesText.toLowerCase();
  if (t.includes("closed")) return false;
  if (t.includes("opens at")) return false;
  if (t.includes("opens tomorrow")) return false;
  return true;
}

type RankCtx = {
  primary: "recommended" | "distance" | "rating" | "reviews";
  distanceOf: (v: VendorRecord) => number | null;
};

function tierWeight(t: VendorRecord["sponsorTier"]): number {
  if (t === "featured") return 2;
  if (t === "standard") return 1;
  return 0;
}

/**
 * Multi-signal ordering: future sponsored rows, distance, rating, verification, reviews.
 */
export function compareVendorRank(a: VendorRecord, b: VendorRecord, ctx: RankCtx): number {
  if (b.listingBoost !== a.listingBoost) {
    return b.listingBoost - a.listingBoost;
  }
  const tw = tierWeight(b.sponsorTier) - tierWeight(a.sponsorTier);
  if (tw !== 0) return tw;

  const da = ctx.distanceOf(a);
  const db = ctx.distanceOf(b);

  if (ctx.primary === "distance") {
    if (da != null && db != null && da !== db) return da - db;
    if (da != null && db == null) return -1;
    if (da == null && db != null) return 1;
  }

  if (ctx.primary === "rating") {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
  } else if (ctx.primary === "reviews") {
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    if (b.rating !== a.rating) return b.rating - a.rating;
  } else if (ctx.primary === "recommended") {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    if (da != null && db != null && da !== db) return da - db;
  }

  if (b.isVerified !== a.isVerified) {
    return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
  }

  if (ctx.primary !== "distance" && da != null && db != null && da !== db) {
    return da - db;
  }

  return vendorDisplayName(a).localeCompare(vendorDisplayName(b));
}
