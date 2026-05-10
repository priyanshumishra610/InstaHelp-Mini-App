import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useBookingsQuery } from "@/hooks/queries/useBookings";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export function BookingsScreen() {
  const router = useRouter();
  const { isPending, isError, refetch } = useBookingsQuery();
  const rows = useMergedBookings();

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 140 }}
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
            title="No bookings yet"
            subtitle="Submit a request from Home and your timeline will appear here instantly."
          />
        ) : (
          <View className="mt-6 gap-3">
            {rows.map((b) => (
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
                <View className="mt-3 flex-row items-center gap-1.5">
                  <Ionicons name="time-outline" size={12} color="#737373" />
                  <Text className="text-xs text-neutral-500">
                    {b.preferredTime || "Flexible"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
