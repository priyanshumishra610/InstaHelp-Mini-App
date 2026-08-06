import type { HolidayPackage } from "@/types/experienceCatalog";

export function buildHolidayWhatsAppMessage(pkg: HolidayPackage): string {
  const lines = [
    "Hi InstaHelp! I'd like to enquire about a holiday package.",
    "",
    `*${pkg.title}*`,
    `Destination: ${pkg.destination || pkg.country}`,
    `Duration: ${pkg.duration}`,
  ];

  if (pkg.priceFrom) lines.push(`Budget: ${pkg.priceFrom}`);
  if (pkg.budgetTier) lines.push(`Tier: ${pkg.budgetTier}`);
  if (pkg.theme) lines.push(`Theme: ${pkg.theme}`);
  if (pkg.tripStyle) lines.push(`Style: ${pkg.tripStyle}`);
  if (pkg.bestMonths) lines.push(`Best months: ${pkg.bestMonths}`);
  if (pkg.visaType) lines.push(`Visa: ${pkg.visaType}`);
  if (pkg.highlights.length > 0) {
    lines.push(`Highlights: ${pkg.highlights.slice(0, 4).join(" · ")}`);
  }

  lines.push(
    "",
    "Please share availability, best price, and next steps. Thank you!",
  );

  return lines.join("\n");
}
