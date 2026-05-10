import * as Linking from "expo-linking";

import { WHATSAPP_E164 } from "@/api/env";

const DEFAULT_CONCIERGE_E164 = "917022702220";

function sanitizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}

export function openWhatsApp(text?: string) {
  const n = sanitizePhone(WHATSAPP_E164 || DEFAULT_CONCIERGE_E164);
  const encoded = text ? encodeURIComponent(text) : "";
  const url = `https://wa.me/${n}${encoded ? `?text=${encoded}` : ""}`;
  return Linking.openURL(url);
}
