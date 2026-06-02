import { DISCOVERY_CATEGORIES } from "@/constants/discoveryCategories";

/**
 * Maps Explore route `category` param (discovery id/title) into catalog query fields.
 * Home category chips pass discovery titles, not vendor CSV category names.
 */
export function resolveExploreCatalogFilters(input: {
  search: string;
  categoryParam: string | null;
}): { search: string; category: string | null } {
  const baseSearch = input.search.trim();
  const raw = input.categoryParam?.trim();
  if (!raw) {
    return { search: baseSearch, category: null };
  }

  const discovery = DISCOVERY_CATEGORIES.find(
    (c) =>
      c.id === raw ||
      c.title.toLowerCase() === raw.toLowerCase(),
  );

  if (discovery) {
    const serviceTerms = discovery.services
      .flatMap((s) => [s.label, s.formServiceId ?? ""])
      .map((t) => t.trim())
      .filter(Boolean);
    const categorySearch = serviceTerms.slice(0, 12).join(" ");
    return {
      search: [baseSearch, categorySearch].filter(Boolean).join(" ").trim(),
      category: null,
    };
  }

  return { search: baseSearch, category: raw };
}
