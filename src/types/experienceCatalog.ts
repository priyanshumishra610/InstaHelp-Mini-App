import type { ResortCatalogMeta, ResortRecord } from "@/types/resortExperience";

export type HolidayPackage = {
  id: string;
  title: string;
  country: string;
  region: string;
  destination: string;
  duration: string;
  durationDays: number | null;
  priceFrom: string;
  budgetTier: string | null;
  theme: string;
  tripStyle: string | null;
  highlights: string[];
  vibe: string;
  imageUrls: string[];
  bestMonths: string | null;
  visaType: string | null;
  rating: number | null;
};

export type CountryDestination = {
  id: string;
  name: string;
  slug: string;
  status: string;
  featured: boolean;
  displayOrder: number;
  region: string;
  bestFor: string;
  startingFrom: string;
  tags: string[];
  description: string | null;
  imageUrl: string | null;
  bestMonths: string | null;
  visaType: string | null;
};

export type ExperienceCatalogCache = {
  resorts: ResortRecord[];
  resortMeta: ResortCatalogMeta | null;
  holidays: HolidayPackage[];
  countries: CountryDestination[];
  last_fetched_at: string | null;
  resorts_fingerprint: string | null;
  holidays_fingerprint: string | null;
  countries_fingerprint: string | null;
  cache_version: number;
};
