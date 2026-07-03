import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const FINANCE_APPS: ShopApp[] = [
  createApp({
    id: "app-phonepe",
    name: "PhonePe",
    appCategoryId: "finance",
    shopCategoryId: "electronics",
    description:
      "India's leading UPI payments app for transfers, recharges, bills, and investments.",
    features: ["UPI payments", "Bill payments", "Recharge", "Mutual funds"],
    websiteUrl: "https://www.phonepe.com/",
    rating: 4.5,
    reviewCount: 4500000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-paytm",
    name: "Paytm",
    appCategoryId: "finance",
    shopCategoryId: "electronics",
    description:
      "All-in-one payments app for UPI, wallet, recharges, tickets, and financial services.",
    features: ["UPI & wallet", "Movie tickets", "Flight booking", "Paytm Postpaid"],
    websiteUrl: "https://paytm.com/",
    rating: 4.2,
    reviewCount: 3800000,
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-google-pay",
    name: "Google Pay",
    appCategoryId: "finance",
    shopCategoryId: "electronics",
    description:
      "Simple and secure UPI payments, bill pay, and rewards from Google.",
    features: ["UPI payments", "Bill pay", "Rewards & offers", "Tap to pay"],
    websiteUrl: "https://pay.google.com/intl/en_in/about/",
    rating: 4.4,
    reviewCount: 2900000,
    badge: "Trusted",
    sortPriority: 3,
  }),
  createApp({
    id: "app-cred",
    name: "CRED",
    appCategoryId: "finance",
    shopCategoryId: "electronics",
    description:
      "Premium credit card bill payments with rewards, curated offers, and credit score insights.",
    features: ["Credit bill pay", "CRED coins", "Credit score", "Exclusive rewards"],
    websiteUrl: "https://cred.club/",
    rating: 4.3,
    reviewCount: 780000,
    isNew: true,
    sortPriority: 4,
  }),
];
