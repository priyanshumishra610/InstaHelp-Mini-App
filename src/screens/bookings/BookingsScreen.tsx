import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useBookingsQuery } from "@/hooks/queries/useBookings";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import type { Booking } from "@/types/booking";
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

type Filter = "all" | "active" | "completed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

function isActive(b: Booking) {
  return b.status !== "completed";
}

function formatRelative(iso: string) {
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

export function BookingsScreen() {
  const router = useRouter();
  const { isPending, isError, isRefetching, refetch } = useBookingsQuery();
  const rows = useMergedBookings();
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => {
    let active = 0;
    let completed = 0;
    let rated = 0;
    for (const b of rows) {
      if (isActive(b)) active++;
      else completed++;
      if (b.rating) rated++;
    }
    return { active, completed, rated, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "active") return rows.filter(isActive);
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
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#a88a00"
          />
        }
      >
        <View className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep dark:text-accent">
            Activity
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            Your bookings
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Live status for every request InstaHelp is handling for you.
          </Text>
        </View>

        {!isPending && !isError && rows.length > 0 ? (
          <View className="mt-5 overflow-hidden rounded-3xl bg-accent p-5">
            <View
              pointerEvents="none"
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/30"
            />
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground/70">
              This account
            </Text>
            <Text className="mt-1 text-2xl font-extrabold text-accent-foreground">
              {stats.total} request{stats.total === 1 ? "" : "s"}
            </Text>
            <View className="mt-4 flex-row gap-3">
              <StatPill label="Active" value={stats.active} />
              <StatPill label="Completed" value={stats.completed} />
              <StatPill label="Rated" value={stats.rated} />
            </View>
          </View>
        ) : null}

        {!isPending && !isError && rows.length > 0 ? (
          <View className="mt-5 flex-row gap-2">
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
                  className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 ${
                    on
                      ? "border-accent bg-accent"
                      : "border-brand-line bg-white dark:border-brand-lineDark dark:bg-brand-cardDark"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-bold ${
                      on
                        ? "text-accent-foreground"
                        : "text-neutral-700 dark:text-neutral-200"
                    }`}
                  >
                    {f.label}
                  </Text>
                  <View
                    className={`rounded-full px-1.5 py-0.5 ${
                      on
                        ? "bg-accent-foreground/15"
                        : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        on
                          ? "text-accent-foreground"
                          : "text-neutral-500 dark:text-neutral-300"
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {isPending ? (
          <View className="mt-12 items-center">
            <ActivityIndicator color="#a88a00" />
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
          <View className="mt-5 gap-3">
            {filtered.map((b) => (
              <Pressable
                key={b.id}
                onPress={() =>
                  router.push({
                    pathname: "/booking/[id]",
                    params: { id: b.id },
                  })
                }
                className="rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5 dark:border-brand-lineDark dark:bg-brand-cardDark"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="flex-1 text-base font-bold text-neutral-900 dark:text-white">
                    {b.serviceLabel}
                  </Text>
                  <StatusBadge status={b.status} />
                </View>
                <Text
                  className="mt-2 text-sm text-neutral-600 dark:text-neutral-300"
                  numberOfLines={3}
                >
                  {b.description}
                </Text>
                <View className="mt-3 flex-row flex-wrap items-center gap-x-3 gap-y-1">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={12} color="#737373" />
                    <Text className="text-xs text-neutral-500">
                      {b.preferredTime || "Flexible"}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="ellipse" size={5} color="#a3a3a3" />
                    <Text className="text-xs text-neutral-500">
                      Updated {formatRelative(b.updatedAt)}
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
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-2xl bg-accent-foreground/10 px-3 py-2">
      <Text className="text-2xl font-extrabold text-accent-foreground">
        {value}
      </Text>
      <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground/70">
        {label}
      </Text>
    </View>
  );
}
