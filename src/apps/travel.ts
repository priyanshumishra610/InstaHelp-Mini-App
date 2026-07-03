import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const TRAVEL_APPS: ShopApp[] = [
  createApp({
    id: "app-uber",
    name: "Uber",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "Book rides across cities with upfront pricing, live tracking, and multiple vehicle options.",
    features: ["Live ride tracking", "Upfront fares", "Cashless payments", "Ride scheduling"],
    websiteUrl: "https://www.uber.com/in/en/",
    rating: 4.5,
    reviewCount: 2800000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-ola",
    name: "Ola",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "India's homegrown mobility app for cabs, auto, bike rides, and outstation travel.",
    features: ["Auto & bike rides", "Outstation cabs", "Ola Money", "Share rides"],
    websiteUrl: "https://www.olacabs.com/",
    rating: 4.3,
    reviewCount: 1900000,
    badge: "Trending",
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-rapido",
    name: "Rapido",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "Quick bike taxi and auto rides for affordable last-mile connectivity in Indian cities.",
    features: ["Bike taxis", "Auto rides", "Low fares", "Quick pickups"],
    websiteUrl: "https://rapido.bike/",
    rating: 4.2,
    reviewCount: 890000,
    isTrending: true,
    sortPriority: 3,
  }),
  createApp({
    id: "app-makemytrip",
    name: "MakeMyTrip",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "Book flights, hotels, holiday packages, and buses with exclusive travel deals.",
    features: ["Flight booking", "Hotel stays", "Holiday packages", "Trip rewards"],
    websiteUrl: "https://www.makemytrip.com/",
    rating: 4.4,
    reviewCount: 1200000,
    badge: "Bestseller",
    sortPriority: 4,
  }),
  createApp({
    id: "app-ixigo",
    name: "ixigo",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "Compare and book flights, trains, buses, and hotels at the best available prices.",
    features: ["Fare alerts", "Train PNR status", "Bus booking", "Hotel deals"],
    websiteUrl: "https://www.ixigo.com/",
    rating: 4.3,
    reviewCount: 650000,
    sortPriority: 5,
  }),
  createApp({
    id: "app-goibibo",
    name: "Goibibo",
    appCategoryId: "travel",
    shopCategoryId: "automotive",
    description:
      "Travel booking platform for flights, hotels, buses, and trains with goCash rewards.",
    features: ["goCash rewards", "Flight deals", "Hotel booking", "Bus tickets"],
    websiteUrl: "https://www.goibibo.com/",
    rating: 4.2,
    reviewCount: 540000,
    sortPriority: 6,
  }),
];
