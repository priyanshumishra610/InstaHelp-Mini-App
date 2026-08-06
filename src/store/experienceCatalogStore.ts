import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { EXPERIENCE_CACHE_VERSION } from "@/config/experienceSheets";
import type {
  CountryDestination,
  ExperienceCatalogCache,
  HolidayPackage,
} from "@/types/experienceCatalog";
import type { ResortCatalogMeta, ResortRecord } from "@/types/resortExperience";

type ExperienceCatalogState = ExperienceCatalogCache & {
  isSyncing: boolean;
  fetchFailed: boolean;
  setCatalog: (payload: {
    resorts: ResortRecord[];
    resortMeta: ResortCatalogMeta;
    holidays: HolidayPackage[];
    countries: CountryDestination[];
    resortsFingerprint: string;
    holidaysFingerprint: string;
    countriesFingerprint: string;
    fetchedAt: string;
  }) => void;
  setIsSyncing: (v: boolean) => void;
  setFetchFailed: (v: boolean) => void;
};

const emptyCache: ExperienceCatalogCache = {
  resorts: [],
  resortMeta: null,
  holidays: [],
  countries: [],
  last_fetched_at: null,
  resorts_fingerprint: null,
  holidays_fingerprint: null,
  countries_fingerprint: null,
  cache_version: EXPERIENCE_CACHE_VERSION,
};

export const useExperienceCatalogStore = create<ExperienceCatalogState>()(
  persist(
    (set) => ({
      ...emptyCache,
      isSyncing: false,
      fetchFailed: false,
      setCatalog: ({
        resorts,
        resortMeta,
        holidays,
        countries,
        resortsFingerprint,
        holidaysFingerprint,
        countriesFingerprint,
        fetchedAt,
      }) =>
        set({
          resorts,
          resortMeta,
          holidays,
          countries,
          resorts_fingerprint: resortsFingerprint,
          holidays_fingerprint: holidaysFingerprint,
          countries_fingerprint: countriesFingerprint,
          last_fetched_at: fetchedAt,
          cache_version: EXPERIENCE_CACHE_VERSION,
        }),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setFetchFailed: (fetchFailed) => set({ fetchFailed }),
    }),
    {
      name: "instahelp-experience-catalog",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        resorts: s.resorts,
        resortMeta: s.resortMeta,
        holidays: s.holidays,
        countries: s.countries,
        last_fetched_at: s.last_fetched_at,
        resorts_fingerprint: s.resorts_fingerprint,
        holidays_fingerprint: s.holidays_fingerprint,
        countries_fingerprint: s.countries_fingerprint,
        cache_version: s.cache_version,
      }),
    },
  ),
);
