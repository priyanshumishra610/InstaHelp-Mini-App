import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { VendorCard, vendorForId } from "@/components/booking/VendorCard";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const TOTAL_ETA_MIN = 18;

function computeEtaMinutes(updatedAt: string): number {
  try {
    const t = new Date(updatedAt).getTime();
    const elapsed = Math.max(0, (Date.now() - t) / 60000);
    return Math.max(1, Math.round(TOTAL_ETA_MIN - elapsed));
  } catch {
    return TOTAL_ETA_MIN;
  }
}

function PulsingDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(2.4, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(0.6, { duration: 0 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="h-3 w-3 items-center justify-center">
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#10b981",
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#10b981",
        }}
      />
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(Math.max(8, Math.min(100, percent)), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, w]);

  const style = useAnimatedStyle(() => ({
    width: `${w.value}%`,
  }));

  return (
    <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <Animated.View
        style={[
          {
            height: "100%",
            borderRadius: 999,
            backgroundColor: "#ffd500",
          },
          style,
        ]}
      />
    </View>
  );
}

export function OnTheWayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const merged = useMergedBookings();

  const booking = useMemo(
    () => merged.find((b) => b.id === id),
    [merged, id],
  );

  const [eta, setEta] = useState(() =>
    booking ? computeEtaMinutes(booking.updatedAt) : TOTAL_ETA_MIN,
  );

  useEffect(() => {
    if (!booking) return;
    setEta(computeEtaMinutes(booking.updatedAt));
    const t = setInterval(() => {
      setEta(computeEtaMinutes(booking.updatedAt));
    }, 30000);
    return () => clearInterval(t);
  }, [booking]);

  if (!booking) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent/20">
            <Ionicons name="navigate-outline" size={26} color="#a88a00" />
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
  const percentDone = Math.round(
    ((TOTAL_ETA_MIN - eta) / TOTAL_ETA_MIN) * 100,
  );

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
            <PulsingDot />
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground/80">
              Live · On the way
            </Text>
          </View>
          <Text
            className="mt-3 text-2xl font-extrabold text-accent-foreground"
            numberOfLines={1}
          >
            Arriving in ~{eta} min{eta === 1 ? "" : "s"}
          </Text>
          <Text className="mt-1 text-sm text-accent-foreground/80">
            {vendor.name.split(" ")[0]} is heading to your location now.
          </Text>
          <ProgressBar percent={percentDone} />
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
                `Hi InstaHelp, share live ETA for booking ${booking.id} (with ${vendor.name}).`,
              )
            }
            caption={`Live tracking enabled. Tap call to reach ${vendor.name.split(" ")[0]} on a masked line.`}
          />
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Trip overview
          </Text>
          <View className="mt-3 flex-row items-stretch gap-3">
            <View className="items-center">
              <View className="h-3 w-3 rounded-full bg-accent" />
              <View className="my-1 w-px flex-1 bg-neutral-200" />
              <View className="h-3 w-3 rounded-full border-2 border-accent bg-white" />
            </View>
            <View className="flex-1 gap-3">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  Pro is heading from
                </Text>
                <Text
                  className="text-sm font-semibold text-neutral-800"
                  numberOfLines={1}
                >
                  Verified pro hub · {vendor.name.split(" ")[0]}
                </Text>
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  Drop-off
                </Text>
                <Text
                  className="text-sm font-semibold text-neutral-800"
                  numberOfLines={2}
                >
                  Your saved address for this booking
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Heads up
          </Text>
          <View className="mt-3 gap-3">
            <Tip
              icon="key-outline"
              title="Keep entry ready"
              copy="Share gate code or building access if relevant."
            />
            <Tip
              icon="cube-outline"
              title="Clear the area"
              copy="Make space around the work area for a faster start."
            />
            <Tip
              icon="cash-outline"
              title="Pay on completion"
              copy="UPI or cash works. Receipt shows up automatically."
            />
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
              openWhatsApp(
                `Live update needed on booking ${booking.id} (${booking.serviceLabel}).`,
              )
            }
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 active:opacity-90"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text className="text-sm font-bold text-white">
              Talk to concierge
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/booking/[id]",
                params: { id: booking.id },
              })
            }
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-brand-line bg-white py-3.5 active:bg-accent/5"
          >
            <Ionicons name="document-text-outline" size={16} color="#525252" />
            <Text className="text-sm font-bold text-neutral-800">
              View full booking
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Tip({
  icon,
  title,
  copy,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-accent/15">
        <Ionicons name={icon} size={16} color="#a88a00" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-neutral-900">{title}</Text>
        <Text className="text-xs text-neutral-500">{copy}</Text>
      </View>
    </View>
  );
}
