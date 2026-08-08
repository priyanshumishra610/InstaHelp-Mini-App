import type { VendorSponsorTier } from "@/types/vendorMarketplace";

/** ISO string or epoch ms — kept generic after Firebase removal. */
export type CatalogTimestamp = string | number | null;

/** Firestore `vendors/{id}` document shape (admin-friendly field names). */
export type FirestoreVendorDoc = {
  id: string;
  name: string;
  businessName?: string;
  category: string;
  subCategory: string;
  city: string;
  area: string;
  areaKey: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  description: string;
  images: string[];
  pricing: {
    startingPrice: number | null;
    currency: string;
  };
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  /** Lowercased tokens for `array-contains` search queries. */
  searchTokens: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  sponsorTier: VendorSponsorTier;
  listingBoost: number;
  operationalStatus: string | null;
  state?: string;
  createdAt: CatalogTimestamp;
  updatedAt: CatalogTimestamp;
};

export type FirestoreCategoryDoc = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subtitle?: string;
  order: number;
  active: boolean;
};

export type FirestoreServiceDoc = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  icon: string;
  trending: boolean;
  popular: boolean;
  order: number;
  active: boolean;
  formServiceId?: string;
};

export type FirestoreFeaturedVendorDoc = {
  id: string;
  vendorId: string;
  order: number;
  active: boolean;
};
