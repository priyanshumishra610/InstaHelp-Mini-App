/**
 * Reads assets/Vendor_Data_Instahelp - All-Vendors.csv and emits
 * src/data/bangalore-vendors.json filtered to Bangalore + hotspot areas.
 *
 * Run: node scripts/build-bangalore-vendors.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(
  ROOT,
  "assets",
  "Vendor_Data_Instahelp - All-Vendors.csv",
);
const OUT_PATH = path.join(ROOT, "src", "data", "bangalore-vendors.json");

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
  return cells.map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"'));
}

function normalizeText(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** @typedef {{ id: string; label: string; aliases: RegExp[] }} AreaDef */

/** @type {AreaDef[]} */
const BANGALORE_AREAS = [
  { id: "hsr_layout", label: "HSR Layout", aliases: [/\bhsr\b/i] },
  {
    id: "koramangala",
    label: "Koramangala",
    aliases: [/koramangala/i, /kormangala/i],
  },
  { id: "whitefield", label: "Whitefield", aliases: [/whitefield/i] },
  { id: "btm", label: "BTM", aliases: [/\bbtm\b/i] },
  {
    id: "indiranagar",
    label: "Indiranagar",
    aliases: [/indiranagar/i, /indira\s+nagar/i],
  },
  {
    id: "electronic_city",
    label: "Electronic City",
    aliases: [/electronic\s+city/i, /e-?city/i],
  },
  { id: "marathahalli", label: "Marathahalli", aliases: [/marathahalli/i] },
];

function detectArea(haystack) {
  const n = normalizeText(haystack);
  for (const a of BANGALORE_AREAS) {
    for (const re of a.aliases) {
      re.lastIndex = 0;
      if (re.test(n)) return { id: a.id, label: a.label };
    }
  }
  return null;
}

function isBangaloreRow(city, state, address) {
  const blob = normalizeText(`${city} ${state} ${address}`);
  return (
    blob.includes("bengaluru") ||
    blob.includes("bangalore") ||
    blob.includes("bengalore")
  );
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
  return first || null;
}

function cleanPhone(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return s;
}

function main() {
  const text = fs.readFileSync(CSV_PATH, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV appears empty");
  }
  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.indexOf(name);

  const col = {
    id: idx("Vendor ID"),
    vendorName: idx("Vendor Name"),
    businessName: idx("Business Name"),
    address: idx("Address"),
    area: idx("Area"),
    city: idx("City"),
    state: idx("State"),
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

  const missing = Object.entries(col).filter(([, v]) => v < 0);
  if (missing.length) {
    throw new Error(`Missing CSV columns: ${missing.map(([k]) => k).join(", ")}`);
  }

  /** @type {any[]} */
  const vendors = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    if (row.length < header.length) continue;

    const city = row[col.city] ?? "";
    const state = row[col.state] ?? "";
    const address = row[col.address] ?? "";
    if (!isBangaloreRow(city, state, address)) continue;

    const areaHit = detectArea(
      `${row[col.area] ?? ""} ${address} ${city} ${row[col.vendorName] ?? ""} ${row[col.businessName] ?? ""}`,
    );
    if (!areaHit) continue;

    const coords = parseLatLng(row[col.lat], row[col.lng]);
    const rating = parseNumber(row[col.rating]);
    const reviews = Math.max(0, Math.floor(parseNumber(row[col.totalReviews]) ?? 0));
    const startingPrice = parseNumber(row[col.startingPrice]);

    const verificationRaw = String(row[col.verification] ?? "").trim();
    const isVerified =
      /verified/i.test(verificationRaw) ||
      /^true$/i.test(verificationRaw) ||
      verificationRaw === "1";

    const servicesText = String(row[col.services] ?? "").trim();
    const category = String(row[col.category] ?? "").trim() || "General";
    const subCategory = String(row[col.subCategory] ?? "").trim();

    vendors.push({
      id: String(row[col.id] ?? "").trim(),
      vendorName: String(row[col.vendorName] ?? "").trim(),
      businessName: String(row[col.businessName] ?? "").trim(),
      /** Full address — only shown after reveal in UI */
      address: String(row[col.address] ?? "").trim(),
      areaKey: areaHit.id,
      areaLabel: areaHit.label,
      city: String(city).trim(),
      state: String(state).trim(),
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

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(vendors, null, 0), "utf8");
  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${vendors.length} vendors to ${path.relative(ROOT, OUT_PATH)}`,
  );
}

main();
