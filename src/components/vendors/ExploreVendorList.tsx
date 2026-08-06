import { EmptyState } from "@/components/ui/EmptyState";
import { GlowButton } from "@/components/ui/GlowButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { HomeExploreChrome } from "@/components/home/HomeExploreChrome";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { COLORS, RADIUS } from "@/constants/designSystem";
import { ACCENT } from "@/constants/theme";
import { EarlyAccessStrip } from "@/components/vendors/EarlyAccessStrip";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { SavedVendorsStrip } from "@/components/vendors/SavedVendorsStrip";
import { VendorExploreListSkeleton } from "@/components/vendors/VendorExploreListSkeleton";
import {
  distanceKmFromUser,
  type ExploreCatalogState,
} from "@/hooks/useExploreCatalog";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  catalog: ExploreCatalogState;
  greeting: string;
};

export function ExploreVendorList({
  catalog,
  greeting,
}: Props) {
  const router = useRouter();
  const {
    coords,
    isVendorUnlocked,
    catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
    revealCostLabel,
    filtered,
    sections,
    resultSummary,
    handleReveal,
    clearFilters,
    entitlements,
    activeFilterCount,
    sortMode,
  } = catalog;

  if (loading && !filtered.length && !error) {
    return (
      <View className="flex-1">
        <HomeExploreChrome greeting={greeting} catalog={catalog} />
        <VendorExploreListSkeleton />
      </View>
    );
  }

  if (error && !filtered.length) {
    return (
      <View className="flex-1 justify-center px-6">
        <HomeExploreChrome greeting={greeting} catalog={catalog} />
        <EmptyState
          title="Could not load vendors"
          subtitle={
            source === "firestore"
              ? "Check your connection and Firebase config, then try again."
              : "Something went wrong loading the catalog."
          }
          icon="cloud-offline-outline"
        >
          <GlowButton label="Retry" onPress={retry} variant="primary" />
        </EmptyState>
      </View>
    );
  }

  const sortLabel =
    sortMode === "distance"
      ? "Nearest first"
      : sortMode === "rating"
        ? "Top rated"
        : "Recommended";

  return (
    <SectionList
      style={{ flex: 1 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={ACCENT}
        />
      }
      ListFooterComponent={<View className="h-8" />}
      ListHeaderComponent={
        <>
          <HomeExploreChrome greeting={greeting} catalog={catalog} />
          <EarlyAccessStrip
            vendors={catalogVendors}
            canAccess={entitlements.canAccessEarlyCategories}
            onReveal={(vendorId) => {
              void handleReveal(vendorId);
            }}
            isVendorUnlocked={isVendorUnlocked}
            distanceKmFromUser={(v) => distanceKmFromUser(v, coords)}
            revealCostLabel={revealCostLabel}
          />
          <SavedVendorsStrip
            vendors={catalogVendors}
            isPro={entitlements.isPro}
            savedLimit={entitlements.savedVendorLimit}
          />
          {resultSummary.vendorCount > 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              style={styles.summaryWrap}
            >
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <Text style={[styles.summaryCount, { fontFamily: AUTH_FONT.bold }]}>
                    {resultSummary.vendorCount.toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.summaryLabel, { fontFamily: AUTH_FONT.medium }]}>
                    vendors · {resultSummary.categoryCount}{" "}
                    {resultSummary.categoryCount === 1 ? "category" : "categories"}
                  </Text>
                </View>
                <View style={styles.summaryRight}>
                  <AppIcon name="filter" size={14} color={COLORS.inkMuted} />
                  <Text style={[styles.summarySort, { fontFamily: AUTH_FONT.semibold }]}>
                    {sortLabel}
                    {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
                  </Text>
                </View>
              </View>
            </MotiView>
          ) : null}
        </>
      }
      renderSectionHeader={({ section }) => {
        const avg =
          section.avgRating != null ? section.avgRating.toFixed(1) : null;
        const metaParts = [
          `${section.data.length} vendor${section.data.length === 1 ? "" : "s"}`,
          section.verifiedCount > 0
            ? `${section.verifiedCount} verified`
            : null,
          avg ? `${avg} avg` : null,
        ].filter(Boolean);

        return (
          <MotiView
            from={{ opacity: 0, translateX: -8 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={styles.sectionHeaderWrap}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <Text style={[styles.sectionTitle, { fontFamily: AUTH_FONT.bold }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionMeta, { fontFamily: AUTH_FONT.medium }]}>
                  {metaParts.join(" · ")}
                </Text>
              </View>
              <View style={styles.sectionRail}>
                <View style={styles.sectionMarkPrimary} />
                <View style={styles.sectionMarkSecondary} />
              </View>
            </View>
          </MotiView>
        );
      }}
      renderItem={({ item, index }) => (
        <MarketplaceVendorCard
          vendor={item}
          index={index}
          glass
          distanceKm={distanceKmFromUser(item, coords)}
          unlocked={isVendorUnlocked(item.id)}
          revealCostLabel={revealCostLabel}
          onPressCard={() => router.push(`/(tabs)/vendors/${item.id}`)}
          onReveal={() => {
            void handleReveal(item.id);
          }}
        />
      )}
      ListEmptyComponent={
        <View className="min-h-[280px] justify-center px-5 py-10">
          <EmptyState
            title="Nothing matches quite yet"
            subtitle="Relax a filter or try a simpler search — the catalog spans 4,500+ vendors across India."
            icon="search-outline"
          >
            <GlowButton
              label="Reset everything"
              onPress={clearFilters}
              variant="primary"
            />
          </EmptyState>
        </View>
      }
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 160 : 150,
        flexGrow: 1,
      }}
      initialNumToRender={12}
      maxToRenderPerBatch={22}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  summaryWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  summaryLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  summaryCount: {
    fontSize: 18,
    letterSpacing: -0.3,
    color: COLORS.ink,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  summaryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.lineLight,
  },
  summarySort: {
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  sectionHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 4,
  },
  sectionTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  sectionTitle: {
    fontSize: 20,
    letterSpacing: -0.35,
    color: COLORS.ink,
  },
  sectionMeta: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  sectionRail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 6,
  },
  sectionMarkPrimary: {
    width: 18,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
  },
  sectionMarkSecondary: {
    width: 8,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: COLORS.line,
  },
});
