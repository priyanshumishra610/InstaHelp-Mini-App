import type {
  CountryDestination,
  HolidayPackage,
} from "@/types/experienceCatalog";

/** Offline fallback until the first Google Sheet sync succeeds. */
export const FALLBACK_HOLIDAYS: HolidayPackage[] = [
  {
    id: "h-kerala-backwaters",
    title: "Kerala Backwaters Escape",
    country: "India",
    region: "Kerala",
    destination: "India · Kerala",
    duration: "5D / 4N",
    durationDays: 5,
    priceFrom: "From ₹28,000",
    budgetTier: "Mid",
    theme: "Slow & scenic",
    tripStyle: "Private Tour",
    highlights: ["Houseboat stay", "Ayurveda spa", "Local cuisine"],
    vibe: "Slow & scenic",
    imageUrls: [],
    bestMonths: "Oct – Mar",
    visaType: null,
    rating: null,
  },
  {
    id: "h-rajasthan-royal",
    title: "Royal Rajasthan Circuit",
    country: "India",
    region: "Rajasthan",
    destination: "India · Rajasthan",
    duration: "7D / 6N",
    durationDays: 7,
    priceFrom: "From ₹45,000",
    budgetTier: "Luxury",
    theme: "Culture & luxury",
    tripStyle: "Private Tour",
    highlights: ["Heritage hotels", "Desert safari", "Palace tours"],
    vibe: "Culture & luxury",
    imageUrls: [],
    bestMonths: "Oct – Mar",
    visaType: null,
    rating: null,
  },
];

export const FALLBACK_COUNTRIES: CountryDestination[] = [
  {
    id: "IN",
    name: "India",
    slug: "india",
    status: "Published",
    featured: true,
    displayOrder: 1,
    region: "South Asia",
    bestFor: "A continent of stories in one country",
    startingFrom: "₹45,000",
    tags: ["Himalayas", "Backwaters", "Heritage"],
    description: null,
    imageUrl: null,
    bestMonths: "Oct – Mar",
    visaType: null,
  },
  {
    id: "TH",
    name: "Thailand",
    slug: "thailand",
    status: "Published",
    featured: true,
    displayOrder: 3,
    region: "Southeast Asia",
    bestFor: "Beaches, street food & nightlife",
    startingFrom: "From ₹35,000",
    tags: ["Bangkok", "Phuket", "Visa on arrival"],
    description: null,
    imageUrl: null,
    bestMonths: "Nov – Feb",
    visaType: "Visa on arrival",
  },
];

/** @deprecated Prefer FALLBACK_HOLIDAYS / useHolidayPackages() */
export const HOLIDAY_PACKAGES = FALLBACK_HOLIDAYS;
/** @deprecated Prefer FALLBACK_COUNTRIES / useCountryDestinations() */
export const COUNTRY_DESTINATIONS = FALLBACK_COUNTRIES;
