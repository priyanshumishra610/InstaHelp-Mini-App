import { useSheetAuthStore } from "@/store/sheetAuthStore";

export function useAuthPhone(): string | null {
  return useSheetAuthStore((s) => s.phone);
}
