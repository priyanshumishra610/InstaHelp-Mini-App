import type { WeeklyOffer, WeeklyOffersResponse } from "@/types/offers";

/** Static seed data — swap for API via `fetchWeeklyOffers()` later. */
export const WEEKLY_OFFERS: WeeklyOffer[] = [
  {
    id: "offer-week-home",
    title: "Offer of the Week",
    subtitle: "Get up to 40% off on home services.",
    cta: "Book now",
    tag: "Limited Time",
    badge: "Up to 40% off",
    timerEndsAt: Date.now() + 1000 * 60 * 60 * 24 * 5,
    gradient: ["#f8fafc", "#e8f0fc"],
    icon: "home-outline",
    image: {
      uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
    },
    action: "https://trawel.in/coorgwildernessresort#featured-offer",
  },
  {
    id: "offer-business",
    title: "Business Essentials",
    subtitle: "GST, CA & legal help starting at ₹499.",
    cta: "Explore",
    gradient: ["#fafaf9", "#f3f0ea"],
    icon: "briefcase-outline",
    image: {
      uri: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70",
    },
    action: "category:business",
  },
  {
    id: "offer-tech",
    title: "Tech & Creative",
    subtitle: "Build your website or app with verified experts.",
    cta: "Get Started",
    gradient: ["#fafbfc", "#eef1f8"],
    icon: "code-slash-outline",
    image: {
      uri: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70",
    },
    action: "category:tech-creative",
  },
];

export function getWeeklyOffers(): WeeklyOffersResponse {
  return { offers: WEEKLY_OFFERS, updatedAt: new Date().toISOString() };
}
