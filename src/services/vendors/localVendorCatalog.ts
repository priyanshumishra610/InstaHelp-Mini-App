import { ALL_VENDOR_ROWS, queryIndexedCatalog } from "./vendorCatalogIndex";
import type { VendorCatalogPort, VendorCatalogQuery } from "./vendorCatalogTypes";
import type { VendorRecord } from "@/types/vendorMarketplace";

export class LocalJsonVendorCatalog implements VendorCatalogPort {
  readonly source = "local_json" as const;

  getAll(): VendorRecord[] {
    return ALL_VENDOR_ROWS;
  }

  getById(id: string): VendorRecord | undefined {
    return ALL_VENDOR_ROWS.find((r) => r.id === id);
  }

  query(input: VendorCatalogQuery): VendorRecord[] {
    return queryIndexedCatalog(input);
  }
}
