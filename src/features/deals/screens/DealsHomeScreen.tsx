import { DealCard } from "@/features/deals/components/DealCard";
import { DealCarousel } from "@/features/deals/components/DealCarousel";
import { DealBanner } from "@/features/deals/components/DealBanner";
import {
  DealCardSkeleton,
  DealCarouselSkeleton,
} from "@/features/deals/components/DealCardSkeleton";
import {
  SHOP_GREEN,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { useDealSections, useDealsInfinite, useRefreshDeals } from "@/features/deals/hooks/useDeals";
import {
  trackCategoryClick,
  trackDealClick,
} from "@/features/deals/services/dealsService";
import type { Deal } from "@/features/deals/types/dealTypes";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type Props = {
  onOpenDeal: (id: string) => void;
  onGetDeal: (deal: Deal) => void;
  bottomInset: number;
};

export function DealsHomeScreen({ onOpenDeal, onGetDeal, bottomInset }: Props) {
  const { width } = useWindowDimensions();
  const carouselCardWidth = Math.min(160, Math.floor((width - 52 - 32) * 0.46));
  const gridCardWidth = Math.floor((width - 52 - 24) / 2);

  const refreshDeals = useRefreshDeals();
  const sectionsQuery = useDealSections();
  const infiniteQuery = useDealsInfinite({ enabled: true });

  const onRefresh = useCallback(async () => {
    await refreshDeals();
  }, [refreshDeals]);

  const handleSectionPress = useCallback(async (sectionId: string) => {
    await trackCategoryClick(sectionId as Deal["categoryId"]);
  }, []);

  const handleGetDeal = useCallback(
    async (deal: Deal) => {
      await trackDealClick(deal.id, deal.merchant);
      onGetDeal(deal);
    },
    [onGetDeal],
  );

  const allDeals = useMemo(() => {
    return infiniteQuery.data?.pages.flatMap((p) => p.deals) ?? [];
  }, [infiniteQuery.data]);

  const isLoading = sectionsQuery.isLoading && !sectionsQuery.data;
  const isError = sectionsQuery.isError && !sectionsQuery.data?.sections.length;
  const sections = sectionsQuery.data?.sections ?? [];

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: bottomInset + 80, paddingTop: 8 }}>
        <DealBanner title="Loading partner offers…" subtitle="Powered by Cuelinks" />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={`section-skel-${i}`} style={styles.section}>
            <View style={styles.sectionTitleSkel} />
            <DealCarouselSkeleton cardWidth={carouselCardWidth} />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="cloud-offline-outline" size={32} color={SHOP_TEXT_LIGHT} />
        <Text style={styles.emptyTitle}>Could not load deals</Text>
        <Text style={styles.emptySub}>Check your connection and try again.</Text>
        <Pressable onPress={() => void onRefresh()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={sectionsQuery.isFetching && !sectionsQuery.isLoading}
          onRefresh={() => void onRefresh()}
          tintColor={SHOP_GREEN}
        />
      }
      contentContainerStyle={{ paddingBottom: bottomInset + 100, paddingTop: 4 }}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const nearBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
        if (
          nearBottom &&
          infiniteQuery.hasNextPage &&
          !infiniteQuery.isFetchingNextPage
        ) {
          void infiniteQuery.fetchNextPage();
        }
      }}
      scrollEventThrottle={200}
    >
      <DealBanner
        title="Deals & Offers"
        subtitle={
          sectionsQuery.data?.source === "api"
            ? "Live offers via Cuelinks"
            : "Curated partner offers"
        }
      />

      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Pressable
            onPress={() => void handleSectionPress(section.id)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Ionicons name="chevron-forward" size={14} color={SHOP_TEXT_MUTED} />
          </Pressable>
          <DealCarousel
            deals={section.deals}
            cardWidth={carouselCardWidth}
            onOpenDeal={onOpenDeal}
            onGetDeal={(deal) => void handleGetDeal(deal)}
          />
        </View>
      ))}

      {allDeals.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionHeader]}>All Deals</Text>
          <View style={styles.grid}>
            {allDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                width={gridCardWidth}
                onOpen={() => onOpenDeal(deal.id)}
                onGetDeal={() => void handleGetDeal(deal)}
              />
            ))}
          </View>
          {infiniteQuery.isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={SHOP_GREEN} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <DealCardSkeleton key={`grid-skel-${i}`} width={gridCardWidth} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  sectionTitleSkel: {
    marginHorizontal: 10,
    marginBottom: 8,
    height: 16,
    width: 140,
    borderRadius: 4,
    backgroundColor: "#ececec",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: SHOP_GREEN,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
