import { BOOKING_STATUS_LABEL } from "@/types/booking";
import type { BookingStatus } from "@/types/booking";
import { cn } from "@/utils/cn";
import { MotiView } from "moti";
import { Text, View } from "react-native";

const LIVE_STATUSES: BookingStatus[] = ["pending", "assigned", "on_the_way"];

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
  const isLive = LIVE_STATUSES.includes(status);
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full px-2.5 py-1",
        s.bg,
        className,
      )}
    >
      {isLive ? (
        <MotiView
          from={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            type: "timing",
            duration: 1100,
            loop: true,
          }}
          className={cn("absolute h-1.5 w-1.5 rounded-full", s.dot)}
        />
      ) : null}
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
