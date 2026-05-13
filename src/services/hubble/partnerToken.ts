/**
 * Hubble’s `token` query param must be a Partner JWT (header.payload.signature),
 * i.e. exactly two unencoded `.` separators. InstaHelp’s persisted `sessionToken`
 * is not that shape — sending it causes “JWT is invalid … Found: 0” style errors.
 */
export function sanitizeHubblePartnerToken(
  token: string | null | undefined,
): string | undefined {
  if (token == null) return undefined;
  const t = token.trim();
  if (!t) return undefined;
  const parts = t.split(".");
  if (parts.length !== 3) return undefined;
  if (parts.some((p) => p.length === 0)) return undefined;
  return t;
}
