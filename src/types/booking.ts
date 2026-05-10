export type BookingStatus = "pending" | "assigned" | "on_the_way" | "completed";

export type Booking = {
  id: string;
  serviceId: string;
  serviceLabel: string;
  description: string;
  preferredTime: string;
  notes?: string;
  imageUri?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "pending",
  "assigned",
  "on_the_way",
  "completed",
];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  on_the_way: "On The Way",
  completed: "Completed",
};
