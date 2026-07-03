import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const ENTERTAINMENT_APPS: ShopApp[] = [
  createApp({
    id: "app-netflix",
    name: "Netflix",
    appCategoryId: "entertainment",
    shopCategoryId: "toys-games",
    description:
      "Stream unlimited movies, TV shows, documentaries, and originals on any device.",
    features: ["Originals", "4K streaming", "Offline downloads", "Multiple profiles"],
    websiteUrl: "https://www.netflix.com/in/",
    rating: 4.4,
    reviewCount: 2100000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-prime-video",
    name: "Prime Video",
    appCategoryId: "entertainment",
    shopCategoryId: "toys-games",
    description:
      "Watch blockbuster movies, binge-worthy series, and Amazon Originals with Prime membership.",
    features: ["Amazon Originals", "4K UHD", "Offline viewing", "Prime benefits"],
    websiteUrl: "https://www.primevideo.com/",
    rating: 4.2,
    reviewCount: 1600000,
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-jiohotstar",
    name: "JioHotstar",
    appCategoryId: "entertainment",
    shopCategoryId: "toys-games",
    description:
      "Stream live sports, cricket, movies, and TV shows from Disney, HBO, and more.",
    features: ["Live cricket", "Disney content", "Live TV", "Regional movies"],
    websiteUrl: "https://www.hotstar.com/in",
    rating: 4.3,
    reviewCount: 2400000,
    badge: "Trending",
    isTrending: true,
    sortPriority: 3,
  }),
  createApp({
    id: "app-spotify",
    name: "Spotify",
    appCategoryId: "entertainment",
    shopCategoryId: "fashion",
    description:
      "Listen to millions of songs, podcasts, and playlists with personalised recommendations.",
    features: ["Music streaming", "Podcasts", "Personalised playlists", "Offline mode"],
    websiteUrl: "https://www.spotify.com/in/",
    rating: 4.5,
    reviewCount: 1800000,
    sortPriority: 4,
  }),
];
