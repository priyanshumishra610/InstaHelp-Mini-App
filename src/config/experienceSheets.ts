import {
  COUNTRIES_GID,
  COUNTRIES_SHEET_ID,
  HOLIDAYS_GID,
  HOLIDAYS_SHEET_ID,
  RESORTS_GID,
  RESORTS_SHEET_ID,
} from "@/config/env";

export const EXPERIENCE_SYNC_POLL_MS = 5 * 60 * 1000;
export const EXPERIENCE_CACHE_VERSION = 1 as const;

function sheetCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

export function holidaysCsvUrl(): string {
  return sheetCsvUrl(HOLIDAYS_SHEET_ID, HOLIDAYS_GID);
}

export function resortsCsvUrl(): string {
  return sheetCsvUrl(RESORTS_SHEET_ID, RESORTS_GID);
}

export function countriesCsvUrl(): string {
  return sheetCsvUrl(COUNTRIES_SHEET_ID, COUNTRIES_GID);
}

export function withCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_=${Date.now()}`;
}
