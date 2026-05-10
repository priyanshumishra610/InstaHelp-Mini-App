import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const FAVORITES = [
  { id: "cleaner", label: "Cleaner", icon: "sparkles" as const },
  { id: "driver", label: "Driver", icon: "car" as const },
  { id: "plumber", label: "Plumber", icon: "water" as const },
  { id: "electrician", label: "Electrician", icon: "flash" as const },
];

export function ProfileScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const phone = useAuthStore((s) => s.phone);
  const { data: profile } = useProfileQuery();
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite);

  const initial =
    (profile?.name?.trim()?.[0] || phone?.replace(/\D/g, "")?.slice(-1) || "?")
      .toString()
      .toUpperCase();

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep dark:text-accent">
            Profile
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            Your account
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Addresses, history, and concierge support.
          </Text>
        </View>

        <View className="mt-6 overflow-hidden rounded-3xl bg-accent p-5">
          <View
            pointerEvents="none"
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/30"
          />
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent-foreground">
              <Text className="text-xl font-extrabold text-accent">
                {initial}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-foreground/70">
                Signed in
              </Text>
              <Text
                className="mt-1 text-lg font-extrabold text-accent-foreground"
                numberOfLines={1}
              >
                {profile?.name?.trim() || phone || "Member"}
              </Text>
              {profile?.name?.trim() ? (
                <Text className="text-xs text-accent-foreground/80">
                  {phone}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Saved addresses
        </Text>
        <View className="gap-3">
          {(profile?.addresses ?? []).length === 0 ? (
            <View className="items-start rounded-2xl border border-dashed border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-brand-cardDark">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={16} color="#a88a00" />
                <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                  No addresses saved
                </Text>
              </View>
              <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Add a home or work address to speed up future requests.
              </Text>
            </View>
          ) : (
            (profile?.addresses ?? []).map((a) => (
              <View
                key={a.id}
                className="flex-row items-start gap-3 rounded-2xl border border-brand-line bg-white p-4 dark:border-brand-lineDark dark:bg-brand-cardDark"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/15">
                  <Ionicons name="location" size={16} color="#a88a00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                    {a.label}
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {a.line}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Favorites
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {FAVORITES.map((f) => {
            const on = profile?.favorites.includes(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => toggleFavorite(f.id)}
                className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
                  on
                    ? "bg-accent"
                    : "border border-brand-line bg-white dark:border-brand-lineDark dark:bg-brand-cardDark"
                }`}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={on ? "#1a1a1a" : "#a88a00"}
                />
                <Text
                  className={`text-xs font-bold ${
                    on
                      ? "text-accent-foreground"
                      : "text-neutral-700 dark:text-neutral-200"
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Support
        </Text>
        <View className="gap-2">
          <Pressable
            onPress={() => router.push("/(tabs)/bookings")}
            className="flex-row items-center justify-between rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5 dark:border-brand-lineDark dark:bg-brand-cardDark"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/15">
                <Ionicons name="time" size={16} color="#a88a00" />
              </View>
              <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                Booking history
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </Pressable>
          <Pressable
            onPress={() => openWhatsApp()}
            className="flex-row items-center justify-between rounded-2xl border border-brand-line bg-white p-4 active:bg-accent/5 dark:border-brand-lineDark dark:bg-brand-cardDark"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/15">
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              </View>
              <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                WhatsApp concierge
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </Pressable>
        </View>

        <View className="mt-8">
          <Button
            variant="outline"
            onPress={() => signOut()}
            accessibilityLabel="Sign out"
          >
            Sign out
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
