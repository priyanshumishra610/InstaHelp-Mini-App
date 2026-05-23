/**
 * Batch-import vendor catalog into Firestore.
 *
 * Prerequisites:
 *   1. `npm run build:vendors` (optional — uses bangalore-vendors.json by default)
 *   2. Firebase Admin service account JSON
 *   3. `.env` with EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run migrate:vendors:firestore
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json npm run migrate:vendors:firestore -- --seed-metadata
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json npm run migrate:vendors:firestore -- --dry-run
 */

require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const ROOT = path.join(__dirname, "..");
const VENDORS_JSON = path.join(ROOT, "src", "data", "bangalore-vendors.json");
const BATCH_SIZE = 400;

function buildSearchTokens(input) {
  const blob = [
    input.name,
    input.businessName,
    input.category,
    input.subCategory,
    input.area,
    input.city,
    input.description,
    ...(input.tags || []),
  ]
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const tokens = new Set();
  for (const word of blob.split(/[^a-z0-9]+/)) {
    if (word.length < 2) continue;
    tokens.add(word);
    if (word.length >= 4) tokens.add(word.slice(0, 4));
  }
  return Array.from(tokens).slice(0, 450);
}

function recordToFirestoreDoc(record) {
  const images = [];
  if (record.profileImageUrl) images.push(record.profileImageUrl);
  if (record.shopImageUrls) {
    String(record.shopImageUrls)
      .split(/[;,|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((url) => images.push(url));
  }

  const name =
    String(record.businessName || "").trim() ||
    String(record.vendorName || "").trim() ||
    "Vendor";

  const description = String(record.servicesText || "").trim();
  const tags = [];

  return {
    id: record.id,
    name,
    businessName: record.businessName || name,
    category: record.category || "General",
    subCategory: record.subCategory || "",
    city: "Bengaluru",
    area: record.areaLabel || "",
    areaKey: record.areaKey || "bangalore",
    address: record.address || "",
    phone: record.phone || null,
    whatsapp: record.phone || null,
    email: record.email || null,
    description,
    images,
    pricing: {
      startingPrice:
        record.startingPrice != null && Number.isFinite(record.startingPrice)
          ? record.startingPrice
          : null,
      currency: record.currency || "INR",
    },
    rating: Number(record.rating) || 0,
    totalReviews: Number(record.reviewCount) || 0,
    isVerified: Boolean(record.isVerified),
    isFeatured: record.sponsorTier === "featured",
    isActive: true,
    tags,
    searchTokens: buildSearchTokens({
      name,
      businessName: record.businessName,
      category: record.category,
      subCategory: record.subCategory,
      area: record.areaLabel,
      city: record.city,
      description,
      tags,
    }),
    coordinates: record.coordinates
      ? {
          latitude: record.coordinates.lat,
          longitude: record.coordinates.lng,
        }
      : null,
    sponsorTier: record.sponsorTier || "none",
    listingBoost: Number(record.listingBoost) || 0,
    operationalStatus: record.operationalStatus || null,
    state: record.state || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

const SEED_CATEGORIES = [
  { id: "home-personal", name: "Home & Personal", slug: "home-personal", icon: "home-outline", order: 0 },
  { id: "education", name: "Education", slug: "education", icon: "school-outline", order: 1 },
  { id: "real-estate", name: "Real Estate", slug: "real-estate", icon: "business-outline", order: 2 },
  { id: "personal-care", name: "Personal Care", slug: "personal-care", icon: "heart-outline", order: 3 },
  { id: "automotive", name: "Automotive", slug: "automotive", icon: "car-outline", order: 4 },
];

const SEED_SERVICES = [
  { id: "plumber", name: "Plumber", slug: "plumber", categoryId: "home-personal", icon: "water-outline", trending: true, popular: true, order: 0, formServiceId: "plumbing" },
  { id: "electrician", name: "Electrician", slug: "electrician", categoryId: "home-personal", icon: "flash-outline", trending: true, popular: true, order: 1, formServiceId: "electrician" },
  { id: "deep-cleaning", name: "Deep Cleaning", slug: "deep-cleaning", categoryId: "home-personal", icon: "sparkles-outline", trending: true, popular: true, order: 2, formServiceId: "cleaning" },
  { id: "ac-servicing", name: "AC Servicing", slug: "ac-servicing", categoryId: "home-personal", icon: "snow-outline", trending: true, order: 3, formServiceId: "ac_repair" },
  { id: "salon-at-home", name: "Salon at Home", slug: "salon-at-home", categoryId: "personal-care", icon: "cut-outline", trending: true, order: 4, formServiceId: "salon" },
];

async function commitBatches(db, collectionName, docs, dryRun) {
  let written = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const slice = docs.slice(i, i + BATCH_SIZE);
    if (dryRun) {
      written += slice.length;
      continue;
    }
    const batch = db.batch();
    for (const doc of slice) {
      const id = doc.id;
      const { id: _drop, ...payload } = doc;
      batch.set(db.collection(collectionName).doc(id), payload, { merge: true });
    }
    await batch.commit();
    written += slice.length;
    // eslint-disable-next-line no-console
    console.log(`  ${collectionName}: ${written}/${docs.length}`);
  }
  return written;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const seedMetadata = process.argv.includes("--seed-metadata");
  const projectId =
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Set EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env");
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId });
  }

  const db = admin.firestore();

  if (!fs.existsSync(VENDORS_JSON)) {
    throw new Error(
      `Missing ${path.relative(ROOT, VENDORS_JSON)} — run npm run build:vendors first`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(VENDORS_JSON, "utf8"));
  const vendorDocs = raw.map(recordToFirestoreDoc);

  // eslint-disable-next-line no-console
  console.log(
    `${dryRun ? "[dry-run] " : ""}Importing ${vendorDocs.length} vendors → Firestore (${projectId})`,
  );

  const vendorCount = await commitBatches(db, "vendors", vendorDocs, dryRun);

  if (seedMetadata) {
    const categoryDocs = SEED_CATEGORIES.map((c) => ({
      ...c,
      active: true,
      subtitle: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }));
    const serviceDocs = SEED_SERVICES.map((s) => ({
      ...s,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }));

    await commitBatches(db, "categories", categoryDocs, dryRun);
    await commitBatches(db, "services", serviceDocs, dryRun);
    // eslint-disable-next-line no-console
    console.log("Seeded categories + trending services metadata");
  }

  // eslint-disable-next-line no-console
  console.log(`Done. ${vendorCount} vendor documents ${dryRun ? "validated" : "written"}.`);
  // eslint-disable-next-line no-console
  console.log("Deploy indexes: firebase deploy --only firestore:indexes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
