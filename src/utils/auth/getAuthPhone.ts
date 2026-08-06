import { useSheetAuthStore } from "@/store/sheetAuthStore";

/** Active signed-in phone from the auth session (Firebase disabled). */
export function getAuthPhone(): string | null {
  return useSheetAuthStore.getState().phone;
}
