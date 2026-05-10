import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import {
  demoAdvance,
  demoReset,
  demoSetStatus,
} from "@/services/bookingService";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_ORDER,
} from "@/types/booking";
import type { BookingStatus } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const STATUS_DESCRIPTIONS: Record<BookingStatus, string> = {
  pending: "We've received the request and are matching a vendor.",
  assigned: "A verified pro has accepted and will reach out shortly.",
  on_the_way: "Your pro is en route to the location.",
  completed: "Job finished. Hope it went smoothly.",
};

const STATUS_ICONS: Record<BookingStatus, keyof typeof Ionicons.glyphMap> = {
  pending: "hourglass-outline",
  assigned: "person-outline",
  on_the_way: "navigate-outline",
  completed: "checkmark-done-outline",
};

export function SimulateStatusScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const merged = useMergedBookings();

  const booking = useMemo(
    () => merged.find((b) => b.id === id),
    [merged, id],
  );

  if (!booking) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent/20">
            <Ionicons name="alert-circle" size={26} color="#a88a00" />
          </View>
          <Text className="mt-4 text-center text-base font-bold text-neutral-900 dark:text-white">
            Booking not found
          </Text>
          <Text className="mt-2 text-center text-sm text-neutral-500">
            It may still be syncing. Pull to refresh on Activity.
          </Text>
          <View className="mt-6">
            <Button variant="outline" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const idx = BOOKING_STATUS_ORDER.indexOf(booking.status);
  const isFinal = idx === BOOKING_STATUS_ORDER.length - 1;
  const nextStatus = isFinal ? null : BOOKING_STATUS_ORDER[idx + 1];

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="mt-2 overflow-hidden rounded-3xl bg-accent p-5">
          <View
            pointerEvents="none"
            className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/30"
          />
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground/70">
            Status simulator
          </Text>
          <Text
            className="mt-1 text-2xl font-extrabold text-accent-foreground"
            numberOfLines={1}
          >
            {booking.serviceLabel}
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
          <Text className="mt-3 text-sm text-accent-foreground/80">
            Manually move this booking through the lifecycle to preview how
            tracking, notifications, and the timeline behave.
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            Live timeline
          </Text>
          <View className="mt-4">
            <StatusTimeline current={booking.status} />
          </View>
        </View>

        <View className="mt-5 gap-3">
          {isFinal ? (
            <View className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-4 dark:border-brand-lineDark dark:bg-brand-cardDark">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-status-doneBg">
                <Ionicons
                  name="checkmark-done"
                  size={18}
                  color="#065f46"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                  Booking is complete
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  Reset below if you want to run the flow again.
                </Text>
              </View>
            </View>
          ) : (
            <Button
              size="lg"
              onPress={() => demoAdvance(booking.id)}
              accessibilityLabel="Advance to next status"
            >
              {`Advance to ${BOOKING_STATUS_LABEL[nextStatus as BookingStatus]}`}
            </Button>
          )}
        </View>

        <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Jump to any status
        </Text>
        <View className="gap-2.5">
          {BOOKING_STATUS_ORDER.map((s, i) => {
            const active = s === booking.status;
            const past = i < idx;
            return (
              <Pressable
                key={s}
                onPress={() => demoSetStatus(booking.id, s)}
                accessibilityRole="button"
                accessibilityLabel={`Set status to ${BOOKING_STATUS_LABEL[s]}`}
                className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
                  active
                    ? "border-accent bg-accent/15"
                    : "border-brand-line bg-white active:bg-accent/5 dark:border-brand-lineDark dark:bg-brand-cardDark"
                }`}
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    active
                      ? "bg-accent"
                      : past
                        ? "bg-accent/15"
                        : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  <Ionicons
                    name={STATUS_ICONS[s]}
                    size={18}
                    color={active ? "#1a1a1a" : past ? "#a88a00" : "#737373"}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`text-sm font-bold ${
                        active
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-700 dark:text-neutral-200"
                      }`}
                    >
                      {BOOKING_STATUS_LABEL[s]}
                    </Text>
                    {active ? (
                      <View className="rounded-full bg-accent px-2 py-0.5">
                        <Text className="text-[9px] font-extrabold uppercase tracking-wider text-accent-foreground">
                          Current
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400"
                    numberOfLines={2}
                  >
                    {STATUS_DESCRIPTIONS[s]}
                  </Text>
                </View>
                {active ? (
                  <Ionicons name="checkmark" size={18} color="#a88a00" />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />
                )}
              </Pressable>
            );
          })}
        </View>

        <View className="mt-7 flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="outline"
              onPress={() => demoReset(booking.id)}
              accessibilityLabel="Reset status to pending"
            >
              Reset to Pending
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="secondary"
              onPress={() => router.back()}
              accessibilityLabel="Back to booking detail"
            >
              Done
            </Button>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
