import {
  findInstaGameById,
  getFeaturedInstaGames,
  instaGamesByIds,
  type InstaGame,
} from "@/constants/instaGames";

export type MyGameEntry = InstaGame & {
  lastPlayedLabel: string;
};

function requireGame(id: string): InstaGame {
  const game = findInstaGameById(id);
  if (!game) {
    throw new Error(`Unknown game id: ${id}`);
  }
  return game;
}

export const MY_GAMES: MyGameEntry[] = [
  {
    ...requireGame("grid"),
    lastPlayedLabel: "Yesterday",
  },
  {
    ...requireGame("hangman"),
    lastPlayedLabel: "14/05/2026",
  },
  {
    ...requireGame("whack"),
    lastPlayedLabel: "2 days ago",
  },
];

export const RECOMMENDED_GAMES: InstaGame[] = instaGamesByIds([
  "grid",
  "hangman",
  "whack",
]);

export const TOP_INSTANT_PLAYS: InstaGame[] = instaGamesByIds([
  "whack",
  "grid",
  "hangman",
]);

export const FEATURED_AD_GAME: InstaGame =
  getFeaturedInstaGames().find((g) => g.id === "hangman") ??
  requireGame("hangman");

export const HUB_COLORS = {
  bgTop: "#2a1454",
  bgMid: "#1a0b2e",
  bgBottom: "#0a0612",
  cardBg: "rgba(255,255,255,0.09)",
  cardBorder: "rgba(255,255,255,0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  accentBlue: "#292524",
  adBadge: "rgba(0,0,0,0.45)",
} as const;
