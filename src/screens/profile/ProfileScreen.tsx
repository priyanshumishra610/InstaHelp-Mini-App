import {
  APP_VERSION,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "@/constants/appInfo";
import {
  ProfileHeroSection,
  ProfileStatsRow,
} from "@/components/profile/ProfileSections";
import { AppearanceSettingsModal } from "@/components/profile/AppearanceSettingsModal";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useAppTheme } from "@/hooks/useAppTheme";
import { persistProfile } from "@/services/profileService";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useProfileStore } from "@/store/profileStore";
import { useTutorialStore } from "@/store/tutorialStore";
import type { Booking } from "@/types/booking";
import type {
  ProfilePreferredContact,
  SavedAddress,
  UserProfile,
} from "@/types/user";
import {
  // booking activity helpers intentionally unused in Profile now
} from "@/utils/bookingActivity";
import { openWhatsApp } from "@/utils/whatsapp";
import { pickOptionalImage } from "@/utils/pickOptionalImage";
import { apiRegisterVendor } from "@/api/appsScriptClient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLACEHOLDER_ADDRESS = "Add your home address in Profile";

const FAVORITES: { id: string; label: string }[] = [
  { id: "cleaner", label: "Cleaner" },
  { id: "driver", label: "Driver" },
  { id: "plumber", label: "Plumber" },
  { id: "electrician", label: "Electrician" },
  { id: "handyman", label: "Handyman" },
  { id: "salon", label: "Salon" },
  { id: "pest_control", label: "Pest control" },
];

function memberSince(bookings: Booking[]): string {
  if (!bookings.length) return "New member";
  const earliest = bookings.reduce<Date | null>((acc, b) => {
    const d = new Date(b.createdAt);
    if (isNaN(d.getTime())) return acc;
    if (!acc) return d;
    return d < acc ? d : acc;
  }, null);
  if (!earliest) return "New member";
  return `Member since ${earliest.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  })}`;
}

function displayValue(value: string | null | undefined, empty = "Not added") {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : empty;
}

export function ProfileScreen() {
  const router = useRouter();
  const signOut = useSignOut();
  const phone = useAuthPhone();
  // Keep a query running to refresh store-backed profile in the background.
  useProfileQuery();
  // UI should render from the persisted local profile so edits reflect instantly.
  const profile = useProfileStore((s) => s.profile);
  const bookings = useMergedBookings();
  const { refreshSession } = useAuth();
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite);
  const upsertAddress = useProfileStore((s) => s.upsertAddress);
  const removeAddress = useProfileStore((s) => s.removeAddress);
  const setProfileLocal = useProfileStore((s) => s.setProfile);
  const { schemeLabel, accentLabel, colors, isDark } = useAppTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.avatarSeed?.trim()) return;
    void persistIfWeCan({
      ...profile,
      avatarSeed: Math.random().toString(36).slice(2, 10),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.phone]);

  const initial = (
    profile?.name?.trim()?.[0] ||
    phone?.replace(/\D/g, "")?.slice(-1) ||
    "?"
  )
    .toString()
    .toUpperCase();

  const memberLine = memberSince(bookings);

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const active = bookings.filter(
      (b) => b.status !== "completed" && b.status !== "pending",
    ).length;
    return { total, completed, active };
  }, [bookings]);

  const preferredContact: ProfilePreferredContact =
    profile?.preferredContact ?? "whatsapp";

  const updateRole = async (role: "consumer" | "business") => {
    if (!profile || !phone) return;
    await persistIfWeCan({ ...profile, role });
  };

  const updatePreferredContact = async (
    next: ProfilePreferredContact,
  ) => {
    if (!profile || !phone) return;
    await persistIfWeCan({ ...profile, preferredContact: next });
  };

  const copyPhone = async () => {
    if (!phone) return;
    try {
      await Clipboard.setStringAsync(phone);
      Alert.alert("Copied", "Phone number copied to clipboard.");
    } catch {
      // ignore
    }
  };

  const openLegal = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const submitVendorRegistration = async (payload: {
    businessName: string;
    businessType: string;
    city: string;
    email: string;
    expectations: string[];
  }) => {
    if (!phone) throw new Error("Not signed in");
    const res = await apiRegisterVendor({
      phone,
      name: profile?.name?.trim() || undefined,
      email: payload.email.trim(),
      businessName: payload.businessName.trim(),
      businessType: payload.businessType,
      city: payload.city.trim(),
      expectations: payload.expectations,
    });
    if (!res.ok) throw new Error(res.error);
  };

  const {
    isLoading: detecting,
    refresh: detectLocation,
  } = useDeviceAddress({ autoFetch: false });
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const persistIfWeCan = async (next: UserProfile) => {
    setProfileLocal(next);
    if (phone) await persistProfile(next).catch(() => {});
  };

  const fallbackAvatarUri = useMemo(() => {
    const seed =
      profile?.avatarSeed?.trim() ||
      phone?.replace(/\D/g, "")?.slice(-8) ||
      "instahelp";
    return `https://api.dicebear.com/7.x/fun-emoji/png?seed=${encodeURIComponent(
      seed,
    )}&backgroundColor=f5f5f4,e7e5e4,d6d3d1`;
  }, [phone, profile?.avatarSeed]);

  const addCurrentLocation = async () => {
    if (savingLocation || detecting) return;
    setSavingLocation(true);
    try {
      const detected = await detectLocation();
      if (!detected) return;
      const existing = profile?.addresses ?? [];
      const hasHome = existing.some((a) => a.id === "home");
      const id = hasHome
        ? `loc_${Date.now().toString(36)}`
        : "home";
      const label = hasHome
        ? detected.city || detected.region || "Current location"
        : "Home";
      const next: SavedAddress = {
        id,
        label,
        line: detected.address,
      };

      upsertAddress(next);

      if (profile && phone) {
        const updated: UserProfile = {
          ...profile,
          addresses: [
            ...existing.filter((a) => a.id !== next.id),
            next,
          ],
        };
        await persistIfWeCan(updated);
      }
    } catch (err) {
      Alert.alert(
        "Could not get location",
        err instanceof Error
          ? err.message
          : "Try again with location enabled.",
      );
    } finally {
      setSavingLocation(false);
    }
  };

  const deleteAddress = (addressId: string, label: string) => {
    Alert.alert(
      "Remove address",
      `Remove "${label}" from your saved addresses?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            removeAddress(addressId);
            if (profile && phone) {
              const updated: UserProfile = {
                ...profile,
                addresses: profile.addresses.filter((a) => a.id !== addressId),
              };
              await persistIfWeCan(updated);
            }
          },
        },
      ],
    );
  };

  const savePickedAvatar = async () => {
    if (!profile || !phone || savingAvatar) return;
    setSavingAvatar(true);
    try {
      const picked = await pickOptionalImage({ squareCrop: true, quality: 0.55 });
      if (!picked) return;
      const uri = picked.base64
        ? `data:${picked.mime ?? "image/jpeg"};base64,${picked.base64}`
        : picked.uri;
      const updated: UserProfile = { ...profile, avatarUri: uri };
      await persistIfWeCan(updated);
    } finally {
      setSavingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile || !phone) return;
    const updated: UserProfile = { ...profile, avatarUri: undefined };
    await persistIfWeCan(updated);
  };

  const openAvatarActions = () => {
    if (!profile || !phone || savingAvatar) return;
    const has = !!profile.avatarUri?.trim();
    Alert.alert(
      "Profile photo",
      has ? "Update or remove your photo." : "Add a photo from your library.",
      [
        {
          text: "Choose photo",
          onPress: () => {
            void savePickedAvatar();
          },
        },
        ...(has
          ? [
              {
                text: "Remove photo",
                style: "destructive" as const,
                onPress: () => {
                  void removeAvatar();
                },
              },
            ]
          : []),
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in any time with this number.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          "InstaHelp gets it done. Cleaning, repairs, errands \u2014 one tap, one concierge. Try it: https://instahelp.in",
        url: "https://instahelp.in",
      });
    } catch {
      // Ignore share dismiss errors.
    }
  };

  const displayName = profile?.name?.trim() || "InstaHelp member";
  const addressCount = (profile?.addresses ?? []).filter(
    (a) => a.line?.trim() && !a.line.includes(PLACEHOLDER_ADDRESS),
  ).length;
  const favoriteCount = profile?.favorites?.length ?? 0;
  const roleLabel =
    (profile?.role ?? "consumer") === "business" ? "Business" : "Personal";
  const contactLabel =
    preferredContact === "whatsapp"
      ? "WhatsApp"
      : preferredContact === "call"
        ? "Phone call"
        : "WhatsApp or call";

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(380)}>
          <View className="mb-3">
            <Text className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              Account
            </Text>
            <Text className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
              Profile
            </Text>
            <Text className="mt-1 text-sm text-neutral-500">
              Your details and preferences.
            </Text>
          </View>
        </Animated.View>

        <ProfileHeroSection
          displayName={displayName}
          phone={phone}
          email={profile?.email}
          memberLine={memberLine}
          roleLabel={`${roleLabel} account`}
          avatarUri={profile?.avatarUri}
          fallbackAvatarUri={fallbackAvatarUri}
          savingAvatar={savingAvatar}
          onAvatarPress={openAvatarActions}
          onEditPress={() => setDetailsOpen(true)}
          onCopyPhone={copyPhone}
        />

        <ProfileStatsRow
          bookings={bookingStats.total}
          completed={bookingStats.completed}
          addresses={addressCount}
        />

        <Animated.View
          entering={FadeInUp.duration(400).delay(140)}
          className="mt-8"
        >
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Your information
            </Text>
            <Pressable
              onPress={() => setDetailsOpen(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Edit your information"
            >
              <Text className="text-xs font-semibold text-neutral-900">Edit all</Text>
            </Pressable>
          </View>
          <View
            className="overflow-hidden rounded-3xl border border-neutral-100 bg-white"
            style={
              Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.06,
                    shadowRadius: 20,
                  }
                : { elevation: 4 }
            }
          >
            <InfoRow
              label="Full name"
              value={displayValue(profile?.name, "Add your name")}
              muted={!profile?.name?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              label="Mobile"
              value={phone ?? "—"}
              onPress={copyPhone}
              onLongPress={copyPhone}
            />
            <InfoHairline />
            <InfoRow
              label="Email"
              value={displayValue(profile?.email)}
              muted={!profile?.email?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              label="Birthday"
              value={displayValue(profile?.birthday)}
              muted={!profile?.birthday?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              label="Anniversary"
              value={displayValue(profile?.anniversary)}
              muted={!profile?.anniversary?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              label="Preferred contact"
              value={contactLabel}
              last
            />
          </View>
          <Text className="mt-2 px-1 text-[11px] leading-4 text-neutral-400">
            {bookingStats.active > 0
              ? `${bookingStats.active} active booking${bookingStats.active === 1 ? "" : "s"} right now.`
              : bookingStats.total > 0
                ? "All bookings are complete or awaiting assignment."
                : "Book a service from Home to see activity here."}
            {favoriteCount > 0
              ? ` ${favoriteCount} favorite service${favoriteCount === 1 ? "" : "s"} selected.`
              : ""}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(190)}
          className="mt-8"
        >
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Account & preferences
          </Text>
          <View
            className="overflow-hidden rounded-3xl border border-neutral-100 bg-white"
            style={
              Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.06,
                    shadowRadius: 20,
                  }
                : { elevation: 4 }
            }
          >
            <View className="px-4 pb-4 pt-4">
              <Text className="text-sm font-semibold text-neutral-900">
                Account type
              </Text>

              <View className="mt-3 flex-row overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 p-1">
              {(
                [
                  { id: "consumer" as const, label: "Personal" },
                  { id: "business" as const, label: "Business" },
                ] as const
              ).map((opt) => {
                const on = (profile?.role ?? "consumer") === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => void updateRole(opt.id)}
                    className={`flex-1 rounded-xl py-2.5 ${on ? "bg-white" : ""}`}
                    style={
                      on
                        ? Platform.OS === "ios"
                          ? {
                              shadowColor: "#0f172a",
                              shadowOffset: { width: 0, height: 6 },
                              shadowOpacity: 0.08,
                              shadowRadius: 12,
                            }
                          : { elevation: 2 }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-center text-[13px] font-bold ${
                        on ? "text-neutral-900" : "text-neutral-500"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            </View>

            <View className="h-px bg-neutral-100" />

            <View className="px-4 pb-4 pt-4">
              <Text className="text-sm font-semibold text-neutral-900">
                Preferred contact
              </Text>

              <View className="mt-3 flex-row flex-wrap gap-2">
                {(
                  [
                    { id: "whatsapp" as const, label: "WhatsApp" },
                    { id: "call" as const, label: "Phone call" },
                    { id: "either" as const, label: "Either" },
                  ] as const
                ).map((opt) => {
                  const on = preferredContact === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => void updatePreferredContact(opt.id)}
                      className={`rounded-full px-4 py-2 active:opacity-90 ${
                        on ? "bg-neutral-900" : "border border-neutral-200 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          on ? "text-white" : "text-neutral-700"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* QUICK ACTIONS — grouped list */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(180)}
          className="mt-8"
        >
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Quick actions
          </Text>
          <View
            className="overflow-hidden rounded-3xl border border-neutral-100 bg-white"
            style={
              Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.05,
                    shadowRadius: 16,
                  }
                : { elevation: 3 }
            }
          >
            <ActionRow
              title="Book a service"
              onPress={() => router.push("/(tabs)")}
            />
            <RowHairline />
            <ActionRow
              title="Gift cards"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/shop",
                  params: { section: "giftcards" },
                })
              }
            />
            <RowHairline />
            <ActionRow
              title="Register as vendor"
              onPress={() => setVendorOpen(true)}
            />
            <RowHairline />
            <ActionRow
              title="Booking history"
              subtitle={
                bookingStats.total > 0
                  ? `${bookingStats.total} request${bookingStats.total === 1 ? "" : "s"}`
                  : undefined
              }
              onPress={() => router.push("/(tabs)/bookings")}
            />
            <RowHairline />
            <ActionRow
              title="Help & support"
              onPress={() => router.push("/support")}
            />
            <RowHairline />
            <ActionRow
              title="Add location"
              subtitle={
                detecting || savingLocation ? "Detecting…" : undefined
              }
              loading={detecting || savingLocation}
              onPress={addCurrentLocation}
            />
            <RowHairline />
            <ActionRow title="Refer a friend" onPress={shareApp} />
          </View>
        </Animated.View>

        {/* ADDRESSES */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(240)}
          className="mt-8"
        >
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Saved addresses
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400">
              {(profile?.addresses ?? []).length} saved
            </Text>
          </View>
          <View
            className="overflow-hidden rounded-3xl border border-neutral-100 bg-white"
            style={
              Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.05,
                    shadowRadius: 16,
                  }
                : { elevation: 3 }
            }
          >
            {(profile?.addresses ?? []).length === 0 ? (
              <View className="px-5 py-6">
                <Text className="text-sm text-neutral-500">
                  No saved addresses. Use Add location above to save your current spot.
                </Text>
              </View>
            ) : (
              (profile?.addresses ?? []).map((a, i, arr) => (
                <View key={a.id}>
                  <View className="flex-row items-start gap-3 px-4 py-4">
                    <View className="min-w-0 flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text
                          className="text-sm font-semibold text-neutral-900"
                          numberOfLines={1}
                        >
                          {a.label}
                        </Text>
                        {i === 0 ? (
                          <Text className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                            Default
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        className="mt-1 text-sm leading-5 text-neutral-500"
                        numberOfLines={3}
                      >
                        {a.line}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteAddress(a.id, a.label)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${a.label}`}
                      hitSlop={8}
                      className="py-1 active:opacity-60"
                    >
                      <Text className="text-xs font-medium text-neutral-400">
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                  {i < arr.length - 1 ? (
                    <View className="mx-4 h-px bg-neutral-100" />
                  ) : null}
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* FAVORITES */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(300)}
          className="mt-8"
        >
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Favorite services
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400">
              {favoriteCount} selected
            </Text>
          </View>
          <Text className="mb-3 text-xs text-neutral-500">
            Tap to select services you book most often.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FAVORITES.map((f) => {
              const on = Boolean(profile?.favorites?.includes(f.id));
              return (
                <Pressable
                  key={f.id}
                  onPress={() => toggleFavorite(f.id)}
                  className={`rounded-full px-4 py-2 active:opacity-90 ${
                    on
                      ? "bg-neutral-900"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      on ? "text-white" : "text-neutral-600"
                    }`}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* SETTINGS & LEGAL */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(360)}
          className="mt-8"
        >
          <Text
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: colors.inkMuted }}
          >
            Settings
          </Text>
          <View
            className="overflow-hidden rounded-3xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.line,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.22 : 0.05,
                    shadowRadius: 16,
                  }
                : { elevation: 3 }),
            }}
          >
            <SettingsRow
              label="App tutorial"
              value="Interactive tour"
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => {
                router.replace("/(tabs)");
                setTimeout(() => {
                  useTutorialStore.getState().startTutorial();
                }, 400);
              }}
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="Appearance"
              value={`${schemeLabel} · ${accentLabel}`}
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => setAppearanceOpen(true)}
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="Privacy policy"
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => openLegal(LEGAL_PRIVACY_URL)}
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="Terms of use"
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => openLegal(LEGAL_TERMS_URL)}
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="Notifications"
              value="System"
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="Send feedback"
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() =>
                openWhatsApp(
                  `InstaHelp app feedback (v${APP_VERSION}, ${Platform.OS}): `,
                )
              }
            />
            <SettingsHairline color={colors.lineLight} />
            <SettingsRow
              label="About & help"
              value={`v${APP_VERSION}`}
              ink={colors.ink}
              muted={colors.inkMuted}
              onPress={() => router.push("/support")}
              last
            />
          </View>
        </Animated.View>

        {/* SIGN OUT */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(420)}
          className="mt-8 items-center pb-2"
        >
          <Pressable
            onPress={confirmSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
            className="py-2 active:opacity-70"
          >
            <Text className="text-sm font-medium text-neutral-900">Sign out</Text>
          </Pressable>
          <Text className="mt-2 text-center text-[11px] text-neutral-400">
            Signed in as {phone ?? "—"}
          </Text>
        </Animated.View>
      </ScrollView>

      <EditProfileDetailsModal
        open={detailsOpen}
        profile={profile}
        onClose={() => setDetailsOpen(false)}
        onSave={async (patch) => {
          if (!profile || !phone) return;
          await persistIfWeCan({ ...profile, ...patch });
          await refreshSession();
          setDetailsOpen(false);
        }}
      />

      <AppearanceSettingsModal
        open={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
      />

      <VendorRegistrationModal
        open={vendorOpen}
        profile={profile}
        onClose={() => setVendorOpen(false)}
        onSubmit={async (payload) => {
          await submitVendorRegistration(payload);
          setVendorOpen(false);
          Alert.alert(
            "Request received",
            "Thanks for reaching out. We’ve received your vendor details — our team will review them and share the next steps shortly.",
          );
        }}
      />
    </Screen>
  );
}

function InfoHairline() {
  return <View className="mx-4 h-px bg-neutral-100" />;
}

function InfoRow({
  label,
  value,
  muted,
  onPress,
  onLongPress,
  last,
}: {
  label: string;
  value: string;
  muted?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  last?: boolean;
}) {
  const interactive = Boolean(onPress || onLongPress);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!interactive}
      accessibilityRole={interactive ? "button" : "text"}
      accessibilityLabel={`${label}, ${value}`}
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        interactive ? "active:bg-neutral-50" : ""
      } ${last ? "" : ""}`}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-xs text-neutral-400">{label}</Text>
        <Text
          className={`mt-0.5 text-[15px] font-medium ${
            muted ? "text-neutral-400" : "text-neutral-900"
          }`}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
      {interactive ? (
        <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
      ) : null}
    </Pressable>
  );
}

function RowHairline() {
  return <View className="ml-4 h-px bg-neutral-200/90" />;
}

function ActionRow({
  title,
  subtitle,
  onPress,
  loading,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      className={`flex-row items-center justify-between px-4 py-3.5 active:bg-neutral-50 ${
        loading ? "opacity-70" : ""
      }`}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-medium text-neutral-900" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-neutral-400" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#a3a3a3" />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
      )}
    </Pressable>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  last,
  ink = "#1C1917",
  muted = "#A8A29E",
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  ink?: string;
  muted?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-between px-4 py-3.5 active:opacity-80 ${
        last ? "" : ""
      }`}
    >
      <Text className="text-[15px] font-medium" style={{ color: ink }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {value ? (
          <Text className="text-xs" style={{ color: muted }}>
            {value}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={muted} />
      </View>
    </Pressable>
  );
}

function SettingsHairline({ color = "#F5F5F4" }: { color?: string }) {
  return <View className="mx-4 h-px" style={{ backgroundColor: color }} />;
}

type ProfileDetailsPatch = Pick<
  UserProfile,
  "name" | "email" | "birthday" | "anniversary"
>;

function EditProfileDetailsModal({
  open,
  profile,
  onClose,
  onSave,
}: {
  open: boolean;
  profile: UserProfile | null | undefined;
  onClose: () => void;
  onSave: (patch: ProfileDetailsPatch) => Promise<void> | void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [birthday, setBirthday] = useState(profile?.birthday ?? "");
  const [anniversary, setAnniversary] = useState(profile?.anniversary ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setBirthday(profile?.birthday ?? "");
    setAnniversary(profile?.anniversary ?? "");
    setError(null);
  }, [open, profile?.anniversary, profile?.birthday, profile?.email, profile?.name]);

  const save = async () => {
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();
    const emailOk =
      emailTrimmed.length === 0 ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    if (nameTrimmed.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!emailOk) {
      setError("Enter a valid email or leave it blank.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: nameTrimmed,
        email: emailTrimmed.length ? emailTrimmed : null,
        birthday: birthday.trim().length ? birthday.trim() : null,
        anniversary: anniversary.trim().length ? anniversary.trim() : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <Pressable
            onPress={() => {}}
            className="w-full rounded-t-3xl bg-white px-5 pb-6 pt-5"
            style={{ paddingBottom: Math.max(24, insets.bottom + 16) }}
          >
            <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
            <Text className="text-lg font-extrabold text-neutral-900">
              Profile details
            </Text>
            <Text className="mt-1 text-xs leading-5 text-neutral-500">
              Used on bookings, receipts, and optional birthday reminders.
              Your mobile number is managed through sign-in.
            </Text>

            <View className="mt-5 gap-3">
              <FieldBlock label="Full name">
                <Input
                  autoFocus
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChangeText={(t) => {
                    setError(null);
                    setName(t);
                  }}
                  returnKeyType="next"
                />
              </FieldBlock>
              <FieldBlock label="Email">
                <Input
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="hello@email.com"
                  value={email}
                  onChangeText={(t) => {
                    setError(null);
                    setEmail(t);
                  }}
                />
              </FieldBlock>
              <FieldBlock label="Birthday" hint="Optional — DD / MM / YYYY">
                <Input
                  placeholder="DD / MM / YYYY"
                  value={birthday}
                  onChangeText={(t) => {
                    setError(null);
                    setBirthday(t);
                  }}
                />
              </FieldBlock>
              <FieldBlock label="Anniversary" hint="Optional — DD / MM / YYYY">
                <Input
                  placeholder="DD / MM / YYYY"
                  value={anniversary}
                  onChangeText={(t) => {
                    setError(null);
                    setAnniversary(t);
                  }}
                />
              </FieldBlock>
            </View>

            {error ? (
              <Text className="mt-3 text-xs font-semibold text-red-600">
                {error}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                className="flex-1 rounded-2xl border border-brand-line bg-white py-3.5 active:bg-neutral-50"
              >
                <Text className="text-center text-sm font-bold text-neutral-700">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={save}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Save profile details"
                className={`flex-1 rounded-2xl bg-neutral-900 py-3.5 active:opacity-90 ${
                  saving ? "opacity-70" : ""
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-sm font-bold text-white">
                    Save changes
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

type VendorExpectOption = { id: string; label: string };

const VENDOR_TYPES: { id: string; label: string }[] = [
  { id: "services", label: "Service provider" },
  { id: "shop", label: "Local shop" },
  { id: "agency", label: "Agency / team" },
  { id: "freelancer", label: "Freelancer" },
];

const VENDOR_EXPECTATIONS: VendorExpectOption[] = [
  { id: "get_leads", label: "More leads / customers" },
  { id: "branding", label: "Brand visibility" },
  { id: "online_listing", label: "Online listing & discovery" },
  { id: "payments", label: "Help with payments & bookings" },
  { id: "growth", label: "Business growth guidance" },
];

function VendorRegistrationModal({
  open,
  profile,
  onClose,
  onSubmit,
}: {
  open: boolean;
  profile: UserProfile | null | undefined;
  onClose: () => void;
  onSubmit: (payload: {
    businessName: string;
    businessType: string;
    city: string;
    email: string;
    expectations: string[];
  }) => Promise<void> | void;
}) {
  const insets = useSafeAreaInsets();
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState<string>(
    VENDOR_TYPES[0]?.id ?? "services",
  );
  const [expectations, setExpectations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusinessName("");
    setCity(profile?.city?.trim() || "");
    setEmail(profile?.email?.trim() || "");
    setBusinessType(VENDOR_TYPES[0]?.id ?? "services");
    setExpectations([]);
    setError(null);
  }, [open, profile?.city, profile?.email]);

  const toggleExpectation = (id: string) => {
    setExpectations((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return cur;
      return [...cur, id];
    });
  };

  const submit = async () => {
    const bn = businessName.trim();
    const c = city.trim();
    const e = email.trim();
    if (bn.length < 2) {
      setError("Enter your business name.");
      return;
    }
    if (c.length < 2) {
      setError("Enter your city.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!emailOk) {
      setError("Enter a valid email (we’ll send a confirmation).");
      return;
    }
    if (!businessType) {
      setError("Choose a business type.");
      return;
    }
    if (expectations.length === 0) {
      setError("Pick at least one expectation.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        businessName: bn,
        businessType,
        city: c,
        email: e,
        expectations,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <Pressable
            onPress={() => {}}
            className="w-full rounded-t-3xl bg-white px-5 pt-5"
            style={{ paddingBottom: Math.max(24, insets.bottom + 16) }}
          >
            <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
            <Text className="text-lg font-extrabold text-neutral-900">
              Register as a vendor
            </Text>
            <Text className="mt-1 text-xs leading-5 text-neutral-500">
              Share a few details — our team will review and reach out with onboarding steps.
            </Text>

            <View className="mt-5 gap-3">
              <FieldBlock label="Business name">
                <Input
                  placeholder="Your business / brand name"
                  value={businessName}
                  onChangeText={(t) => {
                    setError(null);
                    setBusinessName(t);
                  }}
                />
              </FieldBlock>

              <FieldBlock label="Business type">
                <View className="flex-row flex-wrap gap-2">
                  {VENDOR_TYPES.map((t) => {
                    const on = businessType === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => {
                          setError(null);
                          setBusinessType(t.id);
                        }}
                        className={`rounded-full px-4 py-2 active:opacity-90 ${
                          on
                            ? "border border-neutral-900 bg-neutral-50"
                            : "border border-neutral-200 bg-white"
                        }`}
                      >
                        <Text className="text-xs font-bold text-neutral-800">
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FieldBlock>

              <FieldBlock label="City">
                <Input
                  placeholder="City"
                  value={city}
                  onChangeText={(t) => {
                    setError(null);
                    setCity(t);
                  }}
                />
              </FieldBlock>

              <FieldBlock label="Email" hint="We’ll send a confirmation here">
                <Input
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="hello@email.com"
                  value={email}
                  onChangeText={(t) => {
                    setError(null);
                    setEmail(t);
                  }}
                />
              </FieldBlock>

              <FieldBlock
                label="What do you expect from InstaHelp?"
                hint="Pick up to 3"
              >
                <View className="flex-row flex-wrap gap-2">
                  {VENDOR_EXPECTATIONS.map((opt) => {
                    const on = expectations.includes(opt.id);
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => {
                          setError(null);
                          toggleExpectation(opt.id);
                        }}
                        className={`rounded-full px-4 py-2 active:opacity-90 ${
                          on
                            ? "bg-neutral-900"
                            : "border border-neutral-200 bg-neutral-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            on ? "text-white" : "text-neutral-700"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FieldBlock>
            </View>

            {error ? (
              <Text className="mt-3 text-xs font-semibold text-red-600">
                {error}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                className="flex-1 rounded-2xl border border-brand-line bg-white py-3.5 active:bg-neutral-50"
              >
                <Text className="text-center text-sm font-bold text-neutral-700">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Submit vendor registration"
                className={`flex-1 rounded-2xl bg-neutral-900 py-3.5 active:opacity-90 ${
                  saving ? "opacity-70" : ""
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-sm font-bold text-white">
                    Submit
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-xs font-bold text-neutral-600">{label}</Text>
      {children}
      {hint ? (
        <Text className="mt-1 text-[10px] text-neutral-400">{hint}</Text>
      ) : null}
    </View>
  );
}
