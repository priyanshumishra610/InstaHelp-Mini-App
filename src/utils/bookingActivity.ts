import type { Booking, BookingStatus } from "@/types/booking";

export function isActiveBooking(b: Booking): boolean {
  return b.status !== "completed";
}

export type BookingActivityStats = {
  total: number;
  active: number;
  completed: number;
  rated: number;
  lastUpdatedAt: string | null;
};

export function computeBookingStats(bookings: Booking[]): BookingActivityStats {
  let active = 0;
  let completed = 0;
  let rated = 0;
  let lastUpdatedAt: string | null = null;

  for (const b of bookings) {
    if (isActiveBooking(b)) active++;
    else completed++;
    if (b.rating) rated++;
    if (!lastUpdatedAt || new Date(b.updatedAt) > new Date(lastUpdatedAt)) {
      lastUpdatedAt = b.updatedAt;
    }
  }

  return {
    total: bookings.length,
    active,
    completed,
    rated,
    lastUpdatedAt,
  };
}

export function getRecentBookings(bookings: Booking[], limit = 3): Booking[] {
  return [...bookings]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, limit);
}

export function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

const STATUS_ICONS = {
  pending: "time-outline",
  assigned: "person-outline",
  on_the_way: "navigate-outline",
  completed: "checkmark-done-outline",
} as const;

export function statusIconFor(status: BookingStatus) {
  return STATUS_ICONS[status];
}
