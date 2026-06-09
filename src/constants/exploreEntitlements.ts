/** Max saved vendors on the Free plan */
export const FREE_SAVED_VENDOR_LIMIT = 5;

/** Pro+ can compare vendors across up to this many cities at once */
export const PRO_PLUS_MULTI_CITY_LIMIT = 4;

/** Categories unlocked early for Pro+ subscribers */
export const EARLY_ACCESS_CATEGORIES = [
  "Digital Marketing Agency",
  "Website Development Company",
  "Coworking Space",
] as const;

export type EarlyAccessCategory = (typeof EARLY_ACCESS_CATEGORIES)[number];

export function isEarlyAccessCategory(category: string): boolean {
  const normalized = category.trim().toLowerCase();
  return EARLY_ACCESS_CATEGORIES.some(
    (c) => c.toLowerCase() === normalized,
  );
}
