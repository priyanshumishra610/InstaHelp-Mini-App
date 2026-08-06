import { getShopCatalogSource } from "@/config/env";
import {
  shopProductsCsvUrl,
  shopTimestampCsvUrl,
  withCacheBust,
} from "@/config/shopSheet";
import { BUNDLED_SHOP_CSV } from "@/data/bundled-shop-csv";
import { useShopCatalogStore } from "@/store/shopCatalogStore";

import { parseShopProductsCsv, parseTimestampCell } from "./parseShopCsv";

async function fetchText(url: string, bust = false): Promise<string> {
  const target = bust ? withCacheBust(url) : url;
  const res = await fetch(target, {
    headers: { Accept: "text/csv,text/plain,*/*" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

function fingerprintCsv(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export async function fetchSheetTimestamp(): Promise<string | null> {
  if (getShopCatalogSource() === "bundled_csv") return null;
  const text = await fetchText(shopTimestampCsvUrl(), true);
  const value = parseTimestampCell(text);
  if (!value || value.includes("<!DOCTYPE")) return null;
  return value;
}

export async function fetchShopProductsCsv(): Promise<string> {
  if (getShopCatalogSource() === "bundled_csv") {
    return BUNDLED_SHOP_CSV;
  }
  return fetchText(shopProductsCsvUrl(), true);
}

/** Pulls the latest shop catalog into local cache. */
export async function syncShopCatalog(options?: {
  force?: boolean;
}): Promise<{ updated: boolean }> {
  const store = useShopCatalogStore.getState();
  store.setIsSyncing(true);

  try {
    let remoteTs: string | null = null;
    try {
      remoteTs = await fetchSheetTimestamp();
    } catch {
      remoteTs = null;
    }

    const cachedTs = store.sheet_last_updated;
    const hasCache = store.products.length > 0;

    if (
      !options?.force &&
      remoteTs &&
      cachedTs &&
      remoteTs === cachedTs &&
      hasCache
    ) {
      store.setFetchFailed(false);
      return { updated: false };
    }

    const csv = await fetchShopProductsCsv();
    const fingerprint = fingerprintCsv(csv);

    if (
      !options?.force &&
      !remoteTs &&
      fingerprint === store.csv_fingerprint &&
      hasCache
    ) {
      store.setFetchFailed(false);
      return { updated: false };
    }

    const products = parseShopProductsCsv(csv);
    const now = new Date().toISOString();

    store.setProducts(products);
    store.setLastFetchedAt(now);
    store.setSheetLastUpdated(remoteTs ?? now);
    store.setCsvFingerprint(fingerprint);
    store.setFetchFailed(false);
    if (hasCache) {
      store.flashPricesUpdated();
    }

    return { updated: true };
  } catch {
    store.setFetchFailed(true);
    return { updated: false };
  } finally {
    store.setIsSyncing(false);
  }
}
