import type { VendorCoordinates } from "@/types/vendorMarketplace";

const R = 6371;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function haversineKm(
  a: VendorCoordinates,
  b: VendorCoordinates,
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
