import type { ResortCatalogMeta, ResortRecord } from "@/types/resortExperience";
import {
  cell,
  colIndex,
  parseCsv,
  parseNumber,
  pickHttpUrl,
  slugify,
} from "@/utils/parseCsv";

function splitList(raw: string, pattern: RegExp): string[] {
  return raw
    .split(pattern)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Map sheet price labels onto High / Mid / Low for existing UI filters. */
export function normalizeResortPriceTier(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const key = t.toLowerCase().replace(/\s+/g, "");
  if (
    /ultraluxury|ultra.?luxury|luxury|premium|midluxury|iconic|high/.test(key)
  ) {
    return "High";
  }
  if (/upscale|midscale|midrange|mid|medium|moderate/.test(key)) {
    return "Mid";
  }
  if (/value|budget|economy|low|affordable/.test(key)) {
    return "Low";
  }
  return t;
}

function buildMeta(resorts: ResortRecord[]): ResortCatalogMeta {
  const stateCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const resort of resorts) {
    stateCounts.set(resort.state, (stateCounts.get(resort.state) ?? 0) + 1);
    if (resort.region) {
      regionCounts.set(
        resort.region,
        (regionCounts.get(resort.region) ?? 0) + 1,
      );
    }
    if (resort.category) {
      categoryCounts.set(
        resort.category,
        (categoryCounts.get(resort.category) ?? 0) + 1,
      );
    }
  }

  return {
    total: resorts.length,
    states: [...stateCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({ state, count })),
    regions: [...regionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([region, count]) => ({ region, count })),
    categories: [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([category, count]) => ({ category, count })),
    updatedAt: new Date().toISOString(),
  };
}

export function parseResortsCsv(csvText: string): {
  resorts: ResortRecord[];
  meta: ResortCatalogMeta;
} {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { resorts: [], meta: buildMeta([]) };
  }

  const header = rows[0];
  const nameIdx = colIndex(header, ["Resort Name", "Name"]);
  if (nameIdx < 0) {
    return { resorts: [], meta: buildMeta([]) };
  }

  const cols = {
    rank: colIndex(header, ["Rank"]),
    region: colIndex(header, ["Region"]),
    roomQuality: colIndex(header, ["Room Quality"]),
    destination: colIndex(header, ["Destination"]),
    price: colIndex(header, ["Price"]),
    state: colIndex(header, ["State"]),
    location: colIndex(header, ["Location"]),
    category: colIndex(header, ["Category"]),
    estimatedPrice: colIndex(header, [
      "Estimated Price Next Week (INR)",
      "Estimated Price",
    ]),
    experienceType: colIndex(header, ["Experience Type"]),
    roomTypes: colIndex(header, ["Room Types"]),
    website: colIndex(header, ["Website Link", "Website"]),
    rating: colIndex(header, ["Tripadvisor Rating", "Rating"]),
    image1: colIndex(header, ["Image Link1", "Image Link-1", "Image 1"]),
    image2: colIndex(header, ["Image Link2", "Image Link-2", "Image 2"]),
    image3: colIndex(header, ["Image Link3", "Image Link-3", "Image 3"]),
  };

  const byId = new Map<string, ResortRecord>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = cell(row, nameIdx);
    if (!name) continue;

    const rawRank = parseNumber(cell(row, cols.rank));
    const rank =
      rawRank != null && rawRank > 0 ? Math.floor(rawRank) : null;
    let id = slugify(name, "resort");
    if (rank != null && rank > 0 && rank < 999) id = `${id}-r${rank}`;
    if (byId.has(id)) id = `${id}-${i}`;

    const state = cell(row, cols.state) || "India";
    const region = cell(row, cols.region);
    const location = cell(row, cols.location);
    const category = cell(row, cols.category) || null;
    const estimated = cell(row, cols.estimatedPrice);
    const images = [cols.image1, cols.image2, cols.image3]
      .map((c) => pickHttpUrl(cell(row, c)))
      .filter((u): u is string => Boolean(u));

    byId.set(id, {
      id,
      name,
      rank: rank != null && rank < 999 ? rank : null,
      region,
      roomQuality: cell(row, cols.roomQuality) || null,
      destinationTier: cell(row, cols.destination) || null,
      priceTier: normalizeResortPriceTier(cell(row, cols.price)),
      state,
      location,
      category,
      estimatedPriceLabel: estimated || null,
      experienceTypes: splitList(
        cell(row, cols.experienceType),
        /[·,|/]/,
      ),
      roomTypes: splitList(cell(row, cols.roomTypes), /[,;]/),
      websiteUrl: pickHttpUrl(cell(row, cols.website)),
      tripadvisorRating: parseNumber(cell(row, cols.rating)),
      imageUrls: images,
    });
  }

  const resorts = [...byId.values()].sort((a, b) => {
    const ar = a.rank != null && a.rank > 0 ? a.rank : 9999;
    const br = b.rank != null && b.rank > 0 ? b.rank : 9999;
    if (ar !== br) return ar - br;
    const imgDiff =
      (b.imageUrls.length > 0 ? 1 : 0) - (a.imageUrls.length > 0 ? 1 : 0);
    if (imgDiff !== 0) return imgDiff;
    return a.name.localeCompare(b.name);
  });

  return { resorts, meta: buildMeta(resorts) };
}
