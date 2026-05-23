export type UserGender = "male" | "female" | "other" | "prefer_not_to_say";

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
  wishlist: string[];
  addresses: FirestoreAddress[];
  savedServices: string[];
};

export type FirestoreUserCreate = Omit<
  FirestoreUser,
  "uid" | "createdAt" | "referralCode"
> & {
  uid: string;
  fullName?: string;
  gender?: UserGender | "";
};

export function isProfileComplete(user: FirestoreUser | null | undefined): boolean {
  return Boolean(user?.fullName?.trim() && user.fullName.trim().length >= 2);
}
