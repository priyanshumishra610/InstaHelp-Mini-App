export type ExplorePlanId = "free" | "pro" | "pro_plus";

export type ExplorePlan = {
  id: ExplorePlanId;
  name: string;
  tagline: string;
  priceInr: number | null;
  billingLabel: string | null;
  ctaLabel: string;
  featuresHeader: string;
  features: readonly string[];
  limitsNote?: string;
  /** Highlight as recommended in the plans picker */
  recommended?: boolean;
};

export const EXPLORE_PLANS: readonly ExplorePlan[] = [
  {
    id: "pro",
    name: "Pro",
    tagline: "For regular vendor discovery",
    priceInr: 99,
    billingLabel: "Billed monthly",
    ctaLabel: "Get Pro plan",
    featuresHeader: "Everything in Free, plus:",
    features: [
      "10 vendor reveals every week",
      "Verified vendors filter",
      "Save unlimited vendors",
      "Fewer ad interruptions vs Free",
    ],
    limitsNote: "Weekly allowance resets every Monday. Unused reveals don't roll over.",
    recommended: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    tagline: "Unlimited access for power users",
    priceInr: 299,
    billingLabel: "Billed monthly",
    ctaLabel: "Get Pro+ plan",
    featuresHeader: "Everything in Pro, plus:",
    features: [
      "Unlimited vendor reveals",
      "Multi-city marketplace access",
      "Priority support on WhatsApp",
      "Early access to new categories",
      "Skip credit grind and ad farming",
    ],
    limitsNote: "Fair-use policy applies for automated or bulk scraping.",
  },
  {
    id: "free",
    name: "Free",
    tagline: "Try InstaHelp Explore",
    priceInr: 0,
    billingLabel: null,
    ctaLabel: "Continue with Free",
    featuresHeader: "Included:",
    features: [
      "Welcome credits to start",
      "Earn more credits by watching rewarded ads",
      "Unlock vendor contacts with credits",
      "Search 4,500+ vendors nationwide",
      "Basic filters by city & category",
    ],
  },
] as const;

export const PRO_WEEKLY_REVEAL_LIMIT = 10;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
