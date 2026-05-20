/** Digits only for tel:/wa.me */
export function normalizePhoneDigits(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

/**
 * Mask for premium “locked” UI, e.g. +91 98XXXXXX12
 */
export function maskPhoneForDisplay(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "+91 ••••••••••";
  const d = normalizePhoneDigits(raw);
  let local = d;
  if (d.length > 10 && d.startsWith("91")) {
    local = d.slice(-10);
  }
  if (local.length < 4) return "+91 ••••••••••";
  const start = local.slice(0, 2);
  const end = local.slice(-2);
  return `+91 ${start}XXXXXX${end}`;
}

export function whatsappUrlForPhone(raw: string | null | undefined, text?: string): string | null {
  const d = normalizePhoneDigits(raw);
  if (d.length < 8) return null;
  let n = d;
  if (d.length === 10) n = `91${d}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${n}${q}`;
}
