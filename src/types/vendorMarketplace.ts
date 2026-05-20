/**
 * Shared vendor marketplace types. Shapes mirror `bangalore-vendors.json` rows
 * and are suitable for future API/Supabase mapping.
 */

export type VendorSponsorTier = "none" | "standard" | "featured";

export type VendorCoordinates = {
  lat: number;
  lng: number;
};

export type VendorRecord = {
  id: string;
  vendorName: string;
  businessName: string;
  /** Sensitive: only surface in UI after owner has spent credits to reveal. */
  address: string;
  areaKey: string;
  areaLabel: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  category: string;
  subCategory: string;
  servicesText: string;
  profileImageUrl: string | null;
  shopImageUrls: string | null;
  startingPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  operationalStatus: string | null;
  coordinates: VendorCoordinates | null;
  sponsorTier: VendorSponsorTier;
  /** Future: boosted placement in feeds / search. */
  listingBoost: number;
};

export type CreditTransactionKind =
  | "credit_add"
  | "credit_deduct"
  | "adjustment";

export type CreditTransaction = {
  id: string;
  createdAt: number;
  kind: CreditTransactionKind;
  /** Positive for grants, negative for spend. */
  delta: number;
  balanceAfter: number;
  vendorId?: string;
  note: string;
};

export type VendorCatalogSource = "local_json" | "remote_api";

export type VendorSortContext = {
  userLocation: VendorCoordinates | null;
  preferDistance: boolean;
  preferTopRated: boolean;
};
