export type ResortPriceTier = "High" | "Mid" | "Low" | string;

export type ResortRecord = {
  id: string;
  name: string;
  rank: number | null;
  region: string;
  roomQuality: string | null;
  destinationTier: string | null;
  priceTier: ResortPriceTier | null;
  state: string;
  location: string;
  category: string | null;
  estimatedPriceLabel: string | null;
  experienceTypes: string[];
  roomTypes: string[];
  websiteUrl: string | null;
  tripadvisorRating: number | null;
  imageUrls: string[];
};

export type ResortCatalogMeta = {
  total: number;
  states: { state: string; count: number }[];
  regions: { region: string; count: number }[];
  categories: { category: string; count: number }[];
  updatedAt: string;
};
