/**
 * Reads assets/affiliate_shop_v2.csv and emits:
 *   - src/data/bundled-shop-csv.ts (bundled catalog for offline / dev use)
 *   - src/data/shop-valid-image-ids.ts (product IDs with reachable image URLs)
 *
 * Run: npm run build:shop
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "assets", "affiliate_shop_v2.csv");
const OUT_CSV_PATH = path.join(ROOT, "src", "data", "bundled-shop-csv.ts");
const OUT_IDS_PATH = path.join(ROOT, "src", "data", "shop-valid-image-ids.ts");
const CHECK_CONCURRENCY = 12;
const CHECK_TIMEOUT_MS = 8000;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function extractImageRows(csv) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  const headerIdx = lines.findIndex((line) =>
    line.toLowerCase().includes("product_id"),
  );
  if (headerIdx < 0) return [];

  const headers = parseCsvLine(lines[headerIdx]).map((h) => h.trim());
  const productIdIdx = headers.findIndex((h) => h === "product_id");
  const imageIdx = headers.findIndex((h) => h === "image_url");
  if (productIdIdx < 0 || imageIdx < 0) return [];

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map((c) => c.trim());
    const productId = cols[productIdIdx] ?? "";
    const imageUrl = cols[imageIdx] ?? "";
    if (!productId) continue;
    rows.push({ productId, imageUrl });
  }
  return rows;
}

async function imageUrlWorks(url) {
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().startsWith("http")) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(trimmed, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function collectValidImageIds(rows) {
  const valid = [];
  let checked = 0;

  for (let i = 0; i < rows.length; i += CHECK_CONCURRENCY) {
    const batch = rows.slice(i, i + CHECK_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (row) => {
        const ok = await imageUrlWorks(row.imageUrl);
        checked += 1;
        if (ok) return row.productId;
        return null;
      }),
    );
    valid.push(...results.filter(Boolean));
    process.stdout.write(
      `\rChecked ${Math.min(checked, rows.length)}/${rows.length} image URLs...`,
    );
  }
  process.stdout.write("\n");
  return valid;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("Missing CSV:", CSV_PATH);
    process.exit(1);
  }

  const csv = fs.readFileSync(CSV_PATH, "utf8");
  const csvOut = `/** Auto-generated from assets/affiliate_shop_v2.csv — run: npm run build:shop */\nexport const BUNDLED_SHOP_CSV = ${JSON.stringify(csv)};\n`;
  fs.writeFileSync(OUT_CSV_PATH, csvOut, "utf8");

  const rows = extractImageRows(csv);
  const validIds = await collectValidImageIds(rows);
  const idsOut = `/** Auto-generated from assets/affiliate_shop_v2.csv — run: npm run build:shop */\nexport const SHOP_VALID_IMAGE_IDS = new Set<string>([\n${validIds.map((id) => `  ${JSON.stringify(id)},`).join("\n")}\n]);\n`;
  fs.writeFileSync(OUT_IDS_PATH, idsOut, "utf8");

  const productRows = csv.split(/\r?\n/).filter((line) => line.trim()).length - 2;
  console.log(`Wrote ${OUT_CSV_PATH} (${productRows} product rows approx.)`);
  console.log(
    `Wrote ${OUT_IDS_PATH} (${validIds.length}/${rows.length} products with loadable images)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
