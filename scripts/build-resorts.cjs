/**
 * Reads assets/Resort list.csv and emits:
 *   - src/data/resorts.json
 *   - src/data/resort-catalog-meta.json
 *
 * Run: npm run build:resorts
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "assets", "Resort list.csv");
const OUT_RESORTS = path.join(ROOT, "src", "data", "resorts.json");
const OUT_META = path.join(ROOT, "src", "data", "resort-catalog-meta.json");

function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells.map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
}

function normalizeText(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(s) {
  const slug = normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return slug || "resort";
}

function parseNumber(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function pickHttpUrl(raw) {
  let u = String(raw ?? "").trim();
  if (!u.startsWith("http")) return null;
  // Strip wrapping quotes from spreadsheet exports
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1).trim();
  }
  if (!u.startsWith("http")) return null;
  try {
    return encodeURI(decodeURI(u));
  } catch {
    return u.replace(/\s/g, "%20");
  }
}

function splitExperienceTypes(raw) {
  return String(raw ?? "")
    .split(/[·,|/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitRoomTypes(raw) {
  return String(raw ?? "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  const text = fs.readFileSync(CSV_PATH, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV appears empty");
  }

  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.indexOf(name);

  const col = {
    name: idx("Resort Name"),
    rank: idx("Rank"),
    region: idx("Region"),
    roomQuality: idx("Room Quality"),
    destination: idx("Destination"),
    price: idx("Price"),
    state: idx("State"),
    location: idx("Location"),
    category: idx("Category"),
    estimatedPrice: idx("Estimated Price Next Week (INR)"),
    experienceType: idx("Experience Type"),
    roomTypes: idx("Room Types"),
    website: idx("Website Link"),
    rating: idx("Tripadvisor Rating"),
    image1: idx("Image Link-1"),
    image2: idx("Image Link-2"),
    image3: idx("Image Link-3"),
  };

  if (col.name < 0) {
    throw new Error("Missing Resort Name column");
  }

  /** @type {Map<string, object>} */
  const byId = new Map();
  const stateCounts = new Map();
  const regionCounts = new Map();
  const categoryCounts = new Map();

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const name = String(row[col.name] ?? "").trim();
    if (!name) continue;

    const rawRank = parseNumber(row[col.rank]);
    const rank =
      rawRank != null && rawRank > 0 ? Math.floor(rawRank) : null;
    let id = slugify(name);
    if (rank > 0 && rank < 999) id = `${id}-r${rank}`;
    if (byId.has(id)) id = `${id}-${i}`;

    const state = String(row[col.state] ?? "").trim() || "India";
    const region = String(row[col.region] ?? "").trim();
    const location = String(row[col.location] ?? "").trim();

    stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1);
    if (region) regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1);
    const category = String(row[col.category] ?? "").trim();
    if (category) categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);

    const images = [col.image1, col.image2, col.image3]
      .map((c) => (c >= 0 ? pickHttpUrl(row[c]) : null))
      .filter(Boolean);

    byId.set(id, {
      id,
      name,
      rank: rank < 999 ? rank : null,
      region,
      roomQuality: String(row[col.roomQuality] ?? "").trim() || null,
      destinationTier: String(row[col.destination] ?? "").trim() || null,
      priceTier: String(row[col.price] ?? "").trim() || null,
      state,
      location,
      category: category || null,
      estimatedPriceLabel:
        String(row[col.estimatedPrice] ?? "").trim() || null,
      experienceTypes: splitExperienceTypes(row[col.experienceType]),
      roomTypes: splitRoomTypes(row[col.roomTypes]),
      websiteUrl: col.website >= 0 ? pickHttpUrl(row[col.website]) : null,
      tripadvisorRating: parseNumber(row[col.rating]),
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

  const topStates = [...stateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([state, count]) => ({ state, count }));

  const topRegions = [...regionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([region, count]) => ({ region, count }));

  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([category, count]) => ({ category, count }));

  fs.mkdirSync(path.dirname(OUT_RESORTS), { recursive: true });
  fs.writeFileSync(OUT_RESORTS, `${JSON.stringify(resorts, null, 0)}\n`);
  fs.writeFileSync(
    OUT_META,
    `${JSON.stringify(
      {
        total: resorts.length,
        states: topStates,
        regions: topRegions,
        categories: topCategories,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    `Wrote ${resorts.length} resorts → ${path.relative(ROOT, OUT_RESORTS)}`,
  );
  console.log(`Meta: ${topStates.length} states → ${path.relative(ROOT, OUT_META)}`);
}

main();
