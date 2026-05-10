import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { demoAdvance } from "@/services/bookingService";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

export function BookingDetailScreen() {
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
            <Ionicons name="search" size={26} color="#a88a00" />
          </View>
          <Text className="mt-4 text-center text-base font-bold text-neutral-900 dark:text-white">
            Booking not found
          </Text>
          <Text className="mt-2 text-center text-sm text-neutral-500">
            It may still be syncing. Pull to refresh on Activity.
          </Text>
        </View>
      </Screen>
    );
  }

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
            Booking
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-accent-foreground">
            {booking.serviceLabel}
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            Timeline
          </Text>
          <View className="mt-4">
            <StatusTimeline current={booking.status} />
          </View>
        </View>

        <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Details
        </Text>
        <View className="rounded-2xl border border-brand-line bg-white p-4 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Text className="text-sm leading-5 text-neutral-800 dark:text-neutral-100">
            {booking.description}
          </Text>
          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#a88a00" />
            <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Preferred time · {booking.preferredTime || "Flexible"}
            </Text>
          </View>
          {booking.notes ? (
            <View className="mt-2 flex-row items-start gap-2">
              <Ionicons name="document-text-outline" size={14} color="#a88a00" />
              <Text className="flex-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                Notes · {booking.notes}
              </Text>
            </View>
          ) : null}
        </View>

        {booking.imageUri ? (
          <View className="mt-6">
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              Photo
            </Text>
            <Image
              source={{ uri: booking.imageUri }}
              className="h-52 w-full rounded-2xl"
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View className="mt-6">
          <Pressable
            onPress={() =>
              openWhatsApp(
                `Update on booking ${booking.id} (${booking.serviceLabel})`,
              )
            }
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 active:opacity-90"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text className="text-sm font-bold text-white">
              Talk to concierge
            </Text>
          </Pressable>
        </View>

        {__DEV__ ? (
          <View className="mt-6">
            <Button
              variant="outline"
              onPress={() => {
                demoAdvance(booking.id);
              }}
            >
              Simulate next status (dev only)
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
