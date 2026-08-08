import { getVendorCatalogSource } from "@/config/catalog";
import { LocalJsonVendorCatalog } from "./localVendorCatalog";
import type { VendorCatalogPort } from "./vendorCatalogTypes";

let singleton: VendorCatalogPort | null = null;

/**
 * Local JSON catalog — bundled vendor data for offline explore.
 */
export function getVendorCatalog(): VendorCatalogPort {
  singleton ??= new LocalJsonVendorCatalog();
  return singleton;
}

export function getActiveCatalogSource() {
  return getVendorCatalogSource();
}
