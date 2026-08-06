/** Quote-aware CSV parser that supports newlines inside quoted fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === ",") {
      row.push(cur);
      cur = "";
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cur = "";
      continue;
    }
    cur += ch;
  }

  row.push(cur);
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row);
  }
  return rows;
}

export function normalizeHeader(value: string): string {
  return value
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\n/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function colIndex(
  headers: string[],
  names: string[],
  fallback = -1,
): number {
  const normalized = headers.map(normalizeHeader);
  for (const name of names) {
    const idx = normalized.indexOf(normalizeHeader(name));
    if (idx >= 0) return idx;
  }
  return fallback;
}

export function cell(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return "";
  return String(row[index] ?? "").trim();
}

export function pickHttpUrl(raw: string): string | null {
  let u = String(raw ?? "").trim();
  if (!u.startsWith("http")) return null;
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1).trim();
  }
  if (!u.startsWith("http")) return null;
  try {
    return encodeURI(decodeURI(u));
  } catch {
    return u.replace(/\s/g, "%20");
  }
}

export function fingerprintCsv(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function slugify(value: string, fallback = "item"): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return slug || fallback;
}

export function parseNumber(raw: string): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function formatInr(amount: number | null): string | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  return `From ₹${Math.round(amount).toLocaleString("en-IN")}`;
}
