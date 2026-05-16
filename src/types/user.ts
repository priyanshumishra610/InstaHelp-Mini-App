export type SavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type ProfilePreferredContact = "whatsapp" | "call" | "either";

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
  /**
   * How InstaHelp should reach you (stored locally; not sent to the sheet API).
   */
  preferredContact?: ProfilePreferredContact;
  addresses: SavedAddress[];
  favorites: string[];
};
