import { EmptyState } from "@/components/ui/EmptyState";
import { GlowButton } from "@/components/ui/GlowButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { HomeExploreChrome } from "@/components/home/HomeExploreChrome";
import { HomeFooterCta } from "@/components/home/HomeFooterCta";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomePopularServices } from "@/components/home/HomePopularServices";
import { HomeProPlusBanner } from "@/components/home/HomeProPlusBanner";
import { TourAnchor } from "@/components/onboarding/guided/TourAnchor";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import { EarlyAccessStrip } from "@/components/vendors/EarlyAccessStrip";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { SavedVendorsStrip } from "@/components/vendors/SavedVendorsStrip";
import { VendorExploreListSkeleton } from "@/components/vendors/VendorExploreListSkeleton";
import {
  distanceKmFromUser,
  type ExploreCatalogState,
} from "@/hooks/useExploreCatalog";
import { useDeferredMount } from "@/hooks/useDeferredMount";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { VendorRecord } from "@/types/vendorMarketplace";

type ExploreSection = ExploreCatalogState["sections"][number];

type ListRow =
  | {
      kind: "header";
      key: string;
      section: ExploreSection;
      sectionIndex: number;
    }
  | {
      kind: "vendor";
      key: string;
      vendor: VendorRecord;
      sectionIndex: number;
      indexInSection: number;
    };

type Props = {
  catalog: ExploreCatalogState;
  greeting: string;
};

const VendorRow = memo(function VendorRow({
  vendor,
  indexInSection,
  coords,
  isVendorUnlocked,
  revealCostLabel,
  onPressCard,
  onReveal,
  wrapTour,
}: {
  vendor: VendorRecord;
  indexInSection: number;
  coords: ExploreCatalogState["coords"];
  isVendorUnlocked: (id: string) => boolean;
  revealCostLabel: string;
  onPressCard: (vendorId: string) => void;
  onReveal: (vendorId: string) => void;
  wrapTour: boolean;
}) {
  const card = (
    <MarketplaceVendorCard
      vendor={vendor}
      index={indexInSection}
      glass
      distanceKm={distanceKmFromUser(vendor, coords)}
      unlocked={isVendorUnlocked(vendor.id)}
      revealCostLabel={revealCostLabel}
      onPressCard={() => onPressCard(vendor.id)}
      onReveal={() => onReveal(vendor.id)}
    />
  );

  if (wrapTour) {
    return <TourAnchor id="tour-first-vendor">{card}</TourAnchor>;
  }

  return card;
});

const SectionHeaderRow = memo(function SectionHeaderRow({
  section,
  categoryBounceIndex,
  sectionIndex,
  wrapTour,
}: {
  section: ExploreSection;
  categoryBounceIndex: number | null;
  sectionIndex: number;
  wrapTour: boolean;
}) {
  const { colors } = useAppTheme();
  const avg =
    section.avgRating != null ? section.avgRating.toFixed(1) : null;
  const metaParts = [
    `${section.data.length} vendor${section.data.length === 1 ? "" : "s"}`,
    section.verifiedCount > 0 ? `${section.verifiedCount} verified` : null,
    avg ? `${avg} avg` : null,
  ].filter(Boolean);

  const header = (
    <View
      style={[
        styles.sectionHeaderWrap,
        !PERF_MODE && categoryBounceIndex === sectionIndex
          ? { transform: [{ scale: 1.03 }] }
          : null,
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleBlock}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: AUTH_FONT.bold, color: colors.ink },
            ]}
          >
            {section.title}
          </Text>
          <Text
            style={[
              styles.sectionMeta,
              { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
            ]}
          >
            {metaParts.join(" · ")}
          </Text>
        </View>
        <View style={styles.sectionRail}>
          <View
            style={[styles.sectionMarkPrimary, { backgroundColor: colors.ink }]}
          />
          <View
            style={[styles.sectionMarkSecondary, { backgroundColor: colors.line }]}
          />
        </View>
      </View>
    </View>
  );

  if (wrapTour) {
    return (
      <TourAnchor id={`tour-category-${sectionIndex}`}>{header}</TourAnchor>
    );
  }

  return header;
});

export function ExploreVendorList({ catalog, greeting }: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const listRef = useRef<FlashListRef<ListRow>>(null);
  const categoryBounceIndex = useGuidedTourStore((s) => s.categoryBounceIndex);
  const setScrollToVendor = useGuidedTourStore((s) => s.setScrollToVendor);

  const {
    coords,
    isVendorUnlocked,
    catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    revealCostLabel,
    filtered,
    sections,
    resultSummary,
    handleReveal,
    clearFilters,
    entitlements,
    activeFilterCount,
    sortMode,
    setSearch,
  } = catalog;

  const flatRows = useMemo(() => {
    const rows: ListRow[] = [];
    sections.forEach((section, sectionIndex) => {
      rows.push({
        kind: "header",
        key: `header-${section.title}`,
        section,
        sectionIndex,
      });
      section.data.forEach((vendor, indexInSection) => {
        rows.push({
          kind: "vendor",
          key: vendor.id,
          vendor,
          sectionIndex,
          indexInSection,
        });
      });
    });
    return rows;
  }, [sections]);

  const onPressCard = useCallback(
    (vendorId: string) => {
      router.push(`/(tabs)/vendors/${vendorId}`);
    },
    [router],
  );

  const onReveal = useCallback(
    (vendorId: string) => {
      void handleReveal(vendorId);
    },
    [handleReveal],
  );

  const scrollToFirstVendor = useCallback(() => {
    const index = flatRows.findIndex((row) => row.kind === "vendor");
    if (index < 0) return;
    listRef.current?.scrollToIndex({
      index,
      animated: !PERF_MODE,
      viewOffset: 140,
    });
  }, [flatRows]);

  useEffect(() => {
    setScrollToVendor(scrollToFirstVendor);
    return () => setScrollToVendor(null);
  }, [scrollToFirstVendor, setScrollToVendor]);

  const sortLabel =
    sortMode === "distance"
      ? "Nearest first"
      : sortMode === "rating"
        ? "Top rated"
        : "Recommended";

  const marketingReady = useDeferredMount();

  const listHeader = useMemo(
    () => (
      <>
        <HomeExploreChrome greeting={greeting} catalog={catalog} />

        {marketingReady ? (
          <>
            {!entitlements.canAccessEarlyCategories ? (
              <HomeProPlusBanner
                onUnlock={() => router.push("/(tabs)/vendors/plans")}
              />
            ) : (
              <EarlyAccessStrip
                vendors={catalogVendors}
                canAccess={entitlements.canAccessEarlyCategories}
                onReveal={onReveal}
                isVendorUnlocked={isVendorUnlocked}
                distanceKmFromUser={(v) => distanceKmFromUser(v, coords)}
                revealCostLabel={revealCostLabel}
              />
            )}

            <HomePopularServices
              onSearch={setSearch}
              onViewAll={() => router.push("/(tabs)/vendors/popular-services")}
            />

            <HomeHowItWorks />

            <SavedVendorsStrip
              vendors={catalogVendors}
              isPro={entitlements.isPro}
              savedLimit={entitlements.savedVendorLimit}
            />
          </>
        ) : null}

        {resultSummary.vendorCount > 0 ? (
          <View style={styles.summaryWrap}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                },
              ]}
            >
              <View style={styles.summaryLeft}>
                <Text
                  style={[
                    styles.summaryCount,
                    { fontFamily: AUTH_FONT.bold, color: colors.ink },
                  ]}
                >
                  {resultSummary.vendorCount.toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
                  ]}
                >
                  vendors · {resultSummary.categoryCount}{" "}
                  {resultSummary.categoryCount === 1 ? "category" : "categories"}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryRight,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <AppIcon name="filter" size={14} color={colors.inkMuted} />
                <Text
                  style={[
                    styles.summarySort,
                    { fontFamily: AUTH_FONT.semibold, color: colors.inkMuted },
                  ]}
                >
                  {sortLabel}
                  {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </>
    ),
    [
      activeFilterCount,
      catalog,
      catalogVendors,
      colors,
      coords,
      entitlements,
      greeting,
      isVendorUnlocked,
      marketingReady,
      onReveal,
      resultSummary.categoryCount,
      resultSummary.vendorCount,
      revealCostLabel,
      router,
      setSearch,
      sortLabel,
    ],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.kind === "header") {
        return (
          <SectionHeaderRow
            section={item.section}
            sectionIndex={item.sectionIndex}
            categoryBounceIndex={categoryBounceIndex}
            wrapTour={item.sectionIndex >= 0 && item.sectionIndex < 3}
          />
        );
      }

      return (
        <VendorRow
          vendor={item.vendor}
          indexInSection={item.indexInSection}
          coords={coords}
          isVendorUnlocked={isVendorUnlocked}
          revealCostLabel={revealCostLabel}
          onPressCard={onPressCard}
          onReveal={onReveal}
          wrapTour={item.sectionIndex === 0 && item.indexInSection === 0}
        />
      );
    },
    [
      categoryBounceIndex,
      coords,
      isVendorUnlocked,
      onPressCard,
      onReveal,
      revealCostLabel,
    ],
  );

  const getItemType = useCallback((item: ListRow) => item.kind, []);

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
          subtitle="Something went wrong loading the catalog. Pull to refresh or try again."
          icon="cloud-offline-outline"
        >
          <GlowButton label="Retry" onPress={retry} variant="primary" />
        </EmptyState>
      </View>
    );
  }

  return (
    <FlashList
      ref={listRef}
      data={flatRows}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      getItemType={getItemType}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        <>
          <HomeFooterCta onExplore={() => setSearch("")} />
          <View className="h-8" />
        </>
      }
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.ink}
        />
      }
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 160 : 150,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      removeClippedSubviews
      drawDistance={280}
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
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  summaryCount: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summarySort: {
    fontSize: 11,
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
  },
  sectionMeta: {
    fontSize: 12,
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
  },
  sectionMarkSecondary: {
    width: 8,
    height: 2.5,
    borderRadius: 99,
  },
});
