/**
 * Reads assets/App Hardcode list - All-Vendors.csv and emits:
 *   - src/data/all-vendors.json (full catalog, no city filter)
 *   - src/data/vendor-catalog-meta.json (top cities & areas for UI chips)
 *
 * Run: npm run build:vendors
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(
  ROOT,
  "assets",
  "App Hardcode list - All-Vendors.csv",
);
const OUT_VENDORS = path.join(ROOT, "src", "data", "all-vendors.json");
const OUT_META = path.join(ROOT, "src", "data", "vendor-catalog-meta.json");

const TOP_CITIES = 18;
const TOP_AREAS = 28;

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
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 56);
  return slug || "other";
}

function titleCase(s) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  return t
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseNumber(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseLatLng(rawLat, rawLng) {
  const lat = parseNumber(rawLat);
  const lng = parseNumber(rawLng);
  if (lat == null || lng == null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function pickPrimaryEmail(raw) {
  if (!raw || !String(raw).trim()) return null;
  const first = String(raw).split(/[;,]/)[0]?.trim();
  if (!first || !first.includes("@")) return null;
  return first;
}

function cleanPhone(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s || null;
}

function pickName(row, col) {
  const business = String(row[col.businessName] ?? "").trim();
  const vendor = String(row[col.vendorName] ?? "").trim();
  const cleaned = String(row[col.cleanedName] ?? "").trim();
  return business || vendor || cleaned || "Vendor";
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
    id: idx("Column 1"),
    vendorName: idx("Vendor Name"),
    cleanedName: idx("Cleaned Name"),
    businessName: idx("Business Name"),
    address: idx("Address"),
    area: idx("Area"),
    city: idx("City"),
    state: idx("State"),
    pincode: idx("Pincode"),
    phone: idx("Phone"),
    email: idx("Email"),
    category: idx("Category"),
    subCategory: idx("Sub-Category"),
    services: idx("Services"),
    profileImage: idx("Profile Image URL"),
    shopImages: idx("Shop Images URLs"),
    startingPrice: idx("Starting Price"),
    rating: idx("Rating"),
    totalReviews: idx("Total Reviews"),
    verification: idx("Verification Status"),
    status: idx("Status"),
    lat: idx("Latitude"),
    lng: idx("Longitude"),
  };

  const required = ["vendorName", "address", "category", "lat", "lng"];
  const missing = required.filter((k) => col[k] < 0);
  if (missing.length) {
    throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
  }

  /** @type {Map<string, any>} */
  const byId = new Map();
  let skipped = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    if (row.length < 4) continue;

    const displayName = pickName(row, col);
    const address = String(row[col.address] ?? "").trim();
    const category = String(row[col.category] ?? "").trim() || "General";
    if (!displayName && !address) {
      skipped += 1;
      continue;
    }

    const cityRaw = String(row[col.city] ?? "").trim();
    const areaRaw = String(row[col.area] ?? "").trim();
    const stateRaw = String(row[col.state] ?? "").trim();
    const cityLabel = titleCase(cityRaw) || titleCase(areaRaw) || "India";
    const areaLabel = titleCase(areaRaw) || cityLabel;
    const cityKey = slugify(cityRaw || areaRaw || stateRaw || "india");
    const areaSlug = slugify(areaRaw || cityRaw || "general");
    const areaKey = `${cityKey}__${areaSlug}`;

    let id = String(row[col.id] ?? "").trim();
    if (!id) id = `row_${i}`;
    if (byId.has(id)) id = `${id}_${i}`;

    const coords = parseLatLng(row[col.lat], row[col.lng]);
    const rating = parseNumber(row[col.rating]);
    const reviews = Math.max(
      0,
      Math.floor(parseNumber(row[col.totalReviews]) ?? 0),
    );
    const startingPrice = parseNumber(row[col.startingPrice]);

    const verificationRaw = String(row[col.verification] ?? "").trim();
    const isVerified =
      /verified/i.test(verificationRaw) ||
      /^true$/i.test(verificationRaw) ||
      verificationRaw === "1";

    const servicesText = String(row[col.services] ?? "").trim();
    const subCategory = String(row[col.subCategory] ?? "").trim();
    const vendorName = String(row[col.vendorName] ?? "").trim() || displayName;

    byId.set(id, {
      id,
      vendorName,
      businessName: displayName,
      address,
      areaKey,
      areaLabel,
      cityKey,
      city: cityLabel,
      state: stateRaw,
      phone: cleanPhone(row[col.phone]),
      email: pickPrimaryEmail(row[col.email]),
      category,
      subCategory,
      servicesText,
      profileImageUrl: String(row[col.profileImage] ?? "").trim() || null,
      shopImageUrls: String(row[col.shopImages] ?? "").trim() || null,
      startingPrice,
      currency: "INR",
      rating: rating ?? 0,
      reviewCount: reviews,
      isVerified,
      operationalStatus: String(row[col.status] ?? "").trim() || null,
      coordinates: coords,
      sponsorTier: "none",
      listingBoost: 0,
    });
  }

  const vendors = Array.from(byId.values());

  /** @type {Map<string, { id: string; label: string; count: number }>} */
  const cityCounts = new Map();
  /** @type {Map<string, { id: string; label: string; cityLabel: string; count: number }>} */
  const areaCounts = new Map();

  for (const v of vendors) {
    const city = cityCounts.get(v.cityKey) ?? {
      id: v.cityKey,
      label: v.city,
      count: 0,
    };
    city.count += 1;
    cityCounts.set(v.cityKey, city);

    const area = areaCounts.get(v.areaKey) ?? {
      id: v.areaKey,
      label: v.areaLabel,
      cityLabel: v.city,
      count: 0,
    };
    area.count += 1;
    areaCounts.set(v.areaKey, area);
  }

  const cities = [...cityCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_CITIES)
    .map(({ id, label, count }) => ({ id, label, count }));

  const areas = [...areaCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_AREAS)
    .map(({ id, label, cityLabel, count }) => ({
      id,
      label,
      cityLabel,
      count,
    }));

  const meta = {
    generatedAt: new Date().toISOString(),
    totalVendors: vendors.length,
    cities,
    areas,
  };

  fs.mkdirSync(path.dirname(OUT_VENDORS), { recursive: true });
  fs.writeFileSync(OUT_VENDORS, JSON.stringify(vendors), "utf8");
  fs.writeFileSync(OUT_META, JSON.stringify(meta, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${vendors.length} vendors (${skipped} skipped) → ${path.relative(ROOT, OUT_VENDORS)}`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `Meta: ${cities.length} cities, ${areas.length} areas → ${path.relative(ROOT, OUT_META)}`,
  );
}

main();
