import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type ActionItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  highlight?: boolean;
};

export function BookingDetailScreen() {
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
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-sm">
            <Ionicons name="receipt-outline" size={28} color="#ffffff" />
          </View>
          <Text className="mt-4 text-center text-lg font-extrabold text-neutral-900 dark:text-white">
            Booking not found
          </Text>
          <Text className="mt-2 max-w-[280px] text-center text-sm leading-5 text-neutral-500">
            It may still be syncing. Pull to refresh on Activity, or start from
            your list.
          </Text>
          <Pressable
            onPress={() => router.replace("/(tabs)/bookings")}
            accessibilityRole="button"
            accessibilityLabel="Go to Activity"
            className="mt-6 min-w-[220px] items-center rounded-full bg-neutral-900 px-6 py-3.5 active:opacity-90"
          >
            <Text className="text-center text-sm font-extrabold text-white">
              Open Activity
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const isCompleted = booking.status === "completed";

  const phaseCard: ActionItem | null =
    booking.status === "assigned"
      ? {
          key: "phase-assigned",
          title: "Open assignment view",
          subtitle:
            "See the assigned pro, ETA window and prep checklist.",
          icon: "person-add",
          highlight: true,
          onPress: () =>
            router.push({
              pathname: "/booking/assigned/[id]",
              params: { id: booking.id },
            }),
        }
      : booking.status === "on_the_way"
        ? {
            key: "phase-otw",
            title: "Open live tracking",
            subtitle:
              "Live ETA, trip overview and one-tap call to your pro.",
            icon: "navigate",
            highlight: true,
            onPress: () =>
              router.push({
                pathname: "/booking/on-the-way/[id]",
                params: { id: booking.id },
              }),
          }
        : booking.status === "completed"
          ? {
              key: "phase-completed",
              title: "View completion summary",
              subtitle:
                "Recap, rating prompt, receipt and book-again shortcut.",
              icon: "trophy",
              highlight: true,
              onPress: () =>
                router.push({
                  pathname: "/booking/completed/[id]",
                  params: { id: booking.id },
                }),
            }
          : null;

  const actions: ActionItem[] = [
    isCompleted
      ? {
          key: "rate",
          title: booking.rating ? "Update your rating" : "Rate this booking",
          subtitle: booking.rating
            ? `You rated ${booking.rating.stars}/5. Tap to edit.`
            : "Tell us how the concierge experience went.",
          icon: "star",
          highlight: !booking.rating,
          onPress: () =>
            router.push({
              pathname: "/booking/rate/[id]",
              params: { id: booking.id },
            }),
        }
      : {
          key: "reschedule",
          title: "Reschedule",
          subtitle: "Change the preferred time or update notes for the pro.",
          icon: "calendar-outline",
          onPress: () =>
            router.push({
              pathname: "/booking/reschedule/[id]",
              params: { id: booking.id },
            }),
        },
    {
      key: "receipt",
      title: "View receipt",
      subtitle: "Full summary you can share or copy as text.",
      icon: "receipt-outline",
      onPress: () =>
        router.push({
          pathname: "/booking/receipt/[id]",
          params: { id: booking.id },
        }),
    },
    {
      key: "simulate",
      title: "Simulate next status",
      subtitle:
        "Step the booking through pending, assigned, on the way, completed.",
      icon: "play-skip-forward",
      onPress: () =>
        router.push({
          pathname: "/booking/simulate/[id]",
          params: { id: booking.id },
        }),
    },
  ];

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="mt-2 overflow-hidden rounded-3xl bg-accent p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
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
            <Ionicons name="time-outline" size={14} color="#004aad" />
            <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Preferred time · {booking.preferredTime || "Flexible"}
            </Text>
          </View>
          {booking.notes ? (
            <View className="mt-2 flex-row items-start gap-2">
              <Ionicons name="document-text-outline" size={14} color="#004aad" />
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

        <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Manage this booking
        </Text>
        <View className="gap-3">
          {phaseCard ? (
            <Pressable
              onPress={phaseCard.onPress}
              accessibilityRole="button"
              accessibilityLabel={phaseCard.title}
              className="flex-row items-center gap-3 rounded-2xl border border-accent bg-white p-4 active:opacity-90"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-accent">
                <Ionicons name={phaseCard.icon} size={18} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                  {phaseCard.title}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {phaseCard.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#004aad" />
            </Pressable>
          ) : null}
          {actions.map((a) => (
            <Pressable
              key={a.key}
              onPress={a.onPress}
              accessibilityRole="button"
              accessibilityLabel={a.title}
              className={`flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-90 ${
                a.highlight
                  ? "border-accent bg-white"
                  : "border-brand-line bg-white dark:border-brand-lineDark dark:bg-brand-cardDark"
              }`}
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  a.highlight ? "bg-accent" : "bg-accent"
                }`}
              >
                <Ionicons name={a.icon} size={18} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                  {a.title}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {a.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#004aad" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
