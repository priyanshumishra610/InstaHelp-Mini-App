import {
  SHOP_PRODUCTS_GID,
  SHOP_SHEET_ID,
  SHOP_SHEET_PUBLISH_ID,
} from "@/config/env";

export { SHOP_PRODUCTS_GID, SHOP_SHEET_ID, SHOP_SHEET_PUBLISH_ID };

export const SHOP_SYNC_POLL_MS = 5 * 60 * 1000;
export const SHOP_STALE_CACHE_MS = 24 * 60 * 60 * 1000;
export const SHOP_CACHE_VERSION = 1 as const;

export function shopProductsCsvUrl(): string {
  if (SHOP_SHEET_PUBLISH_ID) {
    return `https://docs.google.com/spreadsheets/d/e/${SHOP_SHEET_PUBLISH_ID}/pub?gid=${SHOP_PRODUCTS_GID}&single=true&output=csv`;
  }
  return `https://docs.google.com/spreadsheets/d/${SHOP_SHEET_ID}/export?format=csv&gid=${SHOP_PRODUCTS_GID}`;
}

/** Catalog sync watermark cell (DASHBOARD!A2). */
export function shopTimestampCsvUrl(): string {
  if (SHOP_SHEET_PUBLISH_ID) {
    return `https://docs.google.com/spreadsheets/d/e/${SHOP_SHEET_PUBLISH_ID}/gviz/tq?tqx=out:csv&range=DASHBOARD!A2`;
  }
  return `https://docs.google.com/spreadsheets/d/${SHOP_SHEET_ID}/gviz/tq?tqx=out:csv&range=DASHBOARD!A2`;
}

export function withCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_=${Date.now()}`;
}
