import { VendorCard, vendorForId } from "@/components/booking/VendorCard";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function durationBetween(startIso: string, endIso: string) {
  try {
    const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"}`;
    const hrs = Math.floor(mins / 60);
    const r = mins % 60;
    return r ? `${hrs}h ${r}m` : `${hrs}h`;
  } catch {
    return null;
  }
}

function CheckBadge() {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withDelay(
      80,
      withSpring(1, { damping: 9, stiffness: 140, mass: 0.8 }),
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#10b981",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#10b981",
          shadowOpacity: 0.3,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
        style,
      ]}
    >
      <Ionicons name="checkmark" size={42} color="#fff" />
    </Animated.View>
  );
}

export function CompletedScreen() {
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
            <Ionicons name="trophy-outline" size={26} color="#a88a00" />
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
  const totalDuration = durationBetween(booking.createdAt, booking.updatedAt);

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="mt-4 items-center rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckBadge />
          <Text className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Job complete
          </Text>
          <Text
            className="mt-1 text-center text-2xl font-extrabold text-neutral-900"
            numberOfLines={2}
          >
            {booking.serviceLabel} done!
          </Text>
          <Text className="mt-1 text-center text-sm text-neutral-600">
            Hope it was a smooth experience. Tap below to share a quick rating.
          </Text>
        </View>

        <View className="mt-5 flex-row gap-3">
          <SummaryStat
            label="Wrapped on"
            value={formatDateTime(booking.updatedAt)}
            icon="calendar"
          />
          <SummaryStat
            label="Total time"
            value={totalDuration ?? "Just now"}
            icon="hourglass"
          />
        </View>

        <View className="mt-5">
          <VendorCard
            vendor={vendor}
            caption={`Completed by ${vendor.name}. They have done ${vendor.jobs} jobs on InstaHelp.`}
          />
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/booking/rate/[id]",
              params: { id: booking.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Rate this booking"
          className={`mt-5 overflow-hidden rounded-3xl p-5 ${
            booking.rating
              ? "border border-brand-line bg-white"
              : "bg-accent shadow-glow"
          }`}
        >
          {booking.rating ? (
            <>
              <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Your rating
              </Text>
              <View className="mt-2 flex-row items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons
                    key={n}
                    name={n <= booking.rating!.stars ? "star" : "star-outline"}
                    size={20}
                    color={n <= booking.rating!.stars ? "#ffd500" : "#d4d4d4"}
                  />
                ))}
                <Text className="ml-1 text-sm font-bold text-neutral-900">
                  {booking.rating.stars}/5
                </Text>
              </View>
              {booking.rating.comment ? (
                <Text className="mt-2 text-sm text-neutral-700">
                  {booking.rating.comment}
                </Text>
              ) : null}
              <Text className="mt-3 text-xs font-bold text-accent-deep">
                Tap to update your rating
              </Text>
            </>
          ) : (
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-foreground/15">
                <Ionicons name="star" size={22} color="#1a1a1a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold text-accent-foreground">
                  Rate this booking
                </Text>
                <Text className="text-xs font-medium text-accent-foreground/80">
                  30 seconds, helps the next member.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1a1a1a" />
            </View>
          )}
        </Pressable>

        <View className="mt-5 gap-3">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/booking/receipt/[id]",
                params: { id: booking.id },
              })
            }
            className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
              <Ionicons name="receipt-outline" size={18} color="#a88a00" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">
                View receipt
              </Text>
              <Text className="text-xs text-neutral-500">
                Share or copy the booking summary.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a88a00" />
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/request/[slug]",
                params: {
                  slug: booking.serviceId || "custom",
                  presetLabel: booking.serviceLabel,
                  presetDescription: booking.description,
                },
              })
            }
            className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
              <Ionicons name="refresh" size={18} color="#a88a00" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-neutral-900">
                Book again
              </Text>
              <Text className="text-xs text-neutral-500">
                Re-run this exact request with one tap.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a88a00" />
          </Pressable>

          <Pressable
            onPress={() =>
              openWhatsApp(
                `Follow up needed on booking ${booking.id} (${booking.serviceLabel}).`,
              )
            }
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 active:opacity-90"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text className="text-sm font-bold text-white">
              Need follow up?
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SummaryStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-brand-line bg-white p-4">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-accent/15">
        <Ionicons name={icon} size={16} color="#a88a00" />
      </View>
      <Text className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </Text>
      <Text
        className="mt-1 text-sm font-extrabold text-neutral-900"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
