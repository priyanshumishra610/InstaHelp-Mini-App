import {
  findGameById,
  gamesByIds,
  getFeaturedGames,
  type GamezopGame,
} from "@/constants/gamezopGames";

export type MyGameEntry = GamezopGame & {
  lastPlayedLabel: string;
};

function requireGame(id: string): GamezopGame {
  const game = findGameById(id);
  if (!game) {
    throw new Error(`Unknown game id: ${id}`);
  }
  return game;
}

export const MY_GAMES: MyGameEntry[] = [
  {
    ...requireGame("gTD1yQp3R"),
    lastPlayedLabel: "Yesterday",
  },
  {
    ...requireGame("9lpHai56Q"),
    lastPlayedLabel: "14/05/2026",
  },
  {
    ...requireGame("rkWfy2pXq0r"),
    lastPlayedLabel: "2 days ago",
  },
];

export const RECOMMENDED_GAMES: GamezopGame[] = gamesByIds([
  "UCS62KJ8c",
  "Skz4pzkDqyX",
  "gTD1yQp3R",
  "9lpHai56Q",
  "rkWfy2pXq0r",
]);

export const TOP_INSTANT_PLAYS: GamezopGame[] = gamesByIds([
  "rkWfy2pXq0r",
  "Skz4pzkDqyX",
  "UCS62KJ8c",
  "gTD1yQp3R",
  "9lpHai56Q",
]);

export const FEATURED_AD_GAME: GamezopGame =
  getFeaturedGames().find((g) => g.id === "9lpHai56Q") ?? requireGame("9lpHai56Q");

export const HUB_COLORS = {
  bgTop: "#2a1454",
  bgMid: "#1a0b2e",
  bgBottom: "#0a0612",
  cardBg: "rgba(255,255,255,0.09)",
  cardBorder: "rgba(255,255,255,0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  accentBlue: "#8B5CF6",
  adBadge: "rgba(0,0,0,0.45)",
} as const;
