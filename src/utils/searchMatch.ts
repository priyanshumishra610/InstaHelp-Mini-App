/**
 * Normalize free text for catalog search (case, accents, punctuation).
 */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when every query token appears somewhere in the joined haystack.
 * Empty / whitespace-only query matches everything.
 */
export function matchesSearchQuery(
  parts: Array<string | number | null | undefined>,
  query: string | null | undefined,
): boolean {
  const q = normalizeSearchText(query ?? "");
  if (!q) return true;

  const hay = normalizeSearchText(
    parts
      .filter((p) => p != null && String(p).trim().length > 0)
      .map(String)
      .join(" "),
  );

  return q.split(" ").every((token) => hay.includes(token));
}
