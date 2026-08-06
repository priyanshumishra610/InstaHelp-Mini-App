import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { cardShadow, RADIUS } from "@/constants/designSystem";
import { MotiView } from "moti";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

type Props = {
  displayName: string;
  phone: string | null;
  email?: string | null;
  memberLine: string;
  roleLabel: string;
  avatarUri?: string | null;
  fallbackAvatarUri: string;
  savingAvatar: boolean;
  onAvatarPress: () => void;
  onEditPress: () => void;
  onCopyPhone: () => void;
};

export function ProfileHeroSection({
  displayName,
  phone,
  email,
  memberLine,
  roleLabel,
  avatarUri,
  fallbackAvatarUri,
  savingAvatar,
  onAvatarPress,
  onEditPress,
  onCopyPhone,
}: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: 40 }}
      className="mt-5"
    >
      <View className="flex-row items-center gap-4">
        <AnimatedPressable
          onPress={onAvatarPress}
          disabled={savingAvatar}
          accessibilityRole="button"
          accessibilityLabel="Profile photo"
          scaleTo={0.97}
        >
          <View className="h-[72px] w-[72px] overflow-hidden rounded-full bg-neutral-100">
            <Image
              source={{ uri: avatarUri?.trim() ? avatarUri : fallbackAvatarUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
            {savingAvatar ? (
              <View className="absolute inset-0 items-center justify-center bg-black/25">
                <ActivityIndicator color="#ffffff" size="small" />
              </View>
            ) : null}
          </View>
        </AnimatedPressable>

        <View className="min-w-0 flex-1">
          <Text
            className="text-xl font-bold tracking-tight text-neutral-900"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Pressable
            onLongPress={onCopyPhone}
            delayLongPress={400}
            accessibilityRole="button"
            accessibilityLabel="Phone number, long press to copy"
            hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
          >
            <Text className="mt-0.5 text-sm text-neutral-500" numberOfLines={1}>
              {phone ?? "—"}
            </Text>
          </Pressable>
          {email?.trim() ? (
            <Text className="mt-0.5 text-sm text-neutral-500" numberOfLines={1}>
              {email.trim()}
            </Text>
          ) : null}
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <Text className="text-xs text-neutral-400">{memberLine}</Text>
            <Text className="text-xs text-neutral-300">·</Text>
            <Text className="text-xs text-neutral-400">{roleLabel}</Text>
          </View>
        </View>

        <Pressable
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
          className="rounded-full px-3 py-1.5 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-neutral-900">Edit</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

export function ProfileStatsRow({
  bookings,
  completed,
  addresses,
}: {
  bookings: number;
  completed: number;
  addresses: number;
}) {
  const stats = [
    { label: "Bookings", value: bookings },
    { label: "Completed", value: completed },
    { label: "Addresses", value: addresses },
  ];

  return (
    <View
      className="mt-6 flex-row overflow-hidden rounded-2xl border border-neutral-100 bg-white"
      style={{ borderRadius: RADIUS.lg, ...cardShadow("sm") }}
    >
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          className={`min-w-0 flex-1 items-center py-4 ${
            index > 0 ? "border-l border-neutral-100" : ""
          }`}
        >
          <Text className="text-2xl font-bold tabular-nums text-neutral-900">
            {stat.value}
          </Text>
          <Text className="mt-1 text-xs text-neutral-400">{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProfileSettingsCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View
      className="overflow-hidden rounded-3xl border border-neutral-100 bg-white"
      style={cardShadow("card")}
    >
      <View className="border-b border-neutral-50 px-4 py-3">
        <Text className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
