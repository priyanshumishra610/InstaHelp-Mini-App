import { useSheetAuthStore } from "@/store/sheetAuthStore";

/** Active signed-in phone from sheet auth session (Firebase disabled). */
export function getAuthPhone(): string | null {
  return useSheetAuthStore.getState().phone;
}
