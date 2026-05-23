/**
 * Re-export UI-only auth state. Firebase Auth is the source of truth (see AuthProvider).
 */
export { useAuthUiStore as useAuthStore } from "@/stores/authUiStore";
