/**
 * Abstraction for listing vendors. Swap implementation for Supabase/Postgres later.
 */
import type { VendorRecord } from "@/types/vendorMarketplace";

export type VendorCatalogQuery = {
  search: string;
  areaKey: string | null;
  category?: string | null;
  verifiedOnly: boolean;
  availableNowOnly: boolean;
  sort: VendorCatalogSort;
  userLocation: { lat: number; lng: number } | null;
};

export type VendorCatalogSort =
  | "recommended"
  | "distance"
  | "rating"
  | "reviews";

export interface VendorCatalogPort {
  readonly source: "local_json" | "firestore" | "remote_api";
  getAll(): VendorRecord[];
  query(input: VendorCatalogQuery): VendorRecord[];
  getById(id: string): VendorRecord | undefined;
}
