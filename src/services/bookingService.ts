import { apiCreateBooking, apiGetBookings } from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/api/env";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import type { Booking, BookingStatus } from "@/types/booking";
import { QUICK_SERVICES } from "@/constants/quickServices";

function newId() {
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function labelForService(id: string, explicit?: string) {
  if (explicit?.trim()) return explicit.trim();
  if (id === "custom") return "Custom request";
  return QUICK_SERVICES.find((s) => s.id === id)?.label ?? id;
}

export async function createBookingLocalFirst(input: {
  serviceId: string;
  serviceLabel?: string;
  description: string;
  preferredTime: string;
  notes?: string;
  imageUri?: string | null;
  imageBase64?: string | null;
  name?: string;
  email?: string;
  address?: string;
  source?: string;
  paidStatus?: string;
  consent?: boolean;
}): Promise<Booking> {
  const phone = useAuthStore.getState().phone;
  if (!phone) throw new Error("Not signed in");

  const label = labelForService(input.serviceId, input.serviceLabel);

  const base: Booking = {
    id: newId(),
    serviceId: input.serviceId,
    serviceLabel: label,
    description: input.description,
    preferredTime: input.preferredTime,
    notes: input.notes,
    imageUri: input.imageUri ?? null,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  useBookingStore.getState().upsertBooking(base);

  if (APPS_SCRIPT_URL) {
    const res = await apiCreateBooking({
      phone,
      serviceId: input.serviceId,
      serviceLabel: label,
      description: input.description,
      preferredTime: input.preferredTime,
      notes: input.notes,
      imageBase64: input.imageBase64 ?? undefined,
      name: input.name,
      email: input.email,
      address: input.address,
      source: input.source,
      paidStatus: input.paidStatus,
      consent: input.consent,
    });
    if (res.ok && res.data) {
      useBookingStore.getState().upsertBooking(res.data);
      return res.data;
    }
  }

  return base;
}

export async function refreshBookingsFromServer(): Promise<Booking[]> {
  const phone = useAuthStore.getState().phone;
  if (!phone) return useBookingStore.getState().localBookings;

  if (!APPS_SCRIPT_URL) {
    return useBookingStore.getState().localBookings;
  }

  const res = await apiGetBookings(phone);
  if (res.ok) {
    useBookingStore.getState().appendFromServer(res.data);
    return useBookingStore.getState().localBookings;
  }

  return useBookingStore.getState().localBookings;
}

const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "assigned",
  "on_the_way",
  "completed",
];

/** Move a booking one step forward (no-op if already completed). */
export function demoAdvance(bookingId: string) {
  const list = useBookingStore.getState().localBookings;
  const b = list.find((x) => x.id === bookingId);
  if (!b) return;
  const idx = STATUS_ORDER.indexOf(b.status);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
  useBookingStore.getState().advanceStatus(bookingId, STATUS_ORDER[idx + 1]);
}

/** Jump a booking to a specific status (used by the simulator screen). */
export function demoSetStatus(bookingId: string, status: BookingStatus) {
  useBookingStore.getState().advanceStatus(bookingId, status);
}

/** Reset a booking back to the initial pending state. */
export function demoReset(bookingId: string) {
  useBookingStore.getState().advanceStatus(bookingId, "pending");
}
