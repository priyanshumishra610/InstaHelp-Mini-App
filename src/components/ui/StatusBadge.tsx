import { BOOKING_STATUS_LABEL } from "@/types/booking";
import type { BookingStatus } from "@/types/booking";
import { cn } from "@/utils/cn";
import { Text, View } from "react-native";

const STYLES: Record<BookingStatus, { dot: string; bg: string; text: string }> = {
  pending: {
    dot: "bg-status-pendingFg",
    bg: "bg-status-pendingBg",
    text: "text-status-pendingFg",
  },
  assigned: {
    dot: "bg-status-assignedFg",
    bg: "bg-status-assignedBg",
    text: "text-status-assignedFg",
  },
  on_the_way: {
    dot: "bg-status-movingFg",
    bg: "bg-status-movingBg",
    text: "text-status-movingFg",
  },
  completed: {
    dot: "bg-status-doneFg",
    bg: "bg-status-doneBg",
    text: "text-status-doneFg",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full px-2.5 py-1",
        s.bg,
        className,
      )}
    >
      <View className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      <Text
        className={cn(
          "ml-1.5 text-[10px] font-bold uppercase tracking-[0.08em]",
          s.text,
        )}
      >
        {BOOKING_STATUS_LABEL[status]}
      </Text>
    </View>
  );
}
