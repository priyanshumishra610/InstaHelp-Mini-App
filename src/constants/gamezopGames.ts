export type GameCategoryId =
  | "trending"
  | "arcade"
  | "puzzle"
  | "racing"
  | "action"
  | "quick"
  | "play-earn";

export type GameCategory = {
  id: GameCategoryId;
  title: string;
  subtitle: string;
};

export type GamezopGame = {
  id: string;
  title: string;
  tagline: string;
  url: string;
  categories: GameCategoryId[];
  rewardCoins: number;
  gradient: readonly [string, string, string?];
  icon: string;
  featured?: boolean;
  playEarn?: boolean;
};

const BASE = "https://zv1y2i8p.play.gamezop.com/g";

export const GAMEZOP_CATEGORIES: GameCategory[] = [
  { id: "trending", title: "Trending", subtitle: "Hot picks right now" },
  { id: "arcade", title: "Arcade", subtitle: "Classic arcade vibes" },
  { id: "puzzle", title: "Puzzle", subtitle: "Brain teasers & logic" },
  { id: "racing", title: "Racing", subtitle: "Speed & reflex" },
  { id: "action", title: "Action", subtitle: "Fast-paced thrills" },
  { id: "quick", title: "Quick Games", subtitle: "Under 3 minutes" },
  { id: "play-earn", title: "Play & Earn", subtitle: "Bonus coins on every run" },
];

export const GAMEZOP_GAMES: GamezopGame[] = [
  {
    id: "gTD1yQp3R",
    title: "Neon Stack",
    tagline: "Stack blocks. Beat your high score.",
    url: `${BASE}/gTD1yQp3R`,
    categories: ["trending", "arcade", "play-earn"],
    rewardCoins: 10,
    gradient: ["#6366f1", "#8b5cf6", "#a855f7"],
    icon: "layers",
    featured: true,
    playEarn: true,
  },
  {
    id: "9lpHai56Q",
    title: "Puzzle Blitz",
    tagline: "Match fast. Think faster.",
    url: `${BASE}/9lpHai56Q`,
    categories: ["trending", "puzzle", "quick", "play-earn"],
    rewardCoins: 12,
    gradient: ["#0ea5e9", "#06b6d4", "#14b8a6"],
    icon: "extension-puzzle",
    featured: true,
    playEarn: true,
  },
  {
    id: "UCS62KJ8c",
    title: "Turbo Drift",
    tagline: "Drift through neon circuits.",
    url: `${BASE}/UCS62KJ8c`,
    categories: ["trending", "racing", "action"],
    rewardCoins: 15,
    gradient: ["#f97316", "#ef4444", "#dc2626"],
    icon: "car-sport",
    featured: true,
  },
  {
    id: "Skz4pzkDqyX",
    title: "Galaxy Strike",
    tagline: "Dodge. Shoot. Survive.",
    url: `${BASE}/Skz4pzkDqyX`,
    categories: ["action", "arcade", "quick"],
    rewardCoins: 10,
    gradient: ["#ec4899", "#d946ef", "#a855f7"],
    icon: "rocket",
    featured: true,
  },
  {
    id: "rkWfy2pXq0r",
    title: "Coin Runner",
    tagline: "Collect coins. Unlock boosts.",
    url: `${BASE}/rkWfy2pXq0r`,
    categories: ["arcade", "quick", "play-earn"],
    rewardCoins: 8,
    gradient: ["#22c55e", "#10b981", "#059669"],
    icon: "cash",
    playEarn: true,
  },
  {
    id: "gTD1yQp3R-arcade",
    title: "Block Rush",
    tagline: "Arcade stacking challenge.",
    url: `${BASE}/gTD1yQp3R`,
    categories: ["arcade"],
    rewardCoins: 8,
    gradient: ["#3b82f6", "#2563eb"],
    icon: "grid",
  },
  {
    id: "9lpHai56Q-puzzle",
    title: "Mind Maze",
    tagline: "Solve under pressure.",
    url: `${BASE}/9lpHai56Q`,
    categories: ["puzzle"],
    rewardCoins: 10,
    gradient: ["#14b8a6", "#0d9488"],
    icon: "bulb",
  },
  {
    id: "UCS62KJ8c-racing",
    title: "Hyper Lane",
    tagline: "One lane. Full throttle.",
    url: `${BASE}/UCS62KJ8c`,
    categories: ["racing"],
    rewardCoins: 12,
    gradient: ["#f59e0b", "#ea580c"],
    icon: "speedometer",
  },
  {
    id: "Skz4pzkDqyX-action",
    title: "Orb Blaster",
    tagline: "Chain combos for mega points.",
    url: `${BASE}/Skz4pzkDqyX`,
    categories: ["action"],
    rewardCoins: 14,
    gradient: ["#e11d48", "#be123c"],
    icon: "flash",
  },
  {
    id: "rkWfy2pXq0r-quick",
    title: "Sprint Coins",
    tagline: "Quick session. Big rewards.",
    url: `${BASE}/rkWfy2pXq0r`,
    categories: ["quick"],
    rewardCoins: 6,
    gradient: ["#84cc16", "#65a30d"],
    icon: "timer",
  },
];

export function getFeaturedGames(): GamezopGame[] {
  return GAMEZOP_GAMES.filter((g) => g.featured);
}

export function getGamesByCategory(categoryId: GameCategoryId): GamezopGame[] {
  return GAMEZOP_GAMES.filter((g) => g.categories.includes(categoryId));
}

export function findGameById(id: string): GamezopGame | undefined {
  return GAMEZOP_GAMES.find((g) => g.id === id);
}
