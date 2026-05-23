import { useAuth } from "@/providers/AuthProvider";

export function useAuthPhone(): string | null {
  const { firebaseUser } = useAuth();
  return firebaseUser?.phoneNumber ?? null;
}
