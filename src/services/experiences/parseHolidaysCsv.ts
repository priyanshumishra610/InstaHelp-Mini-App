import type { HolidayPackage } from "@/types/experienceCatalog";
import {
  cell,
  colIndex,
  formatInr,
  normalizeHeader,
  parseCsv,
  parseNumber,
  pickHttpUrl,
  slugify,
} from "@/utils/parseCsv";

function splitHighlights(raw: string): string[] {
  return raw
    .split(/[·|,;/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function looksLikeHolidayHeader(row: string[]): boolean {
  const normalized = row.map(normalizeHeader);
  return (
    normalized.includes("pkg_id") ||
    normalized.includes("package_title") ||
    (normalized.includes("country") && normalized.includes("theme"))
  );
}

export function parseHolidaysCsv(csvText: string): HolidayPackage[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  let headerRow = 0;
  if (!looksLikeHolidayHeader(rows[0]) && looksLikeHolidayHeader(rows[1])) {
    headerRow = 1;
  }
  const header = rows[headerRow];
  const dataStart = headerRow + 1;

  const cols = {
    id: colIndex(header, ["Pkg ID", "Package ID", "ID"]),
    country: colIndex(header, ["Country"]),
    region: colIndex(header, ["Region"]),
    title: colIndex(header, ["Package Title", "Title"]),
    theme: colIndex(header, ["Theme"]),
    duration: colIndex(header, ["Duration (Days)", "Duration"]),
    tripStyle: colIndex(header, ["Trip Style"]),
    budgetTier: colIndex(header, ["Budget Tier"]),
    budget2: colIndex(header, [
      "Budget INR 2 Pax",
      "Budget INR 2 Pax",
      "Budget INR 2 Pax",
    ]),
    bestMonths: colIndex(header, ["Best Months"]),
    visaType: colIndex(header, ["Visa Type"]),
    highlights: colIndex(header, [
      "Must-Do Highlights",
      "Highlights",
      "Must Do Highlights",
    ]),
    tags: colIndex(header, ["Tags"]),
    image1: colIndex(header, ["Image 1 URL", "Image 1"]),
    image2: colIndex(header, ["Image 2 URL", "Image 2"]),
    image3: colIndex(header, ["Image 3 URL", "Image 3"]),
    image4: colIndex(header, ["Image 4 URL", "Image 4"]),
    rating: colIndex(header, ["Rating"]),
    slug: colIndex(header, ["URL Slug", "Slug"]),
  };

  // Fallback: find budget column by partial header match
  let budgetIdx = cols.budget2;
  if (budgetIdx < 0) {
    const normalized = header.map(normalizeHeader);
    budgetIdx = normalized.findIndex(
      (h) => h.includes("budget_inr") && h.includes("2"),
    );
  }

  const packages: HolidayPackage[] = [];
  const seen = new Set<string>();

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const title = cell(row, cols.title);
    const country = cell(row, cols.country);
    if (!title || !country) continue;

    const pkgId = cell(row, cols.id);
    const slug = cell(row, cols.slug);
    let id = pkgId || slug || slugify(`${country}-${title}`, "holiday");
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);

    const region = cell(row, cols.region);
    const durationDays = parseNumber(cell(row, cols.duration));
    const budget = parseNumber(cell(row, budgetIdx));
    const theme = cell(row, cols.theme);
    const budgetTier = cell(row, cols.budgetTier) || null;
    const highlightsRaw =
      cell(row, cols.highlights) || cell(row, cols.tags) || theme;
    const images = [cols.image1, cols.image2, cols.image3, cols.image4]
      .map((c) => pickHttpUrl(cell(row, c)))
      .filter((u): u is string => Boolean(u));

    packages.push({
      id,
      title,
      country,
      region,
      destination: [country, region].filter(Boolean).join(" · "),
      duration:
        durationDays != null
          ? `${durationDays}D / ${Math.max(durationDays - 1, 0)}N`
          : cell(row, cols.duration) || "Flexible",
      durationDays,
      priceFrom: formatInr(budget) ?? "Price on request",
      budgetTier,
      theme,
      tripStyle: cell(row, cols.tripStyle) || null,
      highlights: splitHighlights(highlightsRaw),
      vibe: budgetTier || theme.split(/[·|]/)[0]?.trim() || "Holiday",
      imageUrls: images,
      bestMonths: cell(row, cols.bestMonths) || null,
      visaType: cell(row, cols.visaType) || null,
      rating: parseNumber(cell(row, cols.rating)),
    });
  }

  return packages;
}
