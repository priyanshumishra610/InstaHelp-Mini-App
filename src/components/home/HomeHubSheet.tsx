import { GlowButton } from "@/components/ui/GlowButton";
import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { MarketplaceChip } from "@/components/vendors/MarketplaceChip";
import {
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
} from "@/constants/authPremium";
import { ACCENT, HERO_BACKDROP, HERO_LAVENDER, HERO_LAVENDER_MIST } from "@/constants/theme";
import type { ExploreCatalogState } from "@/hooks/useExploreCatalog";
import { openWhatsApp } from "@/utils/whatsapp";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ReactNode,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  catalog: ExploreCatalogState;
  onOpenConcierge: () => void;
};

function ChipRail({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.chipRail}>
      <View style={styles.chipRailHeader}>
        <Text style={[styles.chipRailTitle, { fontFamily: AUTH_FONT.semibold }]}>
          {title}
        </Text>
        {hint ? (
          <Text style={[styles.chipRailHint, { fontFamily: AUTH_FONT.medium }]}>
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

function HubDivider() {
  return <View style={styles.divider} />;
}

/** Unified hub: concierge, sort, filters, upgrade, support. */
export function HomeHubSheet({
  visible,
  onClose,
  catalog,
  onOpenConcierge,
}: Props) {
  const insets = useSafeAreaInsets();
  const {
    entitlements,
    promptUpgrade,
    multiCityMode,
    multiCityKeys,
    onToggleMultiCityMode,
    onToggleMultiCityKey,
    cityOptions,
    cityKey,
    setCityKey,
    areaOptions,
    areaKey,
    setAreaKey,
    sortMode,
    toggleSortMode,
    verifiedOnly,
    setVerifiedOnly,
    availableNowOnly,
    setAvailableNowOnly,
    activeFilterCount,
    clearFilters,
  } = catalog;

  const whatsAppMessage = entitlements.whatsAppPriority
    ? "Hi InstaHelp Pro+ — I need priority assistance with Explore / vendor discovery."
    : "Hi InstaHelp, I need assistance with my request.";

  if (!visible) return null;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close hub" />
        <LinearGradient
          colors={[...AUTH_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sheetRim, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <GlassAuthCard elevated accentEdge style={styles.sheetCard}>
            <View style={styles.inner}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
                    INSTAHELP
                  </Text>
                  <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
                    Sort & Filter
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  style={styles.closePill}
                >
                  <Text style={[styles.closeLabel, { fontFamily: AUTH_FONT.semibold }]}>
                    Done
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 16 }}
                style={{ maxHeight: "72%" }}
              >
                <Text style={[styles.sectionEyebrow, { fontFamily: AUTH_FONT.semibold }]}>
                  CONCIERGE
                </Text>
                <Pressable
                  onPress={() => {
                    onClose();
                    onOpenConcierge();
                  }}
                  style={({ pressed }) => [
                    styles.conciergeRow,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Submit a service request"
                >
                  <View style={styles.conciergeCopy}>
                    <Text style={[styles.conciergeTitle, { fontFamily: AUTH_FONT.bold }]}>
                      Get it done today
                    </Text>
                    <Text style={[styles.conciergeSub, { fontFamily: AUTH_FONT.regular }]}>
                      Submit a task — we handle the rest via WhatsApp
                    </Text>
                  </View>
                  <Text style={styles.conciergeArrow}>→</Text>
                </Pressable>

                <HubDivider />

                <ChipRail
                  title="Cities"
                  hint={
                    entitlements.canUseMultiCity
                      ? "Pro+ multi-city"
                      : "Top metros"
                  }
                >
                  {entitlements.canUseMultiCity ? (
                    <MarketplaceChip
                      label={`Multi-city${multiCityMode ? ` · ${multiCityKeys.length}` : ""}`}
                      active={multiCityMode}
                      compact
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        onToggleMultiCityMode();
                      }}
                    />
                  ) : null}
                  <MarketplaceChip
                    label="All India"
                    active={!multiCityMode && cityKey === null}
                    compact
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      if (multiCityMode) onToggleMultiCityMode();
                      setCityKey(null);
                      setAreaKey(null);
                    }}
                  />
                  {cityOptions.map(([key, label], i) => (
                    <MarketplaceChip
                      key={key}
                      label={label}
                      index={i}
                      active={
                        multiCityMode ? multiCityKeys.includes(key) : cityKey === key
                      }
                      compact
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        if (multiCityMode && entitlements.canUseMultiCity) {
                          onToggleMultiCityKey(key);
                          return;
                        }
                        setCityKey((cur) => (cur === key ? null : key));
                        setAreaKey(null);
                      }}
                    />
                  ))}
                </ChipRail>

                <ChipRail title="Areas" hint="Neighbourhoods">
                  <MarketplaceChip
                    label="All areas"
                    active={areaKey === null}
                    compact
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setAreaKey(null);
                    }}
                  />
                  {areaOptions.map(([key, label], i) => (
                    <MarketplaceChip
                      key={key}
                      label={label}
                      index={i}
                      active={areaKey === key}
                      compact
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        setAreaKey((cur) => (cur === key ? null : key));
                      }}
                    />
                  ))}
                </ChipRail>

                <ChipRail title="Sort & filters">
                  <MarketplaceChip
                    label="Nearby"
                    active={sortMode === "distance"}
                    compact
                    onPress={() => toggleSortMode("distance")}
                  />
                  <MarketplaceChip
                    label="Top rated"
                    active={sortMode === "rating"}
                    compact
                    onPress={() => toggleSortMode("rating")}
                  />
                  <MarketplaceChip
                    label={
                      entitlements.canUseVerifiedFilter
                        ? "Verified only"
                        : "Verified · Pro"
                    }
                    active={verifiedOnly}
                    compact
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      if (!entitlements.canUseVerifiedFilter) {
                        promptUpgrade("Verified filter");
                        return;
                      }
                      setVerifiedOnly((v) => !v);
                    }}
                  />
                  <MarketplaceChip
                    label="Open now · est."
                    active={availableNowOnly}
                    compact
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setAvailableNowOnly((v) => !v);
                    }}
                  />
                </ChipRail>

                {!entitlements.isPro ? (
                  <>
                    <HubDivider />
                    <View style={styles.upgradeBlock}>
                      <GlowButton
                        label="Upgrade Explore plan"
                        onPress={() => promptUpgrade("Explore plans")}
                        variant="primary"
                        fullWidth
                      />
                    </View>
                  </>
                ) : null}

                <HubDivider />
                <Pressable
                  onPress={() => {
                    void openWhatsApp(whatsAppMessage);
                  }}
                  style={({ pressed }) => [styles.supportRow, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Chat on WhatsApp"
                >
                  <Text style={[styles.supportLabel, { fontFamily: AUTH_FONT.semibold }]}>
                    {entitlements.whatsAppPriority
                      ? "Pro+ WhatsApp support"
                      : "WhatsApp support"}
                  </Text>
                  <Text style={styles.supportArrow}>→</Text>
                </Pressable>
              </ScrollView>

              <View style={styles.footerRow}>
                {activeFilterCount > 0 ? (
                  <Pressable
                    onPress={clearFilters}
                    style={styles.resetTap}
                    accessibilityRole="button"
                    accessibilityLabel="Reset all filters"
                  >
                    <View style={styles.resetPill}>
                      <Text style={[styles.resetText, { fontFamily: AUTH_FONT.bold }]}>
                        Reset all
                      </Text>
                    </View>
                  </Pressable>
                ) : null}
                <View style={activeFilterCount > 0 ? styles.applyHalf : styles.applyFull}>
                  <GlowButton
                    label={
                      activeFilterCount > 0
                        ? `Apply · ${activeFilterCount}`
                        : "Apply"
                    }
                    onPress={onClose}
                    variant="primary"
                    fullWidth
                  />
                </View>
              </View>
            </View>
          </GlassAuthCard>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HERO_BACKDROP,
  },
  sheetRim: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 1.5,
    maxHeight: "92%",
  },
  sheetCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inner: {
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: AUTH_PRIMARY,
  },
  title: {
    marginTop: 4,
    fontSize: 20,
    color: "#111827",
    letterSpacing: -0.3,
  },
  closePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: HERO_LAVENDER,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.12)",
  },
  closeLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: AUTH_PRIMARY,
    marginBottom: 8,
  },
  conciergeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: HERO_LAVENDER,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.1)",
  },
  conciergeCopy: {
    flex: 1,
  },
  conciergeTitle: {
    fontSize: 16,
    color: "#111827",
  },
  conciergeSub: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
  },
  conciergeArrow: {
    fontSize: 20,
    color: ACCENT,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(23,23,23,0.1)",
    marginVertical: 16,
  },
  chipRail: {
    marginTop: 4,
  },
  chipRailHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chipRailTitle: {
    fontSize: 12,
    color: "#374151",
  },
  chipRailHint: {
    fontSize: 10,
    color: ACCENT,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  upgradeBlock: {
    marginTop: 4,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  supportLabel: {
    fontSize: 13,
    color: "#374151",
  },
  supportArrow: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  resetTap: {
    flex: 1,
  },
  resetPill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.14)",
    backgroundColor: HERO_LAVENDER,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  resetText: {
    fontSize: 13,
    color: "#6B7280",
  },
  applyHalf: {
    flex: 1,
  },
  applyFull: {
    width: "100%",
  },
  pressed: {
    opacity: 0.88,
  },
});
