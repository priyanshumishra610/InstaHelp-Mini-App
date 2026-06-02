import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useBookingsQuery } from "@/hooks/queries/useBookings";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import type { Booking } from "@/types/booking";
import {
  computeBookingStats,
  formatRelativeTime,
  isActiveBooking,
} from "@/utils/bookingActivity";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type Filter = "all" | "active" | "completed";

type IoniconName = keyof typeof Ionicons.glyphMap;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export function BookingsScreen() {
  const router = useRouter();
  const { isPending, isError, isRefetching, refetch } = useBookingsQuery();
  const rows = useMergedBookings();
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => computeBookingStats(rows), [rows]);

  const filtered = useMemo(() => {
    if (filter === "active") return rows.filter(isActiveBooking);
    if (filter === "completed")
      return rows.filter((b) => b.status === "completed");
    return rows;
  }, [rows, filter]);

  const filterEmptyCopy: Record<Filter, { title: string; subtitle: string }> = {
    all: {
      title: "No bookings yet",
      subtitle:
        "Submit a request from Home and your timeline will appear here instantly.",
    },
    active: {
      title: "Nothing in progress",
      subtitle: "All your concierge requests are wrapped up. Nice work.",
    },
    completed: {
      title: "No completed bookings",
      subtitle: "Once a job is marked completed it will land here.",
    },
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#004aad"
          />
        }
      >
        <Animated.View entering={FadeInUp.duration(380)} className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep dark:text-accent">
            Activity
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            Your bookings
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Live status for every request InstaHelp is handling for you.
          </Text>
        </Animated.View>

        {!isPending && !isError && rows.length > 0 ? (
          <>
            <Animated.View
              entering={FadeInUp.duration(420).delay(60)}
              className="mt-6 overflow-hidden rounded-[28px] bg-accent p-6 shadow-sm"
            >
              <View
                pointerEvents="none"
                className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-blue"
              />
              <View
                pointerEvents="none"
                className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-accent-deep/40"
              />

              <View className="flex-row items-center gap-4">
                <View className="h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white/35 bg-white/10">
                  <Ionicons name="pulse" size={30} color="#ffffff" />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                    Summary
                  </Text>
                  <Text className="mt-1 text-3xl font-extrabold text-accent-foreground">
                    {stats.total}
                  </Text>
                  <Text className="mt-0.5 text-xs text-white/85">
                    request{stats.total === 1 ? "" : "s"} on file
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center gap-2">
                <Ionicons name="sync-outline" size={12} color="#ffd500" />
                <Text className="text-[11px] font-semibold text-white/90">
                  Pull down anytime to refresh
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(420).delay(120)}
              className="mt-5 overflow-hidden rounded-2xl bg-neutral-50 py-4 dark:bg-neutral-900"
            >
              <View className="flex-row items-stretch">
                <StatStripCell
                  label="Active"
                  value={stats.active}
                  icon="pulse"
                />
                <StatDivider />
                <StatStripCell
                  label="Done"
                  value={stats.completed}
                  icon="checkmark-done"
                />
                <StatDivider />
                <StatStripCell
                  label="Rated"
                  value={stats.rated}
                  icon="star-outline"
                />
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(420).delay(180)}
              className="mt-6"
            >
              <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                Show
              </Text>
              <View className="flex-row rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
                {FILTERS.map((f) => {
                  const on = filter === f.id;
                  const count =
                    f.id === "all"
                      ? stats.total
                      : f.id === "active"
                        ? stats.active
                        : stats.completed;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setFilter(f.id)}
                      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 ${
                        on
                          ? "bg-white shadow-sm dark:bg-neutral-950"
                          : ""
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold ${
                          on
                            ? "text-accent dark:text-accent"
                            : "text-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        {f.label}
                      </Text>
                      <Text
                        className={`text-[10px] font-bold tabular-nums ${
                          on
                            ? "text-neutral-500 dark:text-neutral-400"
                            : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        {count}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          </>
        ) : null}

        {isPending ? (
          <View className="mt-12 items-center">
            <ActivityIndicator color="#004aad" />
          </View>
        ) : isError ? (
          <EmptyState
            className="mt-8"
            icon="cloud-offline-outline"
            title="Could not refresh"
            subtitle="Pull to try again when you are back online."
          >
            <Pressable
              onPress={() => refetch()}
              className="rounded-2xl bg-accent py-3 active:opacity-90"
            >
              <Text className="text-center text-sm font-bold text-accent-foreground">
                Retry
              </Text>
            </Pressable>
          </EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon="receipt-outline"
            title={filterEmptyCopy.all.title}
            subtitle={filterEmptyCopy.all.subtitle}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={
              filter === "active" ? "checkmark-done-outline" : "trophy-outline"
            }
            title={filterEmptyCopy[filter].title}
            subtitle={filterEmptyCopy[filter].subtitle}
          />
        ) : (
          <Animated.View
            entering={FadeInUp.duration(420).delay(240)}
            className="mt-5"
          >
            <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              Timeline
            </Text>
            <View className="overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900">
              {filtered.map((b, i, arr) => (
                <View key={b.id}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/booking/[id]",
                        params: { id: b.id },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${b.serviceLabel}, ${b.status}`}
                    className="flex-row items-start gap-3 px-4 py-4 active:bg-neutral-200/50 dark:active:bg-neutral-800"
                  >
                    <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-accent-soft dark:bg-accent/25">
                      <Ionicons name="receipt-outline" size={18} color="#004aad" />
                    </View>
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-start justify-between gap-2">
                        <Text
                          className="min-w-0 flex-1 text-[15px] font-semibold text-neutral-900 dark:text-white"
                          numberOfLines={2}
                        >
                          {b.serviceLabel}
                        </Text>
                        <StatusBadge
                          status={b.status}
                          className="shrink-0"
                        />
                      </View>
                      <Text
                        className="mt-1 text-sm leading-5 text-neutral-600 dark:text-neutral-300"
                        numberOfLines={2}
                      >
                        {b.description}
                      </Text>
                      <View className="mt-2 flex-row flex-wrap items-center gap-x-3 gap-y-1">
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="time-outline" size={12} color="#737373" />
                          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                            {b.preferredTime || "Flexible"}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="ellipse" size={5} color="#a3a3a3" />
                          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                            Updated {formatRelativeTime(b.updatedAt)}
                          </Text>
                        </View>
                        {b.rating ? (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="star" size={12} color="#ffd500" />
                            <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                              {b.rating.stars}/5
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#c4c4c4"
                      style={{ marginTop: 2 }}
                    />
                  </Pressable>
                  {i < arr.length - 1 ? (
                    <View className="ml-[54px] mr-4 h-px bg-neutral-200/90 dark:bg-neutral-700/90" />
                  ) : null}
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

function StatStripCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: IoniconName;
}) {
  return (
    <View className="min-w-0 flex-1 items-center px-1 py-0.5">
      <Ionicons name={icon} size={13} color="#737373" />
      <Text className="mt-1.5 text-2xl font-extrabold tabular-nums text-neutral-900 dark:text-white">
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
    </View>
  );
}

function StatDivider() {
  return (
    <View className="my-2 w-px self-stretch bg-neutral-200/90 dark:bg-neutral-700/90" />
  );
}
