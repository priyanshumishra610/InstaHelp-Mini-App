export type UserGender = "male" | "female" | "other" | "prefer_not_to_say";

export type AuthProviderKind = "otp";

export type FirestoreAddress = {
  id: string;
  label: string;
  line: string;
  city?: string;
  area?: string;
  coordinates?: { lat: number; lng: number };
};

export type FirestoreUser = {
  uid: string;
  phoneNumber: string;
  fullName: string;
  gender: UserGender | "";
  city: string;
  area: string;
  coordinates: { lat: number; lng: number } | null;
  createdAt: string;
  credits: number;
  referralCode: string;
  profileImage: string | null;
  birthday: string | null;
  anniversary: string | null;
  /** Present when synced from Firebase Auth profile / OAuth providers */
  email?: string | null;
  /** Tracks which identity path last updated the Firebase user */
  authProvider?: AuthProviderKind | "";
  updatedAt?: string | null;
  wishlist: string[];
  addresses: FirestoreAddress[];
  savedServices: string[];
};

export type FirestoreUserCreate = Omit<
  FirestoreUser,
  "uid" | "createdAt" | "referralCode" | "updatedAt"
> & {
  uid: string;
  fullName?: string;
  gender?: UserGender | "";
  email?: string | null;
  authProvider?: AuthProviderKind | "";
};

export function isProfileComplete(user: FirestoreUser | null | undefined): boolean {
  return Boolean(user?.fullName?.trim() && user.fullName.trim().length >= 2);
}
