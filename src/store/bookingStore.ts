import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Booking, BookingStatus } from "@/types/booking";

type BookingState = {
  localBookings: Booking[];
  lastRequested?: Booking | null;
  upsertBooking: (b: Booking) => void;
  appendFromServer: (rows: Booking[]) => void;
  /** Demo progression for mock / offline flows */
  advanceStatus: (id: string, status: BookingStatus) => void;
  /** Patch any subset of fields on a booking by id. */
  updateBooking: (id: string, patch: Partial<Booking>) => void;
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      localBookings: [],
      lastRequested: null,
      upsertBooking: (b) =>
        set((s) => {
          const rest = s.localBookings.filter((x) => x.id !== b.id);
          return { localBookings: [b, ...rest], lastRequested: b };
        }),
      appendFromServer: (rows) =>
        set((s) => {
          const map = new Map(s.localBookings.map((x) => [x.id, x]));
          for (const r of rows) map.set(r.id, r);
          return { localBookings: Array.from(map.values()) };
        }),
      advanceStatus: (id, status) =>
        set((s) => ({
          localBookings: s.localBookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        })),
      updateBooking: (id, patch) =>
        set((s) => ({
          localBookings: s.localBookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        })),
    }),
    {
      name: "instahelp-bookings-cache",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
