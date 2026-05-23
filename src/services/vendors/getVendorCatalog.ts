import { getVendorCatalogSource } from "@/firebase/config";
import { LocalJsonVendorCatalog } from "./localVendorCatalog";
import type { VendorCatalogPort } from "./vendorCatalogTypes";

let singleton: VendorCatalogPort | null = null;

/**
 * Local JSON catalog — used as offline fallback when Firestore is unavailable.
 * Live screens should prefer `useVendors` / `useVendor` hooks for real-time data.
 */
export function getVendorCatalog(): VendorCatalogPort {
  singleton ??= new LocalJsonVendorCatalog();
  return singleton;
}

export function getActiveCatalogSource() {
  return getVendorCatalogSource();
}
