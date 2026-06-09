import {
  BONUS_GAME_HANGMAN_CREDITS,
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
  BONUS_WHACK_MEDIUM_CREDITS,
} from "@/constants/vendorMarketplace";

export type InstaGameRoute =
  | "/(tabs)/vendors/arcade/grid"
  | "/(tabs)/vendors/arcade/hangman"
  | "/(tabs)/vendors/arcade/whack";

export type InstaGame = {
  id: string;
  title: string;
  tagline: string;
  route: InstaGameRoute;
  rewardCoins: number;
  gradient: readonly [string, string, string?];
  icon: string;
  featured?: boolean;
};

export const INSTA_GAMES: InstaGame[] = [
  {
    id: "grid",
    title: "Insta Grid",
    tagline: "Outsmart the AI in tic-tac-toe.",
    route: "/(tabs)/vendors/arcade/grid",
    rewardCoins: BONUS_GAME_TIC_TAC_TOE_CREDITS,
    gradient: ["#7C3AED", "#9333ea", "#a855f7"],
    icon: "grid-outline",
    featured: true,
  },
  {
    id: "hangman",
    title: "Hangman",
    tagline: "Guess the InstaHelp word.",
    route: "/(tabs)/vendors/arcade/hangman",
    rewardCoins: BONUS_GAME_HANGMAN_CREDITS,
    gradient: ["#6366f1", "#8b5cf6", "#a855f7"],
    icon: "book-outline",
    featured: true,
  },
  {
    id: "whack",
    title: "Whack-a-mole",
    tagline: "Tap moles. Beat the clock.",
    route: "/(tabs)/vendors/arcade/whack",
    rewardCoins: BONUS_WHACK_MEDIUM_CREDITS,
    gradient: ["#059669", "#14b8a6", "#0d9488"],
    icon: "flash-outline",
    featured: true,
  },
];

export function getFeaturedInstaGames(): InstaGame[] {
  return INSTA_GAMES.filter((g) => g.featured);
}

export function findInstaGameById(id: string): InstaGame | undefined {
  return INSTA_GAMES.find((g) => g.id === id);
}

export function instaGamesByIds(ids: string[]): InstaGame[] {
  return ids
    .map((id) => findInstaGameById(id))
    .filter((g): g is InstaGame => g != null);
}
