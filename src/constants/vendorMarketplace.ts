export const VENDOR_REVEAL_CREDIT_COST = 10;
export const VENDOR_INITIAL_CREDITS = 25;

/** Credits when a user opens any game (WebView or native), up to daily caps below. */
export const GAME_OPEN_CREDIT_REWARD = 10;

/** Max vendor credits from game opens per local calendar day (5 opens × 10). */
export const GAME_OPEN_DAILY_MAX_CREDITS = 50;

export const GAME_OPEN_DAILY_MAX_COUNT =
  GAME_OPEN_DAILY_MAX_CREDITS / GAME_OPEN_CREDIT_REWARD;

/** Daily mini-game prize (won once per local calendar day). */
export const BONUS_GAME_TIC_TAC_TOE_CREDITS = 10;

export const BONUS_GAME_HANGMAN_CREDITS = 10;

export type WhackDifficulty = "easy" | "medium" | "hard";

export const BONUS_WHACK_EASY_CREDITS = 5;

export const BONUS_WHACK_MEDIUM_CREDITS = 10;

export const BONUS_WHACK_HARD_CREDITS = 15;

/** @deprecated Prefer BONUS_WHACK_* per tier — kept as medium for older imports */
export const BONUS_GAME_WHACK_CREDITS = BONUS_WHACK_MEDIUM_CREDITS;

export const WHACK_LEVEL_CONFIG: Record<
  WhackDifficulty,
  {
    label: string;
    credits: number;
    threshold: number;
    roundSeconds: number;
    moleVisibleMs: number;
    spawnPauseMs: number;
  }
> = {
  easy: {
    label: "Easy",
    credits: BONUS_WHACK_EASY_CREDITS,
    threshold: 10,
    roundSeconds: 27,
    moleVisibleMs: 920,
    spawnPauseMs: 300,
  },
  medium: {
    label: "Medium",
    credits: BONUS_WHACK_MEDIUM_CREDITS,
    threshold: 15,
    roundSeconds: 23,
    moleVisibleMs: 720,
    spawnPauseMs: 320,
  },
  hard: {
    label: "Hard",
    credits: BONUS_WHACK_HARD_CREDITS,
    threshold: 20,
    roundSeconds: 18,
    moleVisibleMs: 520,
    spawnPauseMs: 260,
  },
};

/** One slot per arcade payout (Insta Grid, Hangman, Whack ×3 difficulties). */
export const ARCADE_DAILY_PRIZE_SLOTS = 5;

/** Max extra credits if every daily arcade prize is redeemed the same calendar day. */
export const ARCADE_DAILY_BONUS_CREDITS_TOTAL =
  BONUS_GAME_TIC_TAC_TOE_CREDITS +
  BONUS_GAME_HANGMAN_CREDITS +
  BONUS_WHACK_EASY_CREDITS +
  BONUS_WHACK_MEDIUM_CREDITS +
  BONUS_WHACK_HARD_CREDITS;

/** Fallback “you are here” for distance ranking when GPS is unavailable. */
export const BANGALORE_CITY_CENTER: { lat: number; lng: number } = {
  lat: 12.9716,
  lng: 77.5946,
};
