import { EARLY_ACCESS_CATEGORIES } from "@/constants/exploreEntitlements";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { glassCardStyle } from "@/components/ui/GlassSurface";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  vendors: VendorRecord[];
  canAccess: boolean;
  onReveal: (vendorId: string) => void;
  isVendorUnlocked: (vendorId: string) => boolean;
  distanceKmFromUser: (v: VendorRecord) => number | null;
  revealCostLabel: string;
};

export function EarlyAccessStrip({
  vendors,
  canAccess,
  onReveal,
  isVendorUnlocked,
  distanceKmFromUser,
  revealCostLabel,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const earlyVendors = useMemo(() => {
    const set = new Set(
      EARLY_ACCESS_CATEGORIES.map((c) => c.toLowerCase()),
    );
    return vendors
      .filter((v) => set.has(v.category.trim().toLowerCase()))
      .slice(0, canAccess ? 4 : 2);
  }, [canAccess, vendors]);

  if (earlyVendors.length === 0) return null;

  if (!canAccess) {
    return (
      <View style={styles.promoWrap}>
        <View
          style={[
            styles.promoBlock,
            glassCardStyle(RADIUS.lg, {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              isDark,
            }),
          ]}
        >
          <Text
            style={[
              styles.promoTitle,
              { fontFamily: AUTH_FONT.bold, color: colors.ink },
            ]}
          >
            Early access categories
          </Text>
          <Text
            style={[
              styles.promoCopy,
              { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
            ]}
          >
            Pro+ unlocks premium categories before they go mainstream.
          </Text>
          <View style={styles.promoCta}>
            <GlowButton
              label="Unlock with Pro+"
              onPress={() => router.push("/(tabs)/vendors/plans")}
              variant="soft"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <Text
        style={[
          styles.eyebrow,
          { fontFamily: AUTH_FONT.semibold, color: colors.inkMuted },
        ]}
      >
        EARLY ACCESS · PRO+
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {earlyVendors.map((vendor) => (
          <View key={vendor.id} style={styles.cardWrap}>
            <MarketplaceVendorCard
              vendor={vendor}
              distanceKm={distanceKmFromUser(vendor)}
              unlocked={isVendorUnlocked(vendor.id)}
              revealCostLabel={revealCostLabel}
              onPressCard={() => router.push(`/(tabs)/vendors/${vendor.id}`)}
              onReveal={() => onReveal(vendor.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  eyebrow: {
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 10,
    letterSpacing: 1.3,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  cardWrap: {
    width: 300,
    marginHorizontal: 8,
  },
  promoWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promoBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  promoTitle: {
    fontSize: 16,
  },
  promoCopy: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  promoCta: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
