import { getExperienceCatalogSource } from "@/config/env";
import {
  countriesCsvUrl,
  holidaysCsvUrl,
  resortsCsvUrl,
  withCacheBust,
} from "@/config/experienceSheets";
import { parseCountriesCsv } from "@/services/experiences/parseCountriesCsv";
import { parseHolidaysCsv } from "@/services/experiences/parseHolidaysCsv";
import { parseResortsCsv } from "@/services/experiences/parseResortsCsv";
import { useExperienceCatalogStore } from "@/store/experienceCatalogStore";
import { fingerprintCsv } from "@/utils/parseCsv";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(withCacheBust(url), {
    headers: { Accept: "text/csv,text/plain,*/*" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const text = await res.text();
  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    throw new Error("Sheet export returned HTML (not public CSV)");
  }
  return text;
}

/**
 * Fetches resorts, holidays, and countries CSVs from Google Sheets.
 * Skips rewrite when fingerprints match (sheet unchanged).
 */
export async function syncExperienceCatalog(options?: {
  force?: boolean;
}): Promise<{ updated: boolean }> {
  if (getExperienceCatalogSource() === "bundled_json") {
    return { updated: false };
  }

  const store = useExperienceCatalogStore.getState();
  store.setIsSyncing(true);

  try {
    const [resortsCsv, holidaysCsv, countriesCsv] = await Promise.all([
      fetchText(resortsCsvUrl()),
      fetchText(holidaysCsvUrl()),
      fetchText(countriesCsvUrl()),
    ]);

    const resortsFp = fingerprintCsv(resortsCsv);
    const holidaysFp = fingerprintCsv(holidaysCsv);
    const countriesFp = fingerprintCsv(countriesCsv);

    const hasCache =
      store.resorts.length > 0 ||
      store.holidays.length > 0 ||
      store.countries.length > 0;

    if (
      !options?.force &&
      hasCache &&
      resortsFp === store.resorts_fingerprint &&
      holidaysFp === store.holidays_fingerprint &&
      countriesFp === store.countries_fingerprint
    ) {
      store.setFetchFailed(false);
      return { updated: false };
    }

    const { resorts, meta } = parseResortsCsv(resortsCsv);
    const holidays = parseHolidaysCsv(holidaysCsv);
    const countries = parseCountriesCsv(countriesCsv);

    store.setCatalog({
      resorts,
      resortMeta: meta,
      holidays,
      countries,
      resortsFingerprint: resortsFp,
      holidaysFingerprint: holidaysFp,
      countriesFingerprint: countriesFp,
      fetchedAt: new Date().toISOString(),
    });
    store.setFetchFailed(false);
    return { updated: true };
  } catch {
    store.setFetchFailed(true);
    return { updated: false };
  } finally {
    store.setIsSyncing(false);
  }
}
