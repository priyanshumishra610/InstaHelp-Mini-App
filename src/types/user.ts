export type SavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type ProfilePreferredContact = "whatsapp" | "call" | "either";

export type UserGender = "male" | "female" | "other" | "prefer_not_to_say";

export type UserProfile = {
  phone: string;
  name?: string;
  /** Whole years, e.g. 28 */
  age?: number | null;
  gender?: UserGender | null;
  city?: string | null;
  email?: string | null;
  /** User-entered date string, e.g. "DD / MM / YYYY" */
  birthday?: string | null;
  /** User-entered date string, e.g. "DD / MM / YYYY" */
  anniversary?: string | null;
  /**
   * Profile photo (file URI or data URL). Kept on device only — not sent to the
   * backend.
   */
  avatarUri?: string;
  /**
   * Fallback avatar seed used to generate a cute placeholder when `avatarUri`
   * isn't set. Kept on device only.
   */
  avatarSeed?: string;
  /** Consumer vs local business — drives opportunity-style notification copy. */
  role?: "consumer" | "business";
  /**
   * How InstaHelp should reach you (stored locally; not sent to the backend API).
   */
  preferredContact?: ProfilePreferredContact;
  addresses: SavedAddress[];
  favorites: string[];
};
