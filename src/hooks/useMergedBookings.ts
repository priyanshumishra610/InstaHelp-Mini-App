import { useMemo } from "react";

import { useBookingsQuery } from "@/hooks/queries/useBookings";
import { useBookingStore } from "@/store/bookingStore";
import type { Booking } from "@/types/booking";

function mergeBookings(local: Booking[], server: Booking[] | undefined) {
  const map = new Map(local.map((b) => [b.id, b]));
  for (const b of server ?? []) {
    const cur = map.get(b.id);
    if (!cur) {
      map.set(b.id, b);
      continue;
    }
    const chosen =
      new Date(cur.updatedAt) >= new Date(b.updatedAt) ? cur : b;
    map.set(b.id, chosen);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function useMergedBookings() {
  const local = useBookingStore((s) => s.localBookings);
  const { data } = useBookingsQuery();
  return useMemo(() => mergeBookings(local, data), [local, data]);
}
