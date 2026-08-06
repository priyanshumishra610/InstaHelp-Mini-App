import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { GlowButton } from "@/components/ui/GlowButton";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { useSavedVendorsStore } from "@/store/savedVendorsStore";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  vendors: VendorRecord[];
  isPro: boolean;
  savedLimit: number | null;
};

export function SavedVendorsStrip({ vendors, isPro, savedLimit }: Props) {
  const router = useRouter();
  const savedIds = useSavedVendorsStore((s) => s.vendorIds);

  const savedVendors = useMemo(() => {
    const map = new Map(vendors.map((v) => [v.id, v]));
    return savedIds
      .map((id) => map.get(id))
      .filter((v): v is VendorRecord => Boolean(v))
      .slice(0, 12);
  }, [savedIds, vendors]);

  if (savedIds.length === 0) return null;

  return (
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
            SAVED
          </Text>
          <Text style={[styles.count, { fontFamily: AUTH_FONT.bold }]}>
            {savedIds.length}
            {savedLimit != null ? ` / ${savedLimit}` : ""} vendors
          </Text>
        </View>
        {!isPro ? (
          <GlowButton
            label="Pro · unlimited"
            onPress={() => router.push("/(tabs)/vendors/plans")}
            variant="soft"
          />
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {savedVendors.map((vendor) => (
          <Pressable
            key={vendor.id}
            onPress={() => router.push(`/(tabs)/vendors/${vendor.id}`)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <View style={styles.chipInner}>
              <Text
                style={[styles.chipTitle, { fontFamily: AUTH_FONT.semibold }]}
                numberOfLines={1}
              >
                {vendorDisplayName(vendor)}
              </Text>
              <SaveVendorButton vendorId={vendor.id} size={14} />
            </View>
            <Text style={[styles.chipMeta, { fontFamily: AUTH_FONT.regular }]}>
              {vendor.city} · {vendor.category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,74,173,0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: AUTH_PRIMARY,
  },
  count: {
    marginTop: 2,
    fontSize: 16,
    color: "#111827",
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    width: 160,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,74,173,0.1)",
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
  },
  chipTitle: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  chipMeta: {
    marginTop: 4,
    fontSize: 10,
    color: "#9CA3AF",
  },
});
