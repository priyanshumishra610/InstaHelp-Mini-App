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
const STATIC_BASE = "https://static.gamezop.com";

export type GamezopImageKind = "thumb" | "cover" | "brick" | "square";

/** Official Gamezop CDN assets (see Gamezop All Games API `images` field). */
export function getGamezopImageUrl(
  gameId: string,
  kind: GamezopImageKind = "thumb",
): string {
  const file =
    kind === "cover"
      ? "cover.jpg"
      : kind === "brick"
        ? "brick.png"
        : kind === "square"
          ? "square.png"
          : "thumb.png";
  return `${STATIC_BASE}/${gameId}/${file}`;
}

export const GAMEZOP_CATEGORIES: GameCategory[] = [
  { id: "trending", title: "Trending", subtitle: "Hot picks right now" },
  { id: "arcade", title: "Arcade", subtitle: "Classic arcade vibes" },
  { id: "puzzle", title: "Puzzle", subtitle: "Brain teasers & logic" },
  { id: "racing", title: "Racing", subtitle: "Speed & reflex" },
  { id: "action", title: "Action", subtitle: "Fast-paced thrills" },
  { id: "quick", title: "Quick Games", subtitle: "Under 3 minutes" },
  { id: "play-earn", title: "Play & Earn", subtitle: "Bonus coins on every run" },
];

/** Titles verified from Gamezop embed page titles. */
export const GAMEZOP_GAMES: GamezopGame[] = [
  {
    id: "gTD1yQp3R",
    title: "Final War Dead Zone",
    tagline: "Survive the dead zone.",
    url: `${BASE}/gTD1yQp3R`,
    categories: ["trending", "action", "arcade", "play-earn"],
    rewardCoins: 10,
    gradient: ["#6366f1", "#8b5cf6", "#a855f7"],
    icon: "skull",
    featured: true,
    playEarn: true,
  },
  {
    id: "9lpHai56Q",
    title: "Assassin's Hunt",
    tagline: "Wild West action.",
    url: `${BASE}/9lpHai56Q`,
    categories: ["trending", "action", "quick", "play-earn"],
    rewardCoins: 12,
    gradient: ["#f97316", "#ea580c", "#c2410c"],
    icon: "eye",
    featured: true,
    playEarn: true,
  },
  {
    id: "UCS62KJ8c",
    title: "Blocks Adventure",
    tagline: "Jungle block puzzle saga.",
    url: `${BASE}/UCS62KJ8c`,
    categories: ["trending", "puzzle", "arcade"],
    rewardCoins: 15,
    gradient: ["#22c55e", "#10b981", "#059669"],
    icon: "grid",
    featured: true,
  },
  {
    id: "Skz4pzkDqyX",
    title: "Escape Run",
    tagline: "Run and escape danger.",
    url: `${BASE}/Skz4pzkDqyX`,
    categories: ["action", "arcade", "quick"],
    rewardCoins: 10,
    gradient: ["#ec4899", "#d946ef", "#a855f7"],
    icon: "footsteps",
    featured: true,
  },
  {
    id: "rkWfy2pXq0r",
    title: "Fruit Chop",
    tagline: "Slice fruit. Beat the clock.",
    url: `${BASE}/rkWfy2pXq0r`,
    categories: ["arcade", "quick", "play-earn"],
    rewardCoins: 8,
    gradient: ["#84cc16", "#65a30d", "#4d7c0f"],
    icon: "nutrition",
    playEarn: true,
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

export function gamesByIds(ids: string[]): GamezopGame[] {
  return ids
    .map((id) => findGameById(id))
    .filter((g): g is GamezopGame => g != null);
}
