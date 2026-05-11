import { BOOKING_STATUS_LABEL, BOOKING_STATUS_ORDER } from "@/types/booking";
import type { BookingStatus } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function StatusTimeline({ current }: { current: BookingStatus }) {
  const idx = BOOKING_STATUS_ORDER.indexOf(current);
  return (
    <View className="gap-0">
      {BOOKING_STATUS_ORDER.map((status, i) => {
        const done = i <= idx;
        const active = i === idx;
        const future = i > idx;
        return (
          <View key={status} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  active
                    ? "bg-accent "
                    : done
                      ? "bg-accent"
                      : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              >
                {done ? (
                  <Ionicons
                    name={active ? "ellipse" : "checkmark"}
                    size={active ? 10 : 14}
                    color="#ffffff"
                  />
                ) : (
                  <View className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                )}
              </View>
              {i < BOOKING_STATUS_ORDER.length - 1 ? (
                <View
                  className={`my-1 w-0.5 flex-1 min-h-[22px] rounded-full ${
                    i < idx
                      ? "bg-accent"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                />
              ) : null}
            </View>
            <View className="pb-5 pr-2 flex-1">
              <Text
                className={`text-sm font-semibold ${
                  active
                    ? "text-neutral-900 dark:text-white"
                    : future
                      ? "text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-700 dark:text-neutral-200"
                }`}
              >
                {BOOKING_STATUS_LABEL[status]}
              </Text>
              {active ? (
                <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Live status. We will notify you as this changes.
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
