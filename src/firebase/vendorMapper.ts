import type { FirestoreVendorDoc } from "@/types/firestore";
import type { VendorRecord } from "@/types/vendorMarketplace";
import type { DocumentData } from "firebase/firestore";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNullableString(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

/** Normalize legacy CSV rows or partial Firestore payloads into `FirestoreVendorDoc`. */
export function normalizeFirestoreVendor(
  id: string,
  raw: DocumentData,
): FirestoreVendorDoc {
  const pricingRaw = raw.pricing as Record<string, unknown> | undefined;
  const coordsRaw = raw.coordinates as Record<string, unknown> | null | undefined;

  const lat =
    coordsRaw?.latitude ?? coordsRaw?.lat ?? raw.latitude ?? raw.lat;
  const lng =
    coordsRaw?.longitude ?? coordsRaw?.lng ?? raw.longitude ?? raw.lng;

  const latN = lat != null ? asNumber(lat, NaN) : NaN;
  const lngN = lng != null ? asNumber(lng, NaN) : NaN;
  const coordinates =
    Number.isFinite(latN) &&
    Number.isFinite(lngN) &&
    latN >= -90 &&
    latN <= 90 &&
    lngN >= -180 &&
    lngN <= 180
      ? { latitude: latN, longitude: lngN }
      : null;

  const images = asStringArray(raw.images);
  const profileLegacy = asNullableString(raw.profileImageUrl);
  const shopLegacy = asNullableString(raw.shopImageUrls);
  if (!images.length && profileLegacy) images.push(profileLegacy);
  if (shopLegacy) {
    shopLegacy
      .split(/[;,|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((url) => images.push(url));
  }

  const name =
    asString(raw.name) ||
    asString(raw.businessName) ||
    asString(raw.vendorName) ||
    "Vendor";

  return {
    id,
    name,
    businessName: asString(raw.businessName) || undefined,
    category: asString(raw.category, "General"),
    subCategory: asString(raw.subCategory),
    city: asString(raw.city, "Bengaluru"),
    area: asString(raw.area) || asString(raw.areaLabel),
    areaKey: asString(raw.areaKey, "bangalore"),
    address: asString(raw.address),
    phone: asNullableString(raw.phone),
    whatsapp: asNullableString(raw.whatsapp),
    email: asNullableString(raw.email),
    description:
      asString(raw.description) || asString(raw.servicesText),
    images,
    pricing: {
      startingPrice: (() => {
        const rawPrice =
          pricingRaw?.startingPrice != null
            ? asNumber(pricingRaw.startingPrice, NaN)
            : raw.startingPrice != null
              ? asNumber(raw.startingPrice, NaN)
              : NaN;
        return Number.isFinite(rawPrice) ? rawPrice : null;
      })(),
      currency: asString(pricingRaw?.currency ?? raw.currency, "INR"),
    },
    rating: asNumber(raw.rating),
    totalReviews: Math.max(
      0,
      Math.floor(asNumber(raw.totalReviews ?? raw.reviewCount)),
    ),
    isVerified: Boolean(raw.isVerified),
    isFeatured: Boolean(raw.isFeatured),
    isActive: raw.isActive !== false,
    tags: asStringArray(raw.tags),
    searchTokens: asStringArray(raw.searchTokens),
    coordinates,
    sponsorTier:
      raw.sponsorTier === "featured" || raw.sponsorTier === "standard"
        ? raw.sponsorTier
        : raw.isFeatured
          ? "featured"
          : "none",
    listingBoost: asNumber(raw.listingBoost),
    operationalStatus: asNullableString(raw.operationalStatus ?? raw.status),
    state: asString(raw.state) || undefined,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export function mapFirestoreVendorToRecord(doc: FirestoreVendorDoc): VendorRecord {
  const profileImageUrl = doc.images[0] ?? null;
  const shopImageUrls =
    doc.images.length > 1 ? doc.images.slice(1).join(";") : null;

  const startingPrice =
    doc.pricing.startingPrice != null &&
    Number.isFinite(doc.pricing.startingPrice)
      ? doc.pricing.startingPrice
      : null;

  const cityKey = doc.areaKey.includes("__")
    ? doc.areaKey.split("__")[0]!
    : doc.city
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "other";

  return {
    id: doc.id,
    vendorName: doc.name,
    businessName: doc.businessName?.trim() || doc.name,
    address: doc.address,
    areaKey: doc.areaKey,
    areaLabel: doc.area,
    cityKey,
    city: doc.city,
    state: doc.state ?? "",
    phone: doc.phone,
    email: doc.email,
    category: doc.category,
    subCategory: doc.subCategory,
    servicesText: doc.description,
    profileImageUrl,
    shopImageUrls,
    startingPrice,
    currency: doc.pricing.currency || "INR",
    rating: doc.rating,
    reviewCount: doc.totalReviews,
    isVerified: doc.isVerified,
    operationalStatus: doc.operationalStatus,
    coordinates: doc.coordinates
      ? { lat: doc.coordinates.latitude, lng: doc.coordinates.longitude }
      : null,
    sponsorTier: doc.sponsorTier,
    listingBoost: doc.listingBoost,
  };
}

export function buildSearchTokens(input: {
  name: string;
  businessName?: string;
  category: string;
  subCategory: string;
  area: string;
  city: string;
  description: string;
  tags: string[];
}): string[] {
  const blob = [
    input.name,
    input.businessName,
    input.category,
    input.subCategory,
    input.area,
    input.city,
    input.description,
    ...input.tags,
  ]
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const tokens = new Set<string>();
  for (const word of blob.split(/[^a-z0-9]+/)) {
    if (word.length < 2) continue;
    tokens.add(word);
    if (word.length >= 4) {
      tokens.add(word.slice(0, 4));
    }
  }
  return Array.from(tokens).slice(0, 450);
}

export function vendorRecordToFirestoreDoc(
  record: VendorRecord,
  extra?: Partial<FirestoreVendorDoc>,
): Omit<FirestoreVendorDoc, "createdAt" | "updatedAt"> {
  const images: string[] = [];
  if (record.profileImageUrl) images.push(record.profileImageUrl);
  if (record.shopImageUrls) {
    record.shopImageUrls
      .split(/[;,|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((url) => images.push(url));
  }

  const name =
    (record.businessName ?? "").trim() || (record.vendorName ?? "").trim();
  const tags = extra?.tags ?? [];
  const description = record.servicesText ?? "";

  return {
    id: record.id,
    name,
    businessName: record.businessName,
    category: record.category,
    subCategory: record.subCategory,
    city: record.city,
    area: record.areaLabel,
    areaKey: record.areaKey,
    address: record.address,
    phone: record.phone,
    whatsapp: extra?.whatsapp ?? record.phone,
    email: record.email,
    description,
    images,
    pricing: {
      startingPrice: record.startingPrice,
      currency: record.currency,
    },
    rating: record.rating,
    totalReviews: record.reviewCount,
    isVerified: record.isVerified,
    isFeatured: record.sponsorTier === "featured",
    isActive: true,
    tags,
    searchTokens: buildSearchTokens({
      name,
      businessName: record.businessName,
      category: record.category,
      subCategory: record.subCategory,
      area: record.areaLabel,
      city: record.city,
      description,
      tags,
    }),
    coordinates: record.coordinates
      ? {
          latitude: record.coordinates.lat,
          longitude: record.coordinates.lng,
        }
      : null,
    sponsorTier: record.sponsorTier,
    listingBoost: record.listingBoost,
    operationalStatus: record.operationalStatus,
    state: record.state,
    ...extra,
  };
}
