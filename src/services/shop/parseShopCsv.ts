import type { ShopProductCategoryId } from "@/constants/shopMockProducts";
import type { ShopCatalogProduct } from "@/types/shopCatalog";

import { enrichProductPrices } from "./shopPriceLogic";

/** Quote-aware CSV line split (matches vendor build scripts). */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
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

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function colIndex(headers: string[], names: string[], fallback: number): number {
  const normalized = headers.map(normalizeHeader);
  for (const name of names) {
    const idx = normalized.indexOf(normalizeHeader(name));
    if (idx >= 0) return idx;
  }
  return fallback;
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

const CATEGORY_ALIASES: Record<string, ShopProductCategoryId> = {
  electronics: "electronics",
  electronic: "electronics",
  gadget: "electronics",
  gadgets: "electronics",
  fashion: "fashion",
  apparel: "fashion",
  clothing: "fashion",
  "home & kitchen": "home-kitchen",
  "home and kitchen": "home-kitchen",
  home_kitchen: "home-kitchen",
  "home-kitchen": "home-kitchen",
  home: "home-kitchen",
  kitchen: "home-kitchen",
  decor: "home-kitchen",
  beauty: "beauty",
  skincare: "beauty",
  sports: "sports",
  sport: "sports",
  fitness: "sports",
  books: "books",
  book: "books",
  "toys & games": "toys-games",
  "toys and games": "toys-games",
  toys_games: "toys-games",
  "toys-games": "toys-games",
  toys: "toys-games",
  games: "toys-games",
  gaming: "toys-games",
  game: "toys-games",
  grocery: "grocery",
  groceries: "grocery",
  food: "grocery",
  automotive: "automotive",
  auto: "automotive",
  car: "automotive",
  "office supplies": "office-supplies",
  office_supplies: "office-supplies",
  "office-supplies": "office-supplies",
  office: "office-supplies",
  stationery: "office-supplies",
  travel: "sports",
  gifts: "toys-games",
  gift: "toys-games",
};

function mapCategory(raw: string): ShopProductCategoryId {
  const key = raw.trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? "electronics";
}

function findHeaderLineIndex(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const first = normalizeHeader(parseCsvLine(lines[i])[0] ?? "");
    if (first === "product_id") return i;
  }
  return 0;
}

function parseHighlights(raw: string): string[] {
  if (!raw.trim()) return [];
  if (raw.includes("|")) {
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (raw.includes(";")) {
    return raw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [raw.trim()];
}

function parseYesNo(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (v === "yes" || v === "true" || v === "1") return true;
  if (v === "no" || v === "false" || v === "0") return false;
  return null;
}

function parseImageUrls(cols: string[], idx: Record<string, number>): string[] {
  const urls: string[] = [];
  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !urls.includes(v)) urls.push(v);
  };

  const pipeCol = idx.imageUrls;
  if (pipeCol >= 0) {
    const raw = cols[pipeCol] ?? "";
    if (raw.includes("|")) {
      raw.split("|").forEach((part) => add(part));
    } else if (raw.includes(";")) {
      raw.split(";").forEach((part) => add(part));
    } else {
      add(raw);
    }
  }

  for (const key of [
    "imageUrl1",
    "imageUrl2",
    "imageUrl3",
    "imageUrl4",
    "imageLegacy",
  ] as const) {
    const col = idx[key];
    if (col >= 0) add(cols[col] ?? "");
  }

  return urls;
}

function buildHighlights(
  cols: string[],
  idx: {
    highlights: number;
    subCategory: number;
    brand: number;
    bestPlatform: number;
  },
): string[] {
  const fromColumn =
    idx.highlights >= 0 ? parseHighlights(cols[idx.highlights] ?? "") : [];
  if (fromColumn.length) return fromColumn;

  const parts: string[] = [];
  if (idx.brand >= 0 && cols[idx.brand]) parts.push(cols[idx.brand]);
  if (idx.subCategory >= 0 && cols[idx.subCategory]) {
    parts.push(cols[idx.subCategory]);
  }
  if (idx.bestPlatform >= 0 && cols[idx.bestPlatform]) {
    parts.push(`Best on ${cols[idx.bestPlatform]}`);
  }
  return parts;
}

export function parseShopProductsCsv(csvText: string): ShopCatalogProduct[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headerLineIndex = findHeaderLineIndex(lines);
  const headers = parseCsvLine(lines[headerLineIndex]).map((h) => h.trim());
  const idx = {
    productId: colIndex(headers, ["product_id", "id"], 0),
    name: colIndex(headers, ["product_name", "name", "title"], 1),
    category: colIndex(headers, ["category", "category_id"], 2),
    subCategory: colIndex(headers, ["sub_category", "subcategory"], 3),
    brand: colIndex(headers, ["brand"], 4),
    imageUrl1: colIndex(headers, ["image_url_1", "image_url", "image"], 5),
    imageUrl2: colIndex(headers, ["image_url_2"], -1),
    imageUrl3: colIndex(headers, ["image_url_3"], -1),
    imageUrl4: colIndex(headers, ["image_url_4"], -1),
    imageUrls: colIndex(headers, ["image_urls", "gallery_urls"], -1),
    imageLegacy: colIndex(headers, ["image_url", "image"], -1),
    description: colIndex(headers, ["description"], 6),
    highlights: colIndex(headers, ["highlights"], -1),
    badge: colIndex(headers, ["badge"], -1),
    amazonPrice: colIndex(headers, ["amazon_price", "price_amazon"], 7),
    flipkartPrice: colIndex(headers, ["flipkart_price", "price_flipkart"], 8),
    myntraPrice: colIndex(headers, ["myntra_price", "price_myntra"], 9),
    meeshoPrice: colIndex(headers, ["meesho_price", "price_meesho"], 10),
    bestPlatform: colIndex(headers, ["best_platform"], 12),
    amazonLink: colIndex(
      headers,
      ["amazon_aff_link", "amazon_link", "affiliate_amazon"],
      13,
    ),
    flipkartLink: colIndex(
      headers,
      ["flipkart_aff_link", "flipkart_link", "affiliate_flipkart"],
      14,
    ),
    myntraLink: colIndex(
      headers,
      ["myntra_aff_link", "myntra_link", "affiliate_myntra"],
      15,
    ),
    meeshoLink: colIndex(
      headers,
      ["meesho_aff_link", "meesho_link", "affiliate_meesho"],
      16,
    ),
    rating: colIndex(headers, ["rating"], 17),
    reviewCount: colIndex(headers, ["review_count", "reviews"], -1),
    stock: colIndex(headers, ["stock", "stock_label", "availability"], 18),
    sortPriority: colIndex(headers, ["sort_priority", "sort_order", "priority"], -1),
    onDiscount: colIndex(headers, ["on_discount", "has_discount"], -1),
    inStockFlag: colIndex(headers, ["in_stock", "in_stock_flag"], -1),
    isActive: colIndex(headers, ["is_active", "active"], 19),
  };

  const products: ShopCatalogProduct[] = [];

  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map((c) => c.trim());
    const productId = cols[idx.productId] ?? "";
    if (!productId) continue;

    const isActive = (cols[idx.isActive] ?? "").toLowerCase();
    if (isActive !== "yes") continue;

    const ratingRaw =
      idx.rating >= 0 ? parsePrice(cols[idx.rating] ?? "") : null;
    const reviewRaw =
      idx.reviewCount >= 0 ? parsePrice(cols[idx.reviewCount] ?? "") : null;

    const imageUrls = parseImageUrls(cols, idx);
    const sortRaw =
      idx.sortPriority >= 0 ? parsePrice(cols[idx.sortPriority] ?? "") : null;

    const base = {
      id: productId,
      title: cols[idx.name] ?? "",
      categoryId: mapCategory(cols[idx.category] ?? ""),
      subCategory:
        idx.subCategory >= 0 ? cols[idx.subCategory] || undefined : undefined,
      imageUrl: imageUrls[0] ?? "",
      imageUrls,
      description: cols[idx.description] ?? "",
      highlights: buildHighlights(cols, idx),
      badge: idx.badge >= 0 ? cols[idx.badge] || undefined : undefined,
      brand: idx.brand >= 0 ? cols[idx.brand] || undefined : undefined,
      stock: cols[idx.stock] ?? "",
      rating: ratingRaw ?? 0,
      reviewCount: reviewRaw != null ? Math.round(reviewRaw) : 0,
      sortPriority: sortRaw != null ? Math.round(sortRaw) : null,
      sheetOnDiscount:
        idx.onDiscount >= 0 ? parseYesNo(cols[idx.onDiscount] ?? "") : null,
      sheetInStock:
        idx.inStockFlag >= 0 ? parseYesNo(cols[idx.inStockFlag] ?? "") : null,
      platforms: [
        {
          platform: "amazon" as const,
          platformLabel: "Amazon",
          price: parsePrice(cols[idx.amazonPrice] ?? ""),
          affiliateUrl: cols[idx.amazonLink] || null,
        },
        {
          platform: "flipkart" as const,
          platformLabel: "Flipkart",
          price: parsePrice(cols[idx.flipkartPrice] ?? ""),
          affiliateUrl: cols[idx.flipkartLink] || null,
        },
        {
          platform: "myntra" as const,
          platformLabel: "Myntra",
          price: parsePrice(cols[idx.myntraPrice] ?? ""),
          affiliateUrl: cols[idx.myntraLink] || null,
        },
        {
          platform: "meesho" as const,
          platformLabel: "Meesho",
          price: parsePrice(cols[idx.meeshoPrice] ?? ""),
          affiliateUrl: cols[idx.meeshoLink] || null,
        },
      ],
    };

    products.push(enrichProductPrices(base));
  }

  return products;
}

export function parseTimestampCell(csvText: string): string | null {
  const line = csvText.replace(/^\uFEFF/, "").trim().split(/\r?\n/)[0] ?? "";
  const value = parseCsvLine(line)[0]?.trim();
  return value || null;
}
