import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import { create } from "zustand";

type VendorFilterState = {
  search: string;
  areaKey: string | null;
  category: string | null;
  city: string | null;
  verifiedOnly: boolean;
  availableNowOnly: boolean;
  sort: VendorCatalogSort;
  setSearch: (search: string) => void;
  setAreaKey: (areaKey: string | null) => void;
  setCategory: (category: string | null) => void;
  setCity: (city: string | null) => void;
  setVerifiedOnly: (verifiedOnly: boolean) => void;
  setAvailableNowOnly: (availableNowOnly: boolean) => void;
  setSort: (sort: VendorCatalogSort) => void;
  clearFilters: () => void;
};

const initial = {
  search: "",
  areaKey: null as string | null,
  category: null as string | null,
  city: null as string | null,
  verifiedOnly: false,
  availableNowOnly: false,
  sort: "recommended" as VendorCatalogSort,
};

export const useVendorFilterStore = create<VendorFilterState>((set) => ({
  ...initial,
  setSearch: (search) => set({ search }),
  setAreaKey: (areaKey) => set({ areaKey }),
  setCategory: (category) => set({ category }),
  setCity: (city) => set({ city }),
  setVerifiedOnly: (verifiedOnly) => set({ verifiedOnly }),
  setAvailableNowOnly: (availableNowOnly) => set({ availableNowOnly }),
  setSort: (sort) => set({ sort }),
  clearFilters: () => set({ ...initial }),
}));
