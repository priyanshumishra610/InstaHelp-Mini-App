export type VendorCatalogSource = "local_json";

/** Vendor catalog always loads from bundled local JSON/CSV. */
export function getVendorCatalogSource(): VendorCatalogSource {
  return "local_json";
}
