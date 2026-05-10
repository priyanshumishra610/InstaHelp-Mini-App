import { QUICK_SERVICES } from "@/constants/quickServices";
import { ServiceIcon } from "@/components/service/ServiceIcon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useAuthStore } from "@/store/authStore";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export function HomeScreen() {
  const router = useRouter();
  const phone = useAuthStore((s) => s.phone);
  const [freeform, setFreeform] = useState("");
  const bookings = useMergedBookings();
  const { data: profile } = useProfileQuery();

  const recent = useMemo(() => (bookings ?? []).slice(0, 2), [bookings]);
  const favorites = profile?.favorites ?? [];
  const greeting = profile?.name?.trim()
    ? profile.name.split(" ")[0]
    : "there";

  const submitFreeform = () => {
    const q = freeform.trim();
    if (q.length < 8) {
      Alert.alert(
        "A bit more detail",
        "Add a short description so we can route faster.",
      );
      return;
    }
    router.push({
      pathname: "/request/[slug]",
      params: {
        slug: "custom",
        presetDescription: q,
        presetLabel: "Custom request",
      },
    });
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-2">
          <View className="flex-row items-center justify-between">
            <LogoMark size="md" withWordmark />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Concierge"
              onPress={() =>
                openWhatsApp("Hi InstaHelp, I need help right now.")
              }
              className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft dark:bg-neutral-900 dark:shadow-soft-dark"
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#a88a00" />
            </Pressable>
          </View>
        </View>

        <View className="mt-5 px-5">
          <View className="overflow-hidden rounded-3xl bg-accent p-5">
            <View
              pointerEvents="none"
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30"
            />
            <View
              pointerEvents="none"
              className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-accent-deep/20"
            />
            <Text className="text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground/70">
              Hello {greeting}
            </Text>
            <Text className="mt-2 text-2xl font-extrabold leading-8 text-accent-foreground">
              What can we get done for you today?
            </Text>
            <Text className="mt-2 text-sm leading-5 text-accent-foreground/80">
              One line is enough. We handle vendor matching, coordination,
              and follow through.
            </Text>

            <View className="mt-4 rounded-2xl bg-white p-3 dark:bg-neutral-900">
              <Input
                className="min-h-[80px] border-0 bg-transparent px-2 py-2 text-base dark:bg-transparent"
                multiline
                textAlignVertical="top"
                placeholder="e.g. Deep clean a 2BHK tomorrow morning, supplies included."
                value={freeform}
                onChangeText={setFreeform}
              />
              <View className="mt-2 flex-row items-center justify-between gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voice input"
                  onPress={() =>
                    Alert.alert(
                      "Voice",
                      "Voice capture hooks into your OS next. This MVP shows the dedicated control only.",
                    )
                  }
                  className="flex-row items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2.5 dark:bg-neutral-800"
                >
                  <Ionicons name="mic" size={16} color="#525252" />
                  <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    Voice
                  </Text>
                </Pressable>
                <Button
                  className="flex-1"
                  size="sm"
                  variant="secondary"
                  onPress={submitFreeform}
                >
                  Request now
                </Button>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-7 px-5">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                Quick services
              </Text>
              <Text className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                Pick a category
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {QUICK_SERVICES.map((s) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                onPress={() =>
                  router.push({
                    pathname: "/request/[slug]",
                    params: { slug: s.id, presetLabel: s.label },
                  })
                }
                className="w-[47%] flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-3 active:bg-accent/10 dark:border-brand-lineDark dark:bg-brand-cardDark"
              >
                <ServiceIcon icon={s.icon} />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                    {s.label}
                  </Text>
                  <Text className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Tap to request
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {favorites.length ? (
          <View className="mt-7 px-5">
            <Text className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              Repeat & favorites
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
            >
              <View className="flex-row gap-2 pr-2">
                {favorites.map((id) => {
                  const svc = QUICK_SERVICES.find((x) => x.id === id);
                  if (!svc) return null;
                  return (
                    <Pressable
                      key={id}
                      onPress={() =>
                        router.push({
                          pathname: "/request/[slug]",
                          params: { slug: svc.id, presetLabel: svc.label },
                        })
                      }
                      className="flex-row items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2 active:bg-accent/30"
                    >
                      <Ionicons name="repeat" size={14} color="#a88a00" />
                      <Text className="text-xs font-bold text-neutral-900 dark:text-white">
                        Again · {svc.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : null}

        <View className="mt-7 px-5">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                Recent bookings
              </Text>
              <Text className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                Your activity
              </Text>
            </View>
            {recent.length > 0 ? (
              <Pressable onPress={() => router.push("/(tabs)/bookings")}>
                <Text className="text-xs font-bold text-accent-deep dark:text-accent">
                  See all
                </Text>
              </Pressable>
            ) : null}
          </View>
          {recent.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="time-outline"
              title="No requests yet"
              subtitle="Your active and completed jobs will appear here with live status."
            />
          ) : (
            <View className="mt-3 gap-3">
              {recent.map((b) => (
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
                  <View className="flex-row items-start justify-between gap-3">
                    <Text
                      className="flex-1 text-sm font-bold text-neutral-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {b.serviceLabel}
                    </Text>
                    <StatusBadge status={b.status} />
                  </View>
                  <Text
                    className="mt-2 text-xs text-neutral-500 dark:text-neutral-400"
                    numberOfLines={2}
                  >
                    {b.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="mt-8 px-5">
          <View className="overflow-hidden rounded-3xl bg-neutral-900 p-5 dark:bg-white">
            <View
              pointerEvents="none"
              className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/30"
            />
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              Priority lane
            </Text>
            <Text className="mt-2 text-lg font-extrabold text-white dark:text-neutral-900">
              Need help right now?
            </Text>
            <Text className="mt-1 text-sm text-neutral-300 dark:text-neutral-600">
              Emergency routing prioritises your request on WhatsApp.
            </Text>
            <Pressable
              onPress={() =>
                openWhatsApp(`Urgent help needed for ${phone ?? ""}`)
              }
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-3 active:opacity-90"
            >
              <Ionicons name="logo-whatsapp" size={18} color="#1a1a1a" />
              <Text className="text-sm font-bold text-accent-foreground">
                Message concierge
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
