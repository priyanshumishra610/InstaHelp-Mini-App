import type { ShopCatalogProduct } from "@/types/shopCatalog";

export function toDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map(toDisplayText)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" · ");
  }
  return "";
}

export function toDisplayTextList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(toDisplayText)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];
    const parts = raw.includes("|")
      ? raw.split("|")
      : raw.includes(";")
        ? raw.split(";")
        : [raw];
    return parts.map((part) => part.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeShopProduct(
  product: ShopCatalogProduct,
): ShopCatalogProduct {
  return {
    ...product,
    title: toDisplayText(product.title),
    description: toDisplayText(product.description),
    stock: toDisplayText(product.stock),
    badge: product.badge ? toDisplayText(product.badge) : undefined,
    brand: product.brand ? toDisplayText(product.brand) : undefined,
    subCategory: product.subCategory
      ? toDisplayText(product.subCategory)
      : undefined,
    imageUrls: (() => {
      const urls = (product.imageUrls ?? [])
        .map((url) => toDisplayText(url).trim())
        .filter(Boolean);
      const primary = toDisplayText(product.imageUrl).trim();
      if (urls.length) return urls;
      return primary ? [primary] : [];
    })(),
    highlights: toDisplayTextList(product.highlights),
    rating: Number.isFinite(product.rating) ? product.rating : 0,
    reviewCount: Number.isFinite(product.reviewCount)
      ? Math.round(product.reviewCount)
      : 0,
    sortPriority:
      product.sortPriority != null && Number.isFinite(product.sortPriority)
        ? Math.round(product.sortPriority)
        : null,
    imageUrl:
      toDisplayText(product.imageUrl).trim() ||
      (product.imageUrls?.[0] ? toDisplayText(product.imageUrls[0]).trim() : ""),
  };
}

export function formatINR(n: number) {
  try {
    return n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

export function formatReviewCount(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)} lac`;
  return n.toLocaleString("en-IN");
}

export function initialsFromTitle(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function platformOptionCount(product: ShopCatalogProduct): number {
  return product.platforms.filter(
    (p) => p.price != null && p.affiliateUrl?.trim(),
  ).length;
}

export function discountLabel(product: ShopCatalogProduct): string | null {
  if (product.savingsPercent != null && product.savingsPercent > 0) {
    return `${product.savingsPercent}% OFF on MRP`;
  }
  return null;
}
