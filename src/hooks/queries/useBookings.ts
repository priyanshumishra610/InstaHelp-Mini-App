import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import {
  createBookingLocalFirst,
  refreshBookingsFromServer,
} from "@/services/bookingService";
import type { Booking } from "@/types/booking";

export function bookingsKey(phone: string | null) {
  return ["bookings", phone ?? "anon"] as const;
}

export function useBookingsQuery() {
  const phone = useAuthPhone();
  return useQuery({
    queryKey: bookingsKey(phone),
    queryFn: () => refreshBookingsFromServer(),
    enabled: !!phone,
  });
}

export function useCreateBookingMutation() {
  const qc = useQueryClient();
  const phone = useAuthPhone();
  return useMutation({
    mutationFn: createBookingLocalFirst,
    onSuccess: (b: Booking) => {
      qc.setQueryData<Booking[]>(bookingsKey(phone), (prev) => {
        const list = prev ?? [];
        const rest = list.filter((x) => x.id !== b.id);
        return [b, ...rest];
      });
    },
  });
}
