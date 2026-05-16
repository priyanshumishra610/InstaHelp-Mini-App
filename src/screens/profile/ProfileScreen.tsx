import {
  APP_VERSION,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "@/constants/appInfo";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { persistProfile } from "@/services/profileService";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useProfileStore } from "@/store/profileStore";
import type { Booking } from "@/types/booking";
import type {
  ProfilePreferredContact,
  SavedAddress,
  UserProfile,
} from "@/types/user";
import { openWhatsApp } from "@/utils/whatsapp";
import { pickOptionalImage } from "@/utils/pickOptionalImage";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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

function hasRealSavedAddress(profile: UserProfile | null | undefined) {
  return (profile?.addresses ?? []).some(
    (a) =>
      Boolean(a.line?.trim()) &&
      !a.line.includes(PLACEHOLDER_ADDRESS),
  );
}

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

export function ProfileScreen() {
  const router = useRouter();
  const signOut = useSignOut();
  const phone = useAuthPhone();
  const { data: profile } = useProfileQuery();
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite);
  const upsertAddress = useProfileStore((s) => s.upsertAddress);
  const removeAddress = useProfileStore((s) => s.removeAddress);
  const setProfileLocal = useProfileStore((s) => s.setProfile);
  const bookings = useMergedBookings();

  const initial = (
    profile?.name?.trim()?.[0] ||
    phone?.replace(/\D/g, "")?.slice(-1) ||
    "?"
  )
    .toString()
    .toUpperCase();

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const active = total - completed;
    return { total, active, completed };
  }, [bookings]);

  const memberLine = useMemo(() => memberSince(bookings), [bookings]);

  const completion = useMemo(() => {
    const hasName = !!profile?.name?.trim();
    const hasAddress = hasRealSavedAddress(profile);
    const hasFav = (profile?.favorites ?? []).length > 0;
    const filled = [hasName, hasAddress, hasFav].filter(Boolean).length;
    return Math.round((filled / 3) * 100);
  }, [profile]);

  const ratedCount = useMemo(
    () => bookings.filter((b) => b.rating).length,
    [bookings],
  );

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

  const {
    isLoading: detecting,
    refresh: detectLocation,
  } = useDeviceAddress({ autoFetch: false });
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const favoritesLayoutY = useRef(0);

  const persistIfWeCan = async (next: UserProfile) => {
    setProfileLocal(next);
    if (phone) await persistProfile(next).catch(() => {});
  };

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

  const saveName = async (nextName: string) => {
    if (!profile || !phone) return;
    const updated: UserProfile = { ...profile, name: nextName.trim() };
    await persistIfWeCan(updated);
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

  const displayName = profile?.name?.trim() || "Add your name";

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(380)} className="pt-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep">
            Profile
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-neutral-900">
            Your account
          </Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Addresses, history, and concierge support.
          </Text>
        </Animated.View>

        {/* HERO */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(60)}
          className="mt-6 overflow-hidden rounded-[28px] bg-accent p-6 shadow-sm"
        >
          <View
            pointerEvents="none"
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-blue"
          />
          <View
            pointerEvents="none"
            className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-accent-deep/40"
          />

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
                    <View className="h-full w-full items-center justify-center">
                      <Text className="text-[28px] font-extrabold text-white">
                        {initial}
                      </Text>
                    </View>
                  )}
                  {savingAvatar ? (
                    <View className="absolute inset-0 items-center justify-center bg-black/40">
                      <ActivityIndicator color="#ffffff" size="small" />
                    </View>
                  ) : null}
                </View>
                <View className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white/50 bg-white p-1.5 shadow-sm">
                  <Ionicons name="camera" size={14} color="#004aad" />
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
              onPress={() => setEditOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              className="rounded-full bg-white/15 px-3 py-1.5 active:opacity-80"
              hitSlop={6}
            >
              <View className="flex-row items-center gap-1">
                <Ionicons name="create-outline" size={12} color="#ffffff" />
                <Text className="text-[11px] font-bold text-white">Edit</Text>
              </View>
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="ribbon" size={12} color="#ffd500" />
              <Text className="text-[11px] font-semibold text-white/90">
                {memberLine}
              </Text>
            </View>
            {completion < 100 ? (
              <View className="flex-row items-center gap-2">
                <View className="h-1 w-16 overflow-hidden rounded-full bg-white/20">
                  <View
                    style={{ width: `${completion}%` }}
                    className="h-full rounded-full bg-brand-gold"
                  />
                </View>
                <Text className="text-[10px] font-bold text-white/90">
                  {completion}%
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark" size={12} color="#ffd500" />
                <Text className="text-[10px] font-bold text-white">
                  Complete
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* STATS — single strip, no triple card chrome */}
        <Animated.View
          entering={FadeInUp.duration(420).delay(120)}
          className="mt-5 overflow-hidden rounded-2xl bg-neutral-50 py-4"
        >
          <View className="flex-row items-stretch">
            <StatStripCell label="Requests" value={stats.total} icon="receipt" />
            <StatDivider />
            <StatStripCell label="Active" value={stats.active} icon="pulse" />
            <StatDivider />
            <StatStripCell
              label="Done"
              value={stats.completed}
              icon="checkmark-done"
            />
          </View>
        </Animated.View>

        {stats.total > 0 ? (
          <Animated.View
            entering={FadeInUp.duration(400).delay(140)}
            className="mt-4 flex-row items-start gap-3 rounded-2xl border border-accent-tint/90 bg-accent-soft/50 px-4 py-3.5"
          >
            <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
              <Ionicons name="analytics-outline" size={18} color="#004aad" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-deep">
                Your activity
              </Text>
              <Text className="mt-1 text-[13px] leading-[19px] text-neutral-800">
                {stats.completed === stats.total ? (
                  <>
                    You&apos;ve completed all {stats.total} request
                    {stats.total === 1 ? "" : "s"} so far.
                  </>
                ) : (
                  <>
                    {stats.active} active, {stats.completed} completed,{" "}
                    {stats.total} total.
                  </>
                )}{" "}
                {ratedCount > 0 ? (
                  <Text className="font-semibold text-neutral-900">
                    {ratedCount} rated — thanks for the feedback.
                  </Text>
                ) : stats.completed > 0 ? (
                  <Text className="text-neutral-600">
                    Rate finished jobs from Activity to help us improve.
                  </Text>
                ) : null}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInUp.duration(400).delay(160)}
          className="mt-6"
        >
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Finish your profile
          </Text>
          <View className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white">
            <ProfileChecklistRow
              icon="person"
              title="Add your name"
              subtitle="Used on bookings and WhatsApp"
              done={!!profile?.name?.trim()}
              onPress={() => setEditOpen(true)}
            />
            <View className="ml-14 mr-4 h-px bg-neutral-100" />
            <ProfileChecklistRow
              icon="home"
              title="Save a real address"
              subtitle="Skip typing it on every request"
              done={hasRealSavedAddress(profile)}
              onPress={() => void addCurrentLocation()}
            />
            <View className="ml-14 mr-4 h-px bg-neutral-100" />
            <ProfileChecklistRow
              icon="heart"
              title="Pick favorite services"
              subtitle="Better alerts & recommendations"
              done={(profile?.favorites?.length ?? 0) > 0}
              onPress={() => {
                scrollRef.current?.scrollTo({
                  y: Math.max(0, favoritesLayoutY.current - 24),
                  animated: true,
                });
              }}
            />
          </View>
          <Text className="mt-2 px-1 text-[11px] text-neutral-400">
            Favorite chips are below — tap any to start.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(190)}
          className="mt-8"
        >
          <Text className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Account & preferences
          </Text>
          <View className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white px-4 py-4">
            <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              How you use InstaHelp
            </Text>
            <View className="mt-3 flex-row rounded-2xl bg-neutral-100 p-1">
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
                    className={`flex-1 rounded-xl py-2.5 ${
                      on ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`text-center text-[13px] font-bold ${
                        on ? "text-accent" : "text-neutral-500"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-2 text-[11px] leading-4 text-neutral-500">
              Business gets occasional local opportunity-style alerts tuned for
              vendors.
            </Text>

            <Text className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Reach me on
            </Text>
            <View className="flex-row flex-wrap gap-2">
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
                    className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${
                      on
                        ? "bg-accent shadow-sm"
                        : "border border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={on ? "#ffffff" : "#525252"}
                    />
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
            <Text className="mt-2 text-[11px] leading-4 text-neutral-500">
              Lets your concierge know how you like follow-ups saved on this
              device.
            </Text>
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
              icon="time"
              title="Booking history"
              subtitle="Every request you have made"
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
                    color="#004aad"
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
                      <Ionicons name="location" size={16} color="#004aad" />
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
          onLayout={(e) => {
            favoritesLayoutY.current = e.nativeEvent.layout.y;
          }}
        >
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Favorites
            </Text>
            <Text className="text-[11px] font-semibold text-neutral-400">
              Tap to toggle
            </Text>
          </View>
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

      <EditNameModal
        open={editOpen}
        initialName={profile?.name ?? ""}
        onClose={() => setEditOpen(false)}
        onSave={async (n) => {
          await saveName(n);
          setEditOpen(false);
        }}
      />
    </Screen>
  );
}

function ProfileChecklistRow({
  icon,
  title,
  subtitle,
  done,
  onPress,
}: {
  icon: IoniconName;
  title: string;
  subtitle: string;
  done: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-50"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          done ? "bg-emerald-100" : "bg-accent-soft"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={done ? "#059669" : "#004aad"}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className={`text-[15px] font-bold ${
            done ? "text-neutral-600" : "text-neutral-900"
          }`}
        >
          {title}
        </Text>
        <Text
          className={`mt-0.5 text-xs ${done ? "text-neutral-400" : "text-neutral-500"}`}
        >
          {subtitle}
        </Text>
      </View>
      {done ? (
        <Ionicons name="checkmark-circle" size={22} color="#10b981" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
      )}
    </Pressable>
  );
}

function StatStripCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: IoniconName;
}) {
  return (
    <View className="min-w-0 flex-1 items-center px-1 py-0.5">
      <Ionicons name={icon} size={13} color="#737373" />
      <Text className="mt-1.5 text-2xl font-extrabold tabular-nums text-neutral-900">
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </Text>
    </View>
  );
}

function StatDivider() {
  return <View className="my-2 w-px self-stretch bg-neutral-200/90" />;
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
          <ActivityIndicator size="small" color="#004aad" />
        ) : (
          <Ionicons
            name={icon}
            size={18}
            color={isWhatsApp ? "#128C7E" : "#004aad"}
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

function EditNameModal({
  open,
  initialName,
  onClose,
  onSave,
}: {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const save = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("Name too short", "Use at least two characters.");
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
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
          >
            <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
            <Text className="text-base font-extrabold text-neutral-900">
              Edit your name
            </Text>
            <Text className="mt-1 text-xs text-neutral-500">
              We use it on every booking so vendors greet you correctly.
            </Text>
            <View className="mt-4">
              <Input
                autoFocus
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={save}
              />
            </View>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={onClose}
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
                accessibilityLabel="Save name"
                className={`flex-1 rounded-2xl bg-neutral-900 py-3.5 active:opacity-90 ${
                  saving ? "opacity-70" : ""
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-sm font-bold text-white">
                    Save
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
