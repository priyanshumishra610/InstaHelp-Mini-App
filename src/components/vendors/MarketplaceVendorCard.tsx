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
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, SPACE } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MotiView } from "moti";
import { Image, StyleSheet, Text, View } from "react-native";
import { memo } from "react";

const Box = PERF_MODE ? View : MotiView;

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
  const { colors, isDark } = useAppTheme();
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
          <Image
            source={{ uri: vendor.profileImageUrl }}
            style={[
              styles.avatarImage,
              { backgroundColor: colors.line },
              glass && {
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(23,23,23,0.08)",
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {
                backgroundColor: colors.accentTint,
                borderWidth: glass ? 1 : 0,
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(23,23,23,0.08)",
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { fontFamily: AUTH_FONT.bold, color: colors.ink },
              ]}
            >
              {initials || "IH"}
            </Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { fontFamily: AUTH_FONT.bold, color: colors.ink },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <SaveVendorButton vendorId={vendor.id} size={15} />
          </View>

          <View style={styles.proofRow}>
            {vendor.isVerified ? (
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDark
                      ? "rgba(5,150,105,0.18)"
                      : "#ECFDF5",
                  },
                ]}
              >
                <AppIcon name="shield" size={11} color="#059669" />
                <Text
                  style={[
                    styles.chipText,
                    { fontFamily: AUTH_FONT.semibold, color: "#059669" },
                  ]}
                >
                  Verified
                </Text>
              </View>
            ) : null}
            <View
              style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
            >
              <AppIcon name="star" size={11} color={colors.ink} />
              <Text
                style={[
                  styles.chipText,
                  { fontFamily: AUTH_FONT.semibold, color: colors.ink },
                ]}
              >
                {ratingLabel}
              </Text>
              {reviewLabel ? (
                <Text
                  style={[
                    styles.chipMuted,
                    { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
                  ]}
                >
                  ({reviewLabel})
                </Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.categoryInline,
                { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
              ]}
              numberOfLines={1}
            >
              {vendor.category}
            </Text>
          </View>

          <View style={styles.placeRow}>
            <AppIcon name="location" size={12} color={colors.inkSubtle} />
            <Text
              style={[
                styles.location,
                { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
              ]}
              numberOfLines={1}
            >
              {vendor.areaLabel}
            </Text>
            {distanceKm != null ? (
              <Text
                style={[
                  styles.distance,
                  { fontFamily: AUTH_FONT.semibold, color: colors.ink },
                ]}
              >
                {distanceKm.toFixed(1)} km
              </Text>
            ) : null}
          </View>

          <Text
            style={[
              styles.preview,
              { fontFamily: AUTH_FONT.regular, color: colors.inkSubtle },
            ]}
            numberOfLines={2}
          >
            {preview}
          </Text>

          <View style={styles.priceRow}>
            <Text
              style={[
                styles.price,
                { fontFamily: AUTH_FONT.bold, color: colors.ink },
              ]}
            >
              {priceLabel}
            </Text>
            {unlocked ? (
              <Text
                style={[
                  styles.priceHint,
                  { fontFamily: AUTH_FONT.medium, color: colors.inkSubtle },
                ]}
              >
                Contact unlocked
              </Text>
            ) : (
              <Text
                style={[
                  styles.priceHint,
                  { fontFamily: AUTH_FONT.medium, color: colors.inkSubtle },
                ]}
              >
                Starting rate
              </Text>
            )}
          </View>
        </View>
      </AnimatedPressable>

      {!unlocked ? (
        <View style={styles.revealBlock}>
          <View style={styles.revealMeta}>
            <Text
              style={[
                styles.maskedPhone,
                { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
              ]}
            >
              {maskPhoneForDisplay(vendor.phone)}
            </Text>
            <Text
              style={[
                styles.revealHint,
                { fontFamily: AUTH_FONT.regular, color: colors.inkSubtle },
              ]}
            >
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
          <Text
            style={[
              styles.unlockedText,
              { fontFamily: AUTH_FONT.semibold, color: colors.ink },
            ]}
          >
            Open · call & WhatsApp
          </Text>
          <AppIcon name="chevronRight" size={18} color={colors.inkSubtle} />
        </AnimatedPressable>
      )}

      {!glass ? (
        <View
          style={[
            styles.hairline,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(23,23,23,0.08)",
            },
          ]}
        />
      ) : null}
    </>
  );

  const outerProps = PERF_MODE
    ? { style: glass ? styles.glassOuter : undefined }
    : {
        from: { opacity: 0, translateY: 12, scale: 0.98 },
        animate: { opacity: 1, translateY: 0, scale: 1 },
        transition: {
          type: "spring" as const,
          damping: 22,
          stiffness: 320,
          delay: index * 35,
        },
        style: glass ? styles.glassOuter : undefined,
      };

  return (
    <Box {...outerProps}>
      {glass ? (
        <View
          style={[
            styles.glassCard,
            glassCardStyle(RADIUS.lg, {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              isDark,
            }),
          ]}
        >
          {content}
        </View>
      ) : (
        content
      )}
    </Box>
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
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
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
  },
  chipText: {
    fontSize: 11,
  },
  chipMuted: {
    fontSize: 10,
  },
  categoryInline: {
    flexShrink: 1,
    fontSize: 11,
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
  },
  distance: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  preview: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
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
    letterSpacing: -0.2,
  },
  priceHint: {
    fontSize: 11,
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
    fontVariant: ["tabular-nums"],
  },
  revealHint: {
    fontSize: 11,
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
  },
  hairline: {
    marginLeft: 18,
    marginRight: 18,
    height: StyleSheet.hairlineWidth,
  },
});

export const MarketplaceVendorCard = memo(MarketplaceVendorCardInner);
