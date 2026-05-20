import * as Linking from "expo-linking";

import { WHATSAPP_E164 } from "@/config/env";

function sanitizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}

export function openWhatsApp(text?: string) {
  const n = sanitizePhone(WHATSAPP_E164);
  const encoded = text ? encodeURIComponent(text) : "";
  const url = `https://wa.me/${n}${encoded ? `?text=${encoded}` : ""}`;
  return Linking.openURL(url);
}
