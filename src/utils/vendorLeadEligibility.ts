import type { CreditTransaction } from "@/types/vendorMarketplace";

/** Insta Grid / refill unlocks after the user has actually spent credits (e.g. a reveal). */
export function hasBurnedLeadCredits(
  transactions: readonly CreditTransaction[],
): boolean {
  return transactions.some((t) => t.kind === "credit_deduct");
}
