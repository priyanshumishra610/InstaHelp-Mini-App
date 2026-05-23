import {
  GAMEZOP_GAMES,
  getFeaturedGames,
  type GamezopGame,
} from "@/constants/gamezopGames";

export type MyGameEntry = GamezopGame & {
  lastPlayedLabel: string;
};

export type HubGameItem = {
  game: GamezopGame;
  label?: string;
};

export const MY_GAMES: MyGameEntry[] = [
  {
    ...GAMEZOP_GAMES[0],
    title: "Neon Stack",
    lastPlayedLabel: "Yesterday",
  },
  {
    ...GAMEZOP_GAMES[1],
    title: "Puzzle Blitz",
    lastPlayedLabel: "14/05/2026",
  },
  {
    ...GAMEZOP_GAMES[4],
    title: "Coin Runner",
    lastPlayedLabel: "2 days ago",
  },
];

export const RECOMMENDED_GAMES: HubGameItem[] = [
  { game: GAMEZOP_GAMES[2], label: "Soccer Star" },
  { game: GAMEZOP_GAMES[3], label: "Space War" },
  { game: GAMEZOP_GAMES[0], label: "Stack Hero" },
  { game: GAMEZOP_GAMES[1], label: "Puzzle Pop" },
  { game: GAMEZOP_GAMES[4], label: "Coin Dash" },
  { game: GAMEZOP_GAMES[7], label: "Hyper Lane" },
];

export const TOP_INSTANT_PLAYS: HubGameItem[] = [
  { game: GAMEZOP_GAMES[9], label: "Sprint Coins" },
  { game: GAMEZOP_GAMES[8], label: "Orb Blaster" },
  { game: GAMEZOP_GAMES[6], label: "Turbo Drift" },
  { game: GAMEZOP_GAMES[5], label: "Block Rush" },
  { game: GAMEZOP_GAMES[3], label: "Galaxy Strike" },
  { game: GAMEZOP_GAMES[1], label: "Mind Maze" },
];

export const FEATURED_AD_GAME: GamezopGame =
  getFeaturedGames().find((g) => g.id === "9lpHai56Q") ?? GAMEZOP_GAMES[1];

export const HUB_COLORS = {
  bgTop: "#2a1454",
  bgMid: "#1a0b2e",
  bgBottom: "#0a0612",
  cardBg: "rgba(255,255,255,0.09)",
  cardBorder: "rgba(255,255,255,0.1)",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  accentBlue: "#3b82f6",
  adBadge: "rgba(0,0,0,0.45)",
} as const;
