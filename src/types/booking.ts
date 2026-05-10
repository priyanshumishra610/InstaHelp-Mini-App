export type BookingStatus = "pending" | "assigned" | "on_the_way" | "completed";

export type BookingRating = {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  ratedAt: string;
};

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
  rating?: BookingRating;
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
