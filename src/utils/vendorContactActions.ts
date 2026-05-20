import * as Linking from "expo-linking";

import { whatsappUrlForPhone } from "./vendorPhone";

export async function dialPhone(raw: string | null | undefined) {
  if (!raw?.trim()) return;
  const cleaned = raw.replace(/[^\d+]/g, "");
  const url = `tel:${cleaned}`;
  const can = await Linking.canOpenURL(url);
  if (can) await Linking.openURL(url);
}

export async function emailVendor(address: string | null | undefined, subject?: string) {
  if (!address?.trim()) return;
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  const url = `mailto:${address.trim()}${q}`;
  const can = await Linking.canOpenURL(url);
  if (can) await Linking.openURL(url);
}

export async function openVendorWhatsApp(
  raw: string | null | undefined,
  prefilled?: string,
) {
  const url = whatsappUrlForPhone(raw, prefilled);
  if (!url) return;
  const can = await Linking.canOpenURL(url);
  if (can) await Linking.openURL(url);
}
