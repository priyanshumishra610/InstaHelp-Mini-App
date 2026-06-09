import type { ExplorePlanId } from "@/constants/explorePlans";

export type ExploreSubscriptionPlan = ExplorePlanId;
export type ExploreSubscriptionStatus = "active" | "expired" | "none";

export type ExploreSubscription = {
  phone: string;
  plan: ExploreSubscriptionPlan;
  status: ExploreSubscriptionStatus;
  periodEnd: string | null;
  revealsUsedThisWeek: number;
  /** null = unlimited (Pro+) */
  revealsRemaining: number | null;
  weeklyLimit: number | null;
  unlimitedReveals: boolean;
};

export type ExploreOrderResult = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: ExplorePlanId;
};

export type ExploreRevealResult =
  | {
      ok: true;
      usedCredits: boolean;
      subscription: ExploreSubscription;
    }
  | {
      ok: false;
      reason: "weekly_limit";
      subscription: ExploreSubscription;
    };
