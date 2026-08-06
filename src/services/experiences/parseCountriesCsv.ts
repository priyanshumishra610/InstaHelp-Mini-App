import type { CountryDestination } from "@/types/experienceCatalog";
import {
  cell,
  colIndex,
  parseCsv,
  parseNumber,
  pickHttpUrl,
  slugify,
} from "@/utils/parseCsv";

function collectHighlights(row: string[], header: string[]): string[] {
  const tags: string[] = [];
  for (let i = 0; i < header.length; i++) {
    const key = header[i].trim().toLowerCase();
    if (!/^highlight\s*\d+$/i.test(header[i].trim()) && !/^highlight\d+$/i.test(key.replace(/\s/g, ""))) {
      continue;
    }
    const value = cell(row, i);
    if (value) tags.push(value);
  }
  return tags.slice(0, 6);
}

export function parseCountriesCsv(csvText: string): CountryDestination[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const header = rows[0];
  const cols = {
    id: colIndex(header, ["Country ID", "ID"]),
    name: colIndex(header, ["Country Name", "Name"]),
    slug: colIndex(header, ["Slug"]),
    status: colIndex(header, ["Status"]),
    order: colIndex(header, ["Display Order"]),
    featured: colIndex(header, ["Featured"]),
    heroTitle: colIndex(header, ["Hero Title"]),
    heroSubtitle: colIndex(header, ["Hero Subtitle"]),
    heroDescription: colIndex(header, ["Hero Description"]),
    startingPrice: colIndex(header, ["Hero Starting Price", "Starting Price"]),
    heroImage: colIndex(header, ["Hero Image", "OG Image", "Image 1"]),
    bestMonths: colIndex(header, ["Best Months", "Best Time To Visit"]),
    visaType: colIndex(header, ["Visa Type", "Visa Required"]),
  };

  if (cols.name < 0) return [];

  const countries: CountryDestination[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = cell(row, cols.name) || cell(row, cols.heroTitle);
    if (!name) continue;

    const status = cell(row, cols.status) || "Published";
    // Prefer published rows; include drafts only when nothing else maps cleanly.
    if (status && !/^published$/i.test(status) && !/^live$/i.test(status)) {
      continue;
    }

    const id =
      cell(row, cols.id) ||
      cell(row, cols.slug) ||
      slugify(name, "country");
    const subtitle = cell(row, cols.heroSubtitle);
    const description = cell(row, cols.heroDescription) || null;
    const tags = collectHighlights(row, header);
    if (tags.length === 0 && subtitle) tags.push(subtitle);

    countries.push({
      id,
      name,
      slug: cell(row, cols.slug) || slugify(name, "country"),
      status,
      featured: /^(true|1|yes)$/i.test(cell(row, cols.featured)),
      displayOrder: parseNumber(cell(row, cols.order)) ?? i,
      region: subtitle || "International",
      bestFor: subtitle || description || "Curated travel experiences",
      startingFrom: cell(row, cols.startingPrice) || "Price on request",
      tags: tags.slice(0, 4),
      description,
      imageUrl: pickHttpUrl(cell(row, cols.heroImage)),
      bestMonths: cell(row, cols.bestMonths) || null,
      visaType: cell(row, cols.visaType) || null,
    });
  }

  // If the sheet only has drafts, fall back to showing all named countries.
  if (countries.length === 0) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = cell(row, cols.name) || cell(row, cols.heroTitle);
      if (!name) continue;
      const id =
        cell(row, cols.id) ||
        cell(row, cols.slug) ||
        slugify(name, "country");
      const subtitle = cell(row, cols.heroSubtitle);
      countries.push({
        id,
        name,
        slug: cell(row, cols.slug) || slugify(name, "country"),
        status: cell(row, cols.status) || "Draft",
        featured: /^(true|1|yes)$/i.test(cell(row, cols.featured)),
        displayOrder: parseNumber(cell(row, cols.order)) ?? i,
        region: subtitle || "International",
        bestFor: subtitle || "Curated travel experiences",
        startingFrom: cell(row, cols.startingPrice) || "Price on request",
        tags: collectHighlights(row, header).slice(0, 4),
        description: cell(row, cols.heroDescription) || null,
        imageUrl: pickHttpUrl(cell(row, cols.heroImage)),
        bestMonths: cell(row, cols.bestMonths) || null,
        visaType: cell(row, cols.visaType) || null,
      });
    }
  }

  return countries.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });
}
