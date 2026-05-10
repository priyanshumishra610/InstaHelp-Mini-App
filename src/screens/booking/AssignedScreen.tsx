import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { VendorCard, vendorForId } from "@/components/booking/VendorCard";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const CHECKLIST = [
  { label: "Verified pro is reviewing your request", done: true },
  { label: "Confirming tools and supplies needed", done: true },
  { label: "Heading out to your address", done: false },
  { label: "Job kick-off", done: false },
];

export function AssignedScreen() {
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
            <Ionicons name="person-add-outline" size={26} color="#a88a00" />
          </View>
          <Text className="mt-4 text-center text-base font-bold text-neutral-900">
            Booking not found
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

  const vendor = vendorForId(booking.id);
  const callMock = () =>
    Alert.alert(
      `Call ${vendor.name}`,
      "In production this opens the dialer with a masked number. For now, message via concierge.",
    );

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
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-accent-foreground/15">
              <Ionicons name="person-add" size={18} color="#1a1a1a" />
            </View>
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground/70">
              Vendor assigned
            </Text>
          </View>
          <Text
            className="mt-3 text-2xl font-extrabold text-accent-foreground"
            numberOfLines={1}
          >
            {booking.serviceLabel}
          </Text>
          <Text className="mt-1 text-sm text-accent-foreground/80">
            We matched a verified pro for your request. They are prepping
            and will roll out shortly.
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
        </View>

        <View className="mt-5">
          <VendorCard
            vendor={vendor}
            onCall={callMock}
            onMessage={() =>
              openWhatsApp(
                `Hi InstaHelp, please share an update on booking ${booking.id} (assigned to ${vendor.name}).`,
              )
            }
            caption={`${vendor.name.split(" ")[0]} has been notified and accepted your booking.`}
          />
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Estimated arrival window
          </Text>
          <Text className="mt-1 text-lg font-extrabold text-neutral-900">
            {booking.preferredTime || "Today, within 30 mins"}
          </Text>
          <Text className="mt-1 text-xs text-neutral-500">
            We will ping you when {vendor.name.split(" ")[0]} starts moving.
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            What is happening now
          </Text>
          <View className="mt-3 gap-3">
            {CHECKLIST.map((c, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    c.done ? "bg-emerald-100" : "bg-neutral-100"
                  }`}
                >
                  <Ionicons
                    name={c.done ? "checkmark" : "ellipse-outline"}
                    size={14}
                    color={c.done ? "#059669" : "#a3a3a3"}
                  />
                </View>
                <Text
                  className={`flex-1 text-sm ${
                    c.done
                      ? "font-semibold text-neutral-800"
                      : "text-neutral-500"
                  }`}
                >
                  {c.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Timeline
          </Text>
          <View className="mt-4">
            <StatusTimeline current={booking.status} />
          </View>
        </View>

        <View className="mt-6 gap-3">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/booking/reschedule/[id]",
                params: { id: booking.id },
              })
            }
            className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
              <Ionicons name="calendar-outline" size={18} color="#a88a00" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">
                Reschedule
              </Text>
              <Text className="text-xs text-neutral-500">
                Change the preferred time before they roll out.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a88a00" />
          </Pressable>

          <Pressable
            onPress={() =>
              openWhatsApp(
                `Update needed on booking ${booking.id} (${booking.serviceLabel}).`,
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
      </ScrollView>
    </Screen>
  );
}
