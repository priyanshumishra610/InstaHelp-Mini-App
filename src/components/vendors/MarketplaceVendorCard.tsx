import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { GlowButton } from "@/components/ui/GlowButton";
import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import {
  formatStartingPrice,
  serviceDescriptionPreview,
} from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay } from "@/utils/vendorPhone";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { ACCENT, ACCENT_TINT } from "@/constants/theme";
import { MotiView } from "moti";
import { Image, StyleSheet, Text, View } from "react-native";
import { memo } from "react";

type Props = {
  vendor: VendorRecord;
  distanceKm: number | null;
  unlocked: boolean;
  revealCostLabel?: string;
  onPressCard: () => void;
  onReveal: () => void;
  index?: number;
};

/** Flat premium row — no nested glass cards. */
function MarketplaceVendorCardInner({
  vendor,
  distanceKm,
  unlocked,
  revealCostLabel,
  onPressCard,
  onReveal,
  index = 0,
}: Props) {
  const revealLabel =
    revealCostLabel ?? `${VENDOR_REVEAL_CREDIT_COST} Credits`;
  const title = vendorDisplayName(vendor);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ratingLabel =
    vendor.rating > 0 ? vendor.rating.toFixed(1) : "New";
  const reviewLabel =
    vendor.reviewCount > 0
      ? `${vendor.reviewCount.toLocaleString("en-IN")} reviews`
      : "No reviews yet";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320, delay: index * 30 }}
    >
      <AnimatedPressable
        onPress={onPressCard}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        style={styles.rowPress}
      >
        {vendor.profileImageUrl?.startsWith("http") ? (
          <Image
            source={{ uri: vendor.profileImageUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={[styles.avatarText, { fontFamily: AUTH_FONT.bold }]}>
              {initials || "IH"}
            </Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { fontFamily: AUTH_FONT.bold }]}
              numberOfLines={2}
            >
              {title}
            </Text>
            <SaveVendorButton vendorId={vendor.id} size={15} />
          </View>

          <Text style={[styles.meta, { fontFamily: AUTH_FONT.medium }]}>
            {vendor.isVerified ? "Verified · " : ""}
            {vendor.category}
            {" · "}
            <Text style={styles.rating}>{ratingLabel}</Text>
            {" · "}
            {reviewLabel}
          </Text>

          <Text
            style={[styles.location, { fontFamily: AUTH_FONT.regular }]}
            numberOfLines={1}
          >
            {vendor.areaLabel}
            {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ""}
          </Text>

          <Text
            style={[styles.preview, { fontFamily: AUTH_FONT.regular }]}
            numberOfLines={2}
          >
            {serviceDescriptionPreview(vendor)}
          </Text>
        </View>

        <Text style={[styles.price, { fontFamily: AUTH_FONT.bold }]}>
          {formatStartingPrice(vendor)}
        </Text>
      </AnimatedPressable>

      {!unlocked ? (
        <View style={styles.revealBlock}>
          <Text style={[styles.maskedPhone, { fontFamily: AUTH_FONT.medium }]}>
            {maskPhoneForDisplay(vendor.phone)}
          </Text>
          <GlowButton
            label={`Reveal · ${revealLabel}`}
            onPress={onReveal}
            variant="primary"
            accessibilityLabel={`Reveal contact for ${title}`}
          />
        </View>
      ) : (
        <AnimatedPressable onPress={onPressCard} style={styles.unlockedRow}>
          <Text style={[styles.unlockedText, { fontFamily: AUTH_FONT.semibold }]}>
            Unlocked · call & WhatsApp
          </Text>
          <Text style={styles.unlockedArrow}>→</Text>
        </AnimatedPressable>
      )}

      <View style={styles.hairline} />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  rowPress: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    color: AUTH_PRIMARY,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: "#111827",
    letterSpacing: -0.2,
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
  },
  rating: {
    color: ACCENT,
    fontWeight: "700",
  },
  location: {
    marginTop: 4,
    fontSize: 11,
    color: "#9CA3AF",
  },
  preview: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: "#9CA3AF",
  },
  price: {
    fontSize: 14,
    color: "#111827",
    letterSpacing: -0.2,
    paddingTop: 2,
  },
  revealBlock: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 10,
  },
  maskedPhone: {
    fontSize: 12,
    letterSpacing: 1,
    color: "#9CA3AF",
    fontVariant: ["tabular-nums"],
  },
  unlockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  unlockedText: {
    fontSize: 13,
    color: ACCENT,
  },
  unlockedArrow: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  hairline: {
    marginLeft: 20,
    marginRight: 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,74,173,0.08)",
  },
});

export const MarketplaceVendorCard = memo(MarketplaceVendorCardInner);
