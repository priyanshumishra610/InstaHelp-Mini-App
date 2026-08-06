import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { GlowButton } from "@/components/ui/GlowButton";
import { glassCardStyle } from "@/components/ui/GlassSurface";
import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import {
  formatStartingPrice,
  serviceDescriptionPreview,
} from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay } from "@/utils/vendorPhone";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { COLORS, RADIUS, SPACE } from "@/constants/designSystem";
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
  glass?: boolean;
};

/** Premium vendor row — identity, proof, place, price in a clear scan order. */
function MarketplaceVendorCardInner({
  vendor,
  distanceKm,
  unlocked,
  revealCostLabel,
  onPressCard,
  onReveal,
  index = 0,
  glass = false,
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
      ? `${vendor.reviewCount.toLocaleString("en-IN")}`
      : null;
  const priceLabel = formatStartingPrice(vendor);
  const preview = serviceDescriptionPreview(vendor, 90);

  const content = (
    <>
      <AnimatedPressable
        onPress={onPressCard}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        haptic
        scaleTo={0.98}
        style={styles.rowPress}
      >
        {vendor.profileImageUrl?.startsWith("http") ? (
          <MotiView
            from={{ scale: 0.92, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, delay: index * 35 + 60 }}
          >
            <Image
              source={{ uri: vendor.profileImageUrl }}
              style={[styles.avatarImage, glass && styles.avatarImageGlass]}
              resizeMode="cover"
            />
          </MotiView>
        ) : (
          <MotiView
            from={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 18, delay: index * 35 + 60 }}
          >
            <View
              style={[
                styles.avatarFallback,
                glass && styles.avatarFallbackGlass,
              ]}
            >
              <Text style={[styles.avatarText, { fontFamily: AUTH_FONT.bold }]}>
                {initials || "IH"}
              </Text>
            </View>
          </MotiView>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { fontFamily: AUTH_FONT.bold }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <SaveVendorButton vendorId={vendor.id} size={15} />
          </View>

          <View style={styles.proofRow}>
            {vendor.isVerified ? (
              <View style={[styles.chip, styles.chipVerified]}>
                <AppIcon name="shield" size={11} color={COLORS.success} />
                <Text
                  style={[
                    styles.chipText,
                    styles.chipTextVerified,
                    { fontFamily: AUTH_FONT.semibold },
                  ]}
                >
                  Verified
                </Text>
              </View>
            ) : null}
            <View style={styles.chip}>
              <AppIcon name="star" size={11} color={ACCENT} />
              <Text style={[styles.chipText, { fontFamily: AUTH_FONT.semibold }]}>
                {ratingLabel}
              </Text>
              {reviewLabel ? (
                <Text style={[styles.chipMuted, { fontFamily: AUTH_FONT.medium }]}>
                  ({reviewLabel})
                </Text>
              ) : null}
            </View>
            <Text
              style={[styles.categoryInline, { fontFamily: AUTH_FONT.medium }]}
              numberOfLines={1}
            >
              {vendor.category}
            </Text>
          </View>

          <View style={styles.placeRow}>
            <AppIcon name="location" size={12} color={COLORS.inkSubtle} />
            <Text
              style={[styles.location, { fontFamily: AUTH_FONT.regular }]}
              numberOfLines={1}
            >
              {vendor.areaLabel}
            </Text>
            {distanceKm != null ? (
              <Text style={[styles.distance, { fontFamily: AUTH_FONT.semibold }]}>
                {distanceKm.toFixed(1)} km
              </Text>
            ) : null}
          </View>

          <Text
            style={[styles.preview, { fontFamily: AUTH_FONT.regular }]}
            numberOfLines={2}
          >
            {preview}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { fontFamily: AUTH_FONT.bold }]}>
              {priceLabel}
            </Text>
            {unlocked ? (
              <Text style={[styles.priceHint, { fontFamily: AUTH_FONT.medium }]}>
                Contact unlocked
              </Text>
            ) : (
              <Text style={[styles.priceHint, { fontFamily: AUTH_FONT.medium }]}>
                Starting rate
              </Text>
            )}
          </View>
        </View>
      </AnimatedPressable>

      {!unlocked ? (
        <View style={styles.revealBlock}>
          <View style={styles.revealMeta}>
            <Text style={[styles.maskedPhone, { fontFamily: AUTH_FONT.medium }]}>
              {maskPhoneForDisplay(vendor.phone)}
            </Text>
            <Text style={[styles.revealHint, { fontFamily: AUTH_FONT.regular }]}>
              Reveal to call or WhatsApp
            </Text>
          </View>
          <GlowButton
            label={`Reveal · ${revealLabel}`}
            onPress={onReveal}
            variant="primary"
            accessibilityLabel={`Reveal contact for ${title}`}
          />
        </View>
      ) : (
        <AnimatedPressable
          onPress={onPressCard}
          haptic
          scaleTo={0.98}
          style={styles.unlockedRow}
        >
          <Text style={[styles.unlockedText, { fontFamily: AUTH_FONT.semibold }]}>
            Open · call & WhatsApp
          </Text>
          <AppIcon name="chevronRight" size={18} color={COLORS.inkSubtle} />
        </AnimatedPressable>
      )}

      {!glass ? <View style={styles.hairline} /> : null}
    </>
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 320, delay: index * 35 }}
      style={glass ? styles.glassOuter : undefined}
    >
      {glass ? (
        <View style={[styles.glassCard, glassCardStyle(RADIUS.lg)]}>{content}</View>
      ) : (
        content
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  glassOuter: {
    paddingHorizontal: SPACE.md,
    paddingVertical: 5,
  },
  glassCard: {
    overflow: "hidden",
  },
  rowPress: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.line,
  },
  avatarImageGlass: {
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
  },
  avatarFallbackGlass: {
    backgroundColor: "rgba(23,23,23,0.05)",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
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
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: COLORS.ink,
    letterSpacing: -0.25,
  },
  proofRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.lineLight,
  },
  chipVerified: {
    backgroundColor: COLORS.successSoft,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.ink,
  },
  chipTextVerified: {
    color: COLORS.success,
  },
  chipMuted: {
    fontSize: 10,
    color: COLORS.inkMuted,
  },
  categoryInline: {
    flexShrink: 1,
    fontSize: 11,
    color: COLORS.inkMuted,
    marginLeft: 2,
  },
  placeRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  distance: {
    fontSize: 11,
    color: ACCENT,
    fontVariant: ["tabular-nums"],
  },
  preview: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.inkSubtle,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  price: {
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  priceHint: {
    fontSize: 11,
    color: COLORS.inkSubtle,
  },
  revealBlock: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 10,
  },
  revealMeta: {
    gap: 2,
  },
  maskedPhone: {
    fontSize: 12,
    letterSpacing: 1,
    color: COLORS.inkMuted,
    fontVariant: ["tabular-nums"],
  },
  revealHint: {
    fontSize: 11,
    color: COLORS.inkSubtle,
  },
  unlockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  unlockedText: {
    fontSize: 13,
    color: ACCENT,
  },
  hairline: {
    marginLeft: 18,
    marginRight: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(23,23,23,0.08)",
  },
});

export const MarketplaceVendorCard = memo(MarketplaceVendorCardInner);
