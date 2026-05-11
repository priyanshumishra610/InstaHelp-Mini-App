export type SavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type UserProfile = {
  phone: string;
  name?: string;
  /**
   * Profile photo (file URI or data URL). Kept on device only — not sent to the
   * concierge sheet.
   */
  avatarUri?: string;
  /** Consumer vs local business — drives opportunity-style notification copy. */
  role?: "consumer" | "business";
  addresses: SavedAddress[];
  favorites: string[];
};
