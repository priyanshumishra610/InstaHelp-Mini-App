import { getFirestoreDb, USER_COLLECTION } from "@/firebase/firestore";
import { useProfileStore } from "@/store/profileStore";
import type { FirestoreUser, FirestoreUserCreate, UserGender, AuthProviderKind } from "@/types/firestoreUser";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatCreatedAt(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === "string" && value) return value;
  return new Date().toISOString();
}

function readAuthProvider(raw: unknown): AuthProviderKind | "" {
  return raw === "otp" ? raw : "";
}

function coerceFirestoreEmail(raw: unknown): string | null | undefined {
  if (typeof raw === "undefined") {
    return undefined;
  }
  if (raw === null) return null;
  if (typeof raw === "string") return raw;
  return null;
}

function mapUserDoc(id: string, data: DocumentData): FirestoreUser {
  return {
    uid: id,
    phoneNumber: String(data.phoneNumber ?? ""),
    fullName: String(data.fullName ?? ""),
    gender: (data.gender as UserGender) ?? "",
    city: String(data.city ?? ""),
    area: String(data.area ?? ""),
    coordinates: data.coordinates ?? null,
    createdAt: formatCreatedAt(data.createdAt),
    credits: Number(data.credits ?? 10),
    referralCode: String(data.referralCode ?? ""),
    profileImage: data.profileImage ?? null,
    birthday: data.birthday ?? null,
    anniversary: data.anniversary ?? null,
    email: coerceFirestoreEmail(data.email),
    authProvider: readAuthProvider(data.authProvider),
    updatedAt:
      typeof data.updatedAt === "undefined" || data.updatedAt === null || data.updatedAt === ""
        ? null
        : formatCreatedAt(data.updatedAt),
    wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
    addresses: Array.isArray(data.addresses) ? data.addresses : [],
    savedServices: Array.isArray(data.savedServices) ? data.savedServices : [],
  };
}

export async function fetchUserDocument(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(getFirestoreDb(), USER_COLLECTION, uid));
  if (!snap.exists()) return null;
  return mapUserDoc(snap.id, snap.data());
}

/** Create users/{uid} after first OTP sign-in. */
export async function createUserDocument(
  uid: string,
  phoneNumber: string,
  partial?: Partial<FirestoreUserCreate>,
): Promise<FirestoreUser> {
  const ref = doc(getFirestoreDb(), USER_COLLECTION, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return mapUserDoc(existing.id, existing.data());
  }

  const payload = {
    uid,
    phoneNumber,
    fullName: partial?.fullName ?? "",
    gender: partial?.gender ?? "",
    city: partial?.city ?? "",
    area: partial?.area ?? "",
    coordinates: partial?.coordinates ?? null,
    credits: 10,
    referralCode: generateReferralCode(),
    profileImage: partial?.profileImage ?? null,
    birthday: partial?.birthday ?? null,
    anniversary: (partial as Partial<FirestoreUserCreate> | undefined)?.anniversary ?? null,
    email: partial?.email ?? null,
    authProvider: partial?.authProvider ?? "",
    wishlist: [] as string[],
    addresses: [] as FirestoreUser["addresses"],
    savedServices: [] as string[],
  };

  await setDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const created = await getDoc(ref);
  return mapUserDoc(created.id, created.data() ?? payload);
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<
    Pick<
      FirestoreUser,
      | "fullName"
      | "gender"
      | "profileImage"
      | "city"
      | "area"
      | "coordinates"
      | "birthday"
      | "anniversary"
      | "email"
    >
  >,
): Promise<FirestoreUser> {
  const ref = doc(getFirestoreDb(), USER_COLLECTION, uid);
  await updateDoc(ref, patch);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("User profile not found");
  }
  return mapUserDoc(snap.id, snap.data());
}

export function syncFirestoreUserToLocalProfile(user: FirestoreUser): void {
  useProfileStore.getState().setProfile({
    phone: user.phoneNumber,
    name: user.fullName,
    avatarUri: user.profileImage ?? undefined,
    addresses:
      user.addresses.length > 0
        ? user.addresses.map((a) => ({
            id: a.id,
            label: a.label,
            line: a.line,
          }))
        : [
            {
              id: "home",
              label: "Home",
              line: user.area || user.city || "Add your address in Profile",
            },
          ],
    favorites: user.savedServices,
  });
}
