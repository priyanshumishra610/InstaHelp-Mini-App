import type { ResortRecord } from "@/types/resortExperience";

export function buildResortWhatsAppMessage(
  resort: ResortRecord,
  options?: { roomType?: string; checkIn?: string; guests?: string },
): string {
  const lines = [
    "Hi InstaHelp! I'd like to book a resort stay.",
    "",
    `🏨 *${resort.name}*`,
    `📍 ${resort.location}${resort.region ? `, ${resort.region}` : ""}, ${resort.state}`,
  ];

  if (resort.category) lines.push(`Category: ${resort.category}`);
  if (resort.estimatedPriceLabel) {
    lines.push(`Estimated rate: ${resort.estimatedPriceLabel}`);
  }
  if (resort.tripadvisorRating != null) {
    lines.push(`Tripadvisor: ${resort.tripadvisorRating.toFixed(1)}★`);
  }
  if (options?.roomType) lines.push(`Room preference: ${options.roomType}`);
  if (options?.checkIn) lines.push(`Check-in: ${options.checkIn}`);
  if (options?.guests) lines.push(`Guests: ${options.guests}`);

  lines.push(
    "",
    "Please share availability, best price, and payment details. Thank you!",
  );

  return lines.join("\n");
}
