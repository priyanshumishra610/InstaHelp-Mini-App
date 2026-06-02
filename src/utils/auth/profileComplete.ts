import type { UserProfile } from "@/types/user";

const MIN_AGE = 13;
const MAX_AGE = 120;

export function isValidProfileAge(age: number | null | undefined): boolean {
  return typeof age === "number" && Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
}

export function isSheetProfileComplete(profile: UserProfile | null | undefined): boolean {
  const nameOk = Boolean(profile?.name?.trim() && profile.name.trim().length >= 2);
  return nameOk && isValidProfileAge(profile?.age);
}
