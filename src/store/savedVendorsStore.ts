import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SavedVendorsState = {
  vendorIds: string[];
  savedAt: Record<string, number>;
  isSaved: (vendorId: string) => boolean;
  toggleSaved: (vendorId: string) => { added: boolean; removed: boolean };
  removeSaved: (vendorId: string) => void;
};

export const useSavedVendorsStore = create<SavedVendorsState>()(
  persist(
    (set, get) => ({
      vendorIds: [],
      savedAt: {},

      isSaved: (vendorId) => get().vendorIds.includes(vendorId),

      toggleSaved: (vendorId) => {
        const exists = get().vendorIds.includes(vendorId);
        if (exists) {
          set((s) => {
            const nextAt = { ...s.savedAt };
            delete nextAt[vendorId];
            return {
              vendorIds: s.vendorIds.filter((id) => id !== vendorId),
              savedAt: nextAt,
            };
          });
          return { added: false, removed: true };
        }
        set((s) => ({
          vendorIds: [vendorId, ...s.vendorIds],
          savedAt: { ...s.savedAt, [vendorId]: Date.now() },
        }));
        return { added: true, removed: false };
      },

      removeSaved: (vendorId) => {
        set((s) => {
          const nextAt = { ...s.savedAt };
          delete nextAt[vendorId];
          return {
            vendorIds: s.vendorIds.filter((id) => id !== vendorId),
            savedAt: nextAt,
          };
        });
      },
    }),
    {
      name: "instahelp-saved-vendors",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ vendorIds: s.vendorIds, savedAt: s.savedAt }),
    },
  ),
);
