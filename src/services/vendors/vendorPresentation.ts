import type { VendorRecord } from "@/types/vendorMarketplace";

export function formatStartingPrice(v: VendorRecord): string {
  if (v.startingPrice == null || !Number.isFinite(v.startingPrice)) {
    return "Price on request";
  }
  const n = Math.round(v.startingPrice);
  return `From ₹${n.toLocaleString("en-IN")}`;
}

export function vendorGallerySources(v: VendorRecord): string[] {
  const urls: string[] = [];
  const p = v.profileImageUrl?.trim();
  if (p?.startsWith("http")) urls.push(p);
  if (v.shopImageUrls) {
    const parts = v.shopImageUrls.split(/[,;]/);
    for (const part of parts) {
      const u = part.trim();
      if (u.startsWith("http")) urls.push(u);
    }
  }
  return [...new Set(urls)].slice(0, 8);
}

export function serviceDescriptionPreview(v: VendorRecord, maxLen = 120): string {
  const parts = [
    v.servicesText.trim(),
    v.subCategory.trim(),
    v.category.trim(),
  ].filter(Boolean);
  const text = parts[0] ?? "Professional Bengaluru-area service.";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}
