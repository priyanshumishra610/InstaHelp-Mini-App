import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { APP_VERSION, APP_WEB_URL } from "@/constants/appInfo";
import { ACCENT } from "@/constants/theme";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type IoniconName = keyof typeof Ionicons.glyphMap;

const FAQ_ITEMS: {
  q: string;
  a: string;
  wa: string;
  icon: IoniconName;
}[] = [
  {
    q: "Track a booking",
    a: "Open Activity to see live status, timelines, and next steps for every request.",
    wa: "Hi InstaHelp! I need an update on my booking status.",
    icon: "time-outline",
  },
  {
    q: "Payment or billing",
    a: "We coordinate with vendors on your behalf. Message us with your booking ID.",
    wa: "Hi InstaHelp! I have a payment question about my recent booking.",
    icon: "card-outline",
  },
  {
    q: "Cancel or reschedule",
    a: "Use Reschedule from a booking, or ask the concierge to move your slot.",
    wa: "Hi InstaHelp! I need to reschedule or cancel a booking.",
    icon: "calendar-outline",
  },
  {
    q: "Vendor quality",
    a: "Tell us what happened — we use your feedback to improve matching.",
    wa: "Hi InstaHelp! I'd like to share feedback about my last service visit.",
    icon: "chatbubble-ellipses-outline",
  },
];

export function HelpSupportScreen() {
  const openSite = useCallback(() => {
    Linking.openURL(APP_WEB_URL).catch(() => {});
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(380)} className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep">
            Help
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-neutral-900">
            Support center
          </Text>
          <Text className="mt-1 text-sm leading-5 text-neutral-500">
            Quick answers, WhatsApp concierge, and links — without leaving the
            app.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(420).delay(60)} className="mt-6">
          <View
            className="rounded-[28px] border border-neutral-200 bg-white p-6"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <View className="flex-row items-start gap-4">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: ACCENT }}
              >
                <Ionicons name="headset" size={26} color="#ffffff" />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: ACCENT }}
                >
                  Concierge
                </Text>
                <Text className="mt-1 text-xl font-extrabold text-neutral-950">
                  Chat with us on WhatsApp
                </Text>
                <Text className="mt-1 text-sm leading-5 text-neutral-500">
                  Real humans. Fast replies. Share photos, voice notes, or booking
                  IDs.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() =>
                openWhatsApp(
                  "Hi InstaHelp! I need help with the app or a booking.",
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Open WhatsApp support"
              className="mt-5 flex-row items-center justify-center gap-2 rounded-full py-3.5 active:opacity-92"
              style={{ backgroundColor: "#171717" }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#0A0A0A" />
              <Text className="text-[15px] font-extrabold text-neutral-950">
                Message InstaHelp
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(420).delay(120)} className="mt-8">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Common topics
          </Text>
          <View className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white">
            {FAQ_ITEMS.map((item, i) => (
              <View key={item.q}>
                <Pressable
                  onPress={() => openWhatsApp(item.wa)}
                  accessibilityRole="button"
                  accessibilityLabel={item.q}
                  className="flex-row items-start gap-3 px-4 py-4 active:bg-neutral-50"
                >
                  <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                    <Ionicons name={item.icon} size={18} color={ACCENT} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[15px] font-bold text-neutral-900">
                      {item.q}
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-neutral-600">
                      {item.a}
                    </Text>
                    <Text className="mt-2 text-xs font-bold text-accent">
                      Open WhatsApp →
                    </Text>
                  </View>
                </Pressable>
                {i < FAQ_ITEMS.length - 1 ? (
                  <View className="ml-[68px] mr-4 h-px bg-neutral-100" />
                ) : null}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(420).delay(180)} className="mt-8">
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            App
          </Text>
          <View className="overflow-hidden rounded-2xl bg-neutral-50">
            <Pressable
              onPress={openSite}
              accessibilityRole="button"
              accessibilityLabel="Open website"
              className="flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-200/40"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                <Ionicons name="globe-outline" size={18} color={ACCENT} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-semibold text-neutral-900">
                  Website
                </Text>
                <Text className="mt-0.5 text-xs text-neutral-500" numberOfLines={1}>
                  {APP_WEB_URL.replace(/^https?:\/\//, "")}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#a3a3a3" />
            </Pressable>
            <View className="ml-14 mr-4 h-px bg-neutral-200/90" />
            <Pressable
              onPress={openSettings}
              accessibilityRole="button"
              accessibilityLabel="Open system settings"
              className="flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-200/40"
            >
              <Ionicons name="notifications-outline" size={20} color="#737373" />
              <Text className="flex-1 text-[15px] font-semibold text-neutral-900">
                Notification settings
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(420).delay(240)}
          className="mt-8 items-center rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-5 py-6"
        >
          <LogoMark size="md" />
          <Text className="mt-3 text-center text-sm font-semibold text-neutral-800">
            InstaHelp
          </Text>
          <Text className="mt-1 text-center text-[13px] leading-5 text-neutral-500">
            Version {APP_VERSION}. Built to connect you with trusted local pros
            and concierge support.
          </Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}
