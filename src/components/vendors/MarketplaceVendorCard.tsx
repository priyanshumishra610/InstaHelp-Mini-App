import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import {
  formatStartingPrice,
  serviceDescriptionPreview,
} from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay } from "@/utils/vendorPhone";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { memo } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type Props = {
  vendor: VendorRecord;
  index: number;
  distanceKm: number | null;
  unlocked: boolean;
  onPressCard: () => void;
  onReveal: () => void;
};

function MarketplaceVendorCardInner({
  vendor,
  index,
  distanceKm,
  unlocked,
  onPressCard,
  onReveal,
}: Props) {
  const title = vendorDisplayName(vendor);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ratingLabel =
    vendor.rating > 0 ? vendor.rating.toFixed(1) : "New on InstaHelp";
  const reviewLabel =
    vendor.reviewCount > 0
      ? `${vendor.reviewCount.toLocaleString("en-IN")} reviews`
      : "No reviews yet";

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 22, 220)).duration(380)}>
      <View
        className="mb-4 overflow-hidden rounded-[22px] border border-white bg-white"
        style={
          Platform.OS === "ios"
            ? {
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.09,
                shadowRadius: 20,
              }
            : { elevation: 5 }
        }
      >
        <Pressable
          onPress={onPressCard}
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}`}
          className="active:opacity-95"
        >
          <View className="flex-row gap-3 p-4">
            {vendor.profileImageUrl?.startsWith("http") ? (
              <Image
                source={{ uri: vendor.profileImageUrl }}
                className="h-16 w-16 rounded-2xl bg-neutral-100"
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={["#004aad", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-16 w-16 items-center justify-center rounded-2xl"
              >
                <Text className="text-lg font-extrabold text-white">
                  {initials || "IH"}
                </Text>
              </LinearGradient>
            )}

            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text
                  className="flex-1 text-[16px] font-extrabold text-neutral-900"
                  numberOfLines={2}
                >
                  {title}
                </Text>
                {vendor.isVerified ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-accent-soft px-2 py-1">
                    <Ionicons name="shield-checkmark" size={12} color="#004aad" />
                    <Text className="text-[10px] font-extrabold uppercase tracking-wide text-accent">
                      Verified
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="mt-2 flex-row flex-wrap items-center gap-x-2 gap-y-1">
                <View className="rounded-full bg-neutral-100 px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-neutral-700">
                    {vendor.category}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={12} color="#ffd500" />
                  <Text className="text-[12px] font-bold text-neutral-800">
                    {ratingLabel}
                  </Text>
                  <Text className="text-[11px] font-semibold text-neutral-400">
                    · {reviewLabel}
                  </Text>
                </View>
              </View>

              <View className="mt-2 flex-row flex-wrap items-center gap-x-2 gap-y-1">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color="#004aad" />
                  <Text className="text-[12px] font-semibold text-neutral-700">
                    {vendor.areaLabel}
                    {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ""}
                  </Text>
                </View>
                <Text className="text-[12px] font-extrabold text-accent-deep">
                  {formatStartingPrice(vendor)}
                </Text>
              </View>

              <Text
                className="mt-2 text-[12px] leading-[17px] text-neutral-600"
                numberOfLines={2}
              >
                {serviceDescriptionPreview(vendor)}
              </Text>
            </View>
          </View>
        </Pressable>

        {!unlocked ? (
          <View className="relative overflow-hidden border-t border-neutral-100">
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(0,74,173,0.16)", "rgba(255,255,255,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <View className="flex-row items-center justify-between px-4 py-2.5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="lock-closed" size={16} color="#004aad" />
                <Text className="font-mono text-[14px] font-extrabold tracking-wider text-neutral-800">
                  {maskPhoneForDisplay(vendor.phone)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onReveal}
              accessibilityRole="button"
              accessibilityLabel={`Reveal contact for ${title}`}
              className="border-t border-white/40"
            >
              <LinearGradient
                colors={["#003a85", "#004aad"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-row items-center justify-center gap-2 py-3"
              >
                <Ionicons name="flash" size={16} color="#ffd500" />
                <Text className="text-[13px] font-extrabold text-white">
                  Reveal Contact · {VENDOR_REVEAL_CREDIT_COST} Credits
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onPressCard}
            className="border-t border-neutral-100 bg-status-doneBg px-4 py-3 active:opacity-90"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-done" size={18} color="#065f46" />
                <Text className="text-[13px] font-extrabold text-status-doneFg">
                  Unlocked · open for call & WhatsApp
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#065f46" />
            </View>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export const MarketplaceVendorCard = memo(MarketplaceVendorCardInner);
