export type SavedAddress = {
  id: string;
  label: string;
  line: string;
};

export type UserProfile = {
  phone: string;
  name?: string;
  addresses: SavedAddress[];
  favorites: string[];
};
