import {
  APP_VERSION,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "@/constants/appInfo";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { persistProfile } from "@/services/profileService";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useProfileStore } from "@/store/profileStore";
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

type IoniconName = keyof typeof Ionicons.glyphMap;

const PLACEHOLDER_ADDRESS = "Add your home address in Profile";

const FAVORITES: { id: string; label: string; icon: IoniconName }[] = [
  { id: "cleaner", label: "Cleaner", icon: "sparkles" },
  { id: "driver", label: "Driver", icon: "car" },
  { id: "plumber", label: "Plumber", icon: "water" },
  { id: "electrician", label: "Electrician", icon: "flash" },
  { id: "handyman", label: "Handyman", icon: "construct" },
  { id: "salon", label: "Salon", icon: "color-wand" },
  { id: "pest_control", label: "Pest control", icon: "bug-outline" },
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);

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
    )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
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
        <Animated.View entering={FadeInUp.duration(380)} className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">
            Account
          </Text>
          <Text className="mt-1 text-[32px] font-extrabold tracking-tight text-neutral-900">
            Profile
          </Text>
          <Text className="mt-1.5 text-sm leading-5 text-neutral-500">
            Manage your account, booking activity, and how InstaHelp reaches you.
          </Text>
        </Animated.View>

        {/* HERO */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(60)}
          className="mt-6 overflow-hidden rounded-[28px] border border-white/10 shadow-lg"
        >
          <LinearGradient
            colors={["#6D28D9", "#7C3AED", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
          <View className="absolute left-6 top-0 h-1 w-12 rounded-full bg-brand-gold" />

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={openAvatarActions}
                disabled={savingAvatar}
                accessibilityRole="button"
                accessibilityLabel="Profile photo"
                hitSlop={4}
                className="relative"
              >
                <View className="h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-white/35 bg-white/10">
                  {profile?.avatarUri ? (
                    <Image
                      source={{ uri: profile.avatarUri }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: fallbackAvatarUri }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  )}
                  {savingAvatar ? (
                    <View className="absolute inset-0 items-center justify-center bg-black/40">
                      <ActivityIndicator color="#ffffff" size="small" />
                    </View>
                  ) : null}
                </View>
                <View className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white/50 bg-white p-1.5 shadow-sm">
                  <Ionicons name="camera" size={14} color="#7C3AED" />
                </View>
              </Pressable>
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                  Signed in
                </Text>
                <Text
                  className="mt-1 text-xl font-extrabold text-accent-foreground"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Pressable
                  onLongPress={copyPhone}
                  delayLongPress={400}
                  accessibilityRole="button"
                  accessibilityLabel="Phone number, long press to copy"
                  hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
                >
                  <Text
                    className="mt-0.5 text-xs text-white/85"
                    numberOfLines={1}
                  >
                    {phone ?? "—"}
                  </Text>
                  <Text className="mt-0.5 text-[10px] font-semibold text-white/55">
                    Long-press to copy
                  </Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={() => setDetailsOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit profile details"
              className="rounded-full bg-white/15 px-3 py-1.5 active:opacity-80"
              hitSlop={6}
            >
              <View className="flex-row items-center gap-1">
                <Ionicons name="create-outline" size={12} color="#ffffff" />
                <Text className="text-[11px] font-bold text-white">Edit</Text>
              </View>
            </Pressable>
          </View>

          {profile?.email?.trim() ? (
            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons name="mail-outline" size={13} color="rgba(255,255,255,0.75)" />
              <Text className="text-xs text-white/85" numberOfLines={1}>
                {profile.email.trim()}
              </Text>
            </View>
          ) : null}

          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="ribbon" size={12} color="#ffd500" />
            <Text className="text-[11px] font-semibold text-white/90">
              {memberLine}
            </Text>
            <Text className="text-white/40">·</Text>
            <Text className="text-[11px] font-semibold text-white/75">
              {roleLabel} account
            </Text>
          </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          className="mt-6 flex-row gap-2.5"
        >
          <PremiumStatCard
            label="Bookings"
            value={bookingStats.total}
            icon="calendar"
            accent="blue"
          />
          <PremiumStatCard
            label="Completed"
            value={bookingStats.completed}
            icon="checkmark-done"
            accent="green"
          />
          <PremiumStatCard
            label="Addresses"
            value={addressCount}
            icon="location"
            accent="gold"
          />
        </Animated.View>

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
              <Text className="text-xs font-bold text-accent">Edit all</Text>
            </Pressable>
          </View>
          <View className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
            <InfoRow
              icon="person-outline"
              label="Full name"
              value={displayValue(profile?.name, "Add your name")}
              muted={!profile?.name?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              icon="call-outline"
              label="Mobile"
              value={phone ?? "—"}
              hint="Long-press to copy"
              onPress={copyPhone}
              onLongPress={copyPhone}
            />
            <InfoHairline />
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={displayValue(profile?.email)}
              muted={!profile?.email?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              icon="gift-outline"
              label="Birthday"
              value={displayValue(profile?.birthday)}
              muted={!profile?.birthday?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              icon="heart-outline"
              label="Anniversary"
              value={displayValue(profile?.anniversary)}
              muted={!profile?.anniversary?.trim()}
              onPress={() => setDetailsOpen(true)}
            />
            <InfoHairline />
            <InfoRow
              icon="chatbubble-ellipses-outline"
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
          <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <View className="px-4 pb-4 pt-4">
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
                  <Ionicons name="person-circle-outline" size={18} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-neutral-900">
                    How you use InstaHelp
                  </Text>
                  <Text className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                    Personal vs business changes the kind of suggestions you see.
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
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
              <Text className="mt-2 text-[11px] leading-4 text-neutral-500">
                Business gets occasional local opportunity-style alerts tuned for vendors.
              </Text>
            </View>

            <View className="h-px bg-neutral-100" />

            <View className="px-4 pb-4 pt-4">
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0f172a" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-neutral-900">Reach me on</Text>
                  <Text className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                    Saved on this device so your concierge follows up the way you prefer.
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {(
                  [
                    { id: "whatsapp" as const, label: "WhatsApp", icon: "logo-whatsapp" },
                    { id: "call" as const, label: "Phone call", icon: "call-outline" },
                    { id: "either" as const, label: "Either", icon: "shuffle-outline" },
                  ] as const
                ).map((opt) => {
                  const on = preferredContact === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => void updatePreferredContact(opt.id)}
                      className={`flex-row items-center gap-2 rounded-full px-4 py-2 active:opacity-90 ${
                        on ? "border border-accent/30 bg-accent-soft" : "border border-neutral-200 bg-white"
                      }`}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={14}
                        color={opt.id === "whatsapp" ? "#128C7E" : "#334155"}
                      />
                      <Text className="text-xs font-bold text-neutral-800">{opt.label}</Text>
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
          <View className="overflow-hidden rounded-2xl bg-neutral-50">
            <ActionRow
              icon="calendar-outline"
              title="Book a service"
              subtitle="Home screen & discovery"
              onPress={() => router.push("/(tabs)")}
            />
            <RowHairline />
            <ActionRow
              icon="gift-outline"
              title="Gift cards"
              subtitle="Brands, wallet, Hubble checkout"
              onPress={() => router.push("/(tabs)/giftcards")}
            />
            <RowHairline />
            <ActionRow
              icon="briefcase-outline"
              title="Register as vendor"
              subtitle="Share business details for onboarding"
              onPress={() => setVendorOpen(true)}
            />
            <RowHairline />
            <ActionRow
              icon="time"
              title="Booking history"
              subtitle={`${bookingStats.total} request${bookingStats.total === 1 ? "" : "s"} on this device`}
              onPress={() => router.push("/(tabs)/bookings")}
            />
            <RowHairline />
            <ActionRow
              icon="help-circle"
              title="Help & support"
              subtitle="FAQ, WhatsApp, website, app info"
              onPress={() => router.push("/support")}
            />
            <RowHairline />
            <ActionRow
              icon="logo-whatsapp"
              title="Concierge"
              subtitle="WhatsApp support"
              iconTone="whatsapp"
              onPress={() => openWhatsApp()}
            />
            <RowHairline />
            <ActionRow
              icon="navigate"
              title="Add location"
              subtitle={
                detecting || savingLocation
                  ? "Detecting…"
                  : "Save where you are now"
              }
              loading={detecting || savingLocation}
              onPress={addCurrentLocation}
            />
            <RowHairline />
            <ActionRow
              icon="share-social"
              title="Refer a friend"
              subtitle="Share InstaHelp"
              onPress={shareApp}
            />
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
          <View className="overflow-hidden rounded-2xl bg-neutral-50">
            {(profile?.addresses ?? []).length === 0 ? (
              <View className="items-center px-5 py-8">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#7C3AED"
                  />
                </View>
                <Text className="mt-3 text-center text-sm font-semibold text-neutral-800">
                  No addresses yet
                </Text>
                <Text className="mt-1 max-w-[260px] text-center text-xs leading-5 text-neutral-500">
                  Use Add location in Quick actions to save your current spot.
                </Text>
              </View>
            ) : (
              (profile?.addresses ?? []).map((a, i, arr) => (
                <View key={a.id}>
                  <View className="flex-row items-start gap-3 px-4 py-4">
                    <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
                      <Ionicons name="location" size={16} color="#7C3AED" />
                    </View>
                    <View className="min-w-0 flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text
                          className="text-sm font-bold text-neutral-900"
                          numberOfLines={1}
                        >
                          {a.label}
                        </Text>
                        {i === 0 ? (
                          <Text className="text-[10px] font-bold uppercase tracking-wider text-accent">
                            Default
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        className="mt-1 text-sm leading-5 text-neutral-600"
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
                      className="mt-0.5 rounded-full p-2 active:bg-neutral-200/60"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#a3a3a3"
                      />
                    </Pressable>
                  </View>
                  {i < arr.length - 1 ? (
                    <View className="ml-[52px] mr-4 h-px bg-neutral-200/90" />
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
          <Text className="mb-3 text-xs leading-5 text-neutral-500">
            We use these for smarter local alerts and quicker re-booking.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FAVORITES.map((f) => {
              const on = profile?.favorites.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => toggleFavorite(f.id)}
                  className={`flex-row items-center gap-2 rounded-full px-4 py-2.5 active:opacity-90 ${
                    on
                      ? "bg-accent shadow-sm"
                      : "bg-neutral-100"
                  }`}
                >
                  <Ionicons
                    name={f.icon}
                    size={14}
                    color={on ? "#ffffff" : "#525252"}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      on ? "text-accent-foreground" : "text-neutral-600"
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
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Settings
          </Text>
          <View className="overflow-hidden rounded-2xl bg-neutral-50">
            <SettingsRow
              icon="document-text-outline"
              label="Privacy policy"
              onPress={() => openLegal(LEGAL_PRIVACY_URL)}
            />
            <SettingsHairline />
            <SettingsRow
              icon="reader-outline"
              label="Terms of use"
              onPress={() => openLegal(LEGAL_TERMS_URL)}
            />
            <SettingsHairline />
            <SettingsRow
              icon="notifications-outline"
              label="Notifications"
              value="System"
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
            />
            <SettingsHairline />
            <SettingsRow
              icon="chatbox-ellipses-outline"
              label="Send feedback"
              onPress={() =>
                openWhatsApp(
                  `InstaHelp app feedback (v${APP_VERSION}, ${Platform.OS}): `,
                )
              }
            />
            <SettingsHairline />
            <SettingsRow
              icon="information-circle-outline"
              label="About & help center"
              value={`v${APP_VERSION}`}
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
            className="flex-row items-center gap-2 py-2 active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={18} color="#b91c1c" />
            <Text className="text-sm font-semibold text-red-700">Sign out</Text>
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
  return <View className="ml-14 mr-4 h-px bg-neutral-100" />;
}

function InfoRow({
  icon,
  label,
  value,
  hint,
  muted,
  onPress,
  onLongPress,
  last,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  hint?: string;
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
      className={`flex-row items-center gap-3 px-4 py-3.5 ${
        interactive ? "active:bg-neutral-50" : ""
      } ${last ? "" : ""}`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
        <Ionicons name={icon} size={17} color="#525252" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          {label}
        </Text>
        <Text
          className={`mt-0.5 text-[15px] font-semibold ${
            muted ? "text-neutral-400" : "text-neutral-900"
          }`}
          numberOfLines={2}
        >
          {value}
        </Text>
        {hint ? (
          <Text className="mt-0.5 text-[10px] text-neutral-400">{hint}</Text>
        ) : null}
      </View>
      {interactive ? (
        <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
      ) : null}
    </Pressable>
  );
}

function PremiumStatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: IoniconName;
  accent: "blue" | "gold" | "green";
}) {
  const tones = {
    blue: {
      bg: "bg-accent-soft",
      icon: "#7C3AED",
      ring: "border-accent-tint/60",
    },
    gold: {
      bg: "bg-brand-gold/15",
      icon: "#b8860b",
      ring: "border-brand-gold/30",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "#059669",
      ring: "border-emerald-200/80",
    },
  }[accent];

  return (
    <View
      className={`min-w-0 flex-1 rounded-2xl border bg-white px-3 py-3.5 shadow-sm ${tones.ring}`}
    >
      <View
        className={`h-8 w-8 items-center justify-center rounded-xl ${tones.bg}`}
      >
        <Ionicons name={icon} size={16} color={tones.icon} />
      </View>
      <Text className="mt-2.5 text-2xl font-extrabold tabular-nums text-neutral-900">
        {value}
      </Text>
      <Text className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </Text>
    </View>
  );
}

function RowHairline() {
  return <View className="ml-4 h-px bg-neutral-200/90" />;
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  iconTone = "default",
  loading,
}: {
  icon: IoniconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconTone?: "default" | "whatsapp";
  loading?: boolean;
}) {
  const isWhatsApp = iconTone === "whatsapp";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      className={`flex-row items-center gap-3.5 px-4 py-3.5 active:bg-neutral-200/40 ${
        loading ? "opacity-70" : ""
      }`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isWhatsApp ? "bg-[#25D366]/12" : "bg-accent-soft"
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <Ionicons
            name={icon}
            size={18}
            color={isWhatsApp ? "#128C7E" : "#7C3AED"}
          />
        )}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold text-neutral-900" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-neutral-500" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
    </Pressable>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: IoniconName;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-200/40 ${
        last ? "" : ""
      }`}
    >
      <Ionicons name={icon} size={20} color="#737373" />
      <Text className="flex-1 text-[15px] font-semibold text-neutral-900">
        {label}
      </Text>
      {value ? (
        <Text className="text-xs font-medium text-neutral-500">{value}</Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
    </Pressable>
  );
}

function SettingsHairline() {
  return <View className="ml-12 mr-4 h-px bg-neutral-200/90" />;
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
        className="flex-1 items-center justify-end bg-black/40"
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
                className={`flex-1 rounded-2xl bg-accent py-3.5 active:opacity-90 ${
                  saving ? "opacity-70" : ""
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-sm font-bold text-accent-foreground">
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
        className="flex-1 items-center justify-end bg-black/40"
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
                            ? "border border-accent/30 bg-accent-soft"
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
                            ? "bg-accent"
                            : "border border-neutral-200 bg-neutral-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            on ? "text-accent-foreground" : "text-neutral-700"
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
                className={`flex-1 rounded-2xl bg-accent py-3.5 active:opacity-90 ${
                  saving ? "opacity-70" : ""
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-sm font-bold text-accent-foreground">
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
