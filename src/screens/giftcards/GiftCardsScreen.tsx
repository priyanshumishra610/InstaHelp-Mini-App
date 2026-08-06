import {
  GIFT_CARD_CATEGORIES,
  GIFT_CARD_FEATURED,
  GIFT_CARD_HERO_SLIDES,
  GIFT_CARD_POPULAR_BRANDS,
  HUBBLE_IS_CONFIGURED,
  type GiftCardBrandTile,
  type GiftCardCategory,
  type GiftCardFeatured,
  type GiftCardHeroSlide,
} from "@/constants/hubble";
import { CashbackStrip } from "@/components/giftcards/CashbackStrip";
import { CategoriesGrid } from "@/components/giftcards/CategoriesGrid";
import { FeaturedGiftCardsRow } from "@/components/giftcards/FeaturedGiftCardsRow";
import { GiftCardsCtaCard } from "@/components/giftcards/GiftCardsCtaCard";
import { GiftCardsHeroCarousel } from "@/components/giftcards/GiftCardsHeroCarousel";
import { GiftCardsSkeleton } from "@/components/giftcards/GiftCardsSkeleton";
import { PopularBrandsRow } from "@/components/giftcards/PopularBrandsRow";
import { RecentlyViewedSection } from "@/components/giftcards/RecentlyViewedSection";
import { RecommendedSection } from "@/components/giftcards/RecommendedSection";
import { Screen } from "@/components/ui/Screen";
import { ACCENT } from "@/constants/theme";
import { useGiftCardsStore, type RecentlyViewedGiftCard } from "@/store/giftCardsStore";
import { pushHubbleWebView } from "@/navigation/hubbleNavigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

function pushHubble(params: Record<string, string | undefined>) {
  const compact: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) compact[k] = v;
  }
  pushHubbleWebView(compact);
}

export function GiftCardsScreen() {
  const recentlyViewed = useGiftCardsStore((s) => s.recentlyViewed);
  const recordView = useGiftCardsStore((s) => s.recordView);
  const clearRecentlyViewed = useGiftCardsStore((s) => s.clearRecentlyViewed);

  const [booting, setBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 420);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setBooting(true);
    setTimeout(() => {
      setBooting(false);
      setRefreshing(false);
    }, 520);
  }, []);

  const openFromHero = useCallback((slide: GiftCardHeroSlide) => {
    const base = slide.sdkPath;
    if (base === "search" && slide.searchCategory) {
      pushHubble({ sdkPath: "search", category: slide.searchCategory });
      return;
    }
    pushHubble({ sdkPath: base });
  }, []);

  const openFeatured = useCallback(
    (item: GiftCardFeatured) => {
      if (item.brandId) {
        recordView({
          id: `brand:${item.brandId}`,
          title: item.name,
          subtitle: item.tagline,
          brandId: item.brandId,
        });
        pushHubble({ brandId: item.brandId });
        return;
      }
      recordView({ id: `collection:${item.id}`, title: item.name, subtitle: item.tagline });
      pushHubble({ sdkPath: "search" });
    },
    [recordView],
  );

  const openCategory = useCallback(
    (c: GiftCardCategory) => {
      recordView({ id: `category:${c.id}`, title: c.title, subtitle: c.subtitle });
      if (c.searchCategory) {
        pushHubble({ sdkPath: "search", category: c.searchCategory });
        return;
      }
      pushHubble({ sdkPath: "search" });
    },
    [recordView],
  );

  const openBrand = useCallback(
    (b: GiftCardBrandTile) => {
      recordView({
        id: `brand:${b.id}`,
        title: b.name,
        subtitle: "Popular brand",
        brandId: b.brandId,
      });
      if (b.brandId) {
        pushHubble({ brandId: b.brandId });
        return;
      }
      pushHubble({ sdkPath: "search" });
    },
    [recordView],
  );

  const openRecent = useCallback((item: RecentlyViewedGiftCard) => {
    if (item.brandId) {
      pushHubble({ brandId: item.brandId });
      return;
    }
    pushHubble({ sdkPath: "search" });
  }, []);

  const headerSubtitle = useMemo(() => {
    if (!HUBBLE_IS_CONFIGURED) {
      return "Add gift card credentials to your build environment to enable checkout.";
    }
    return "Browse brands, send gifts, and manage activity — all inside InstaHelp®.";
  }, []);

  return (
    <Screen className="bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      >
        <Animated.View entering={FadeInDown.duration(260)} className="px-4 pt-2">
          <LinearGradient
            colors={["#f0f6ff", "#ffffff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl border border-accent-tint/70 p-4"
            style={{
              shadowColor: "#004aad",
              shadowOpacity: 0.08,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5,
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
                  InstaHelp®
                </Text>
                <Text className="mt-2 text-3xl font-extrabold text-brand-ink">Gift Cards</Text>
                <Text className="mt-2 text-sm leading-5 text-gray-600">{headerSubtitle}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => pushHubble({ sdkPath: "search" })}
                className="rounded-3xl bg-accent px-3 py-3 active:opacity-90"
              >
                <Ionicons name="search" size={20} color="#ffffff" />
              </Pressable>
            </View>

            {!HUBBLE_IS_CONFIGURED ? (
              <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <Text className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                  Setup required
                </Text>
                <Text className="mt-1 text-xs leading-5 text-amber-950/80">
                  Set the public client ID and app secret from your integration pack in `.env` or EAS
                  environment variables, then rebuild. Use a development host while testing if your
                  provider supplies one.
                </Text>
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>

        {booting ? (
          <GiftCardsSkeleton />
        ) : (
          <>
            <GiftCardsHeroCarousel slides={GIFT_CARD_HERO_SLIDES} onOpenSlide={openFromHero} />
            <FeaturedGiftCardsRow items={GIFT_CARD_FEATURED} onOpen={openFeatured} />
            <CashbackStrip onOpenOffers={() => pushHubble({ sdkPath: "search" })} />
            <CategoriesGrid categories={GIFT_CARD_CATEGORIES} onSelect={openCategory} />
            <PopularBrandsRow brands={GIFT_CARD_POPULAR_BRANDS} onOpenBrand={openBrand} />
            <RecommendedSection onOpenPersonalized={() => pushHubble({ sdkPath: "search" })} />
            <RecentlyViewedSection
              items={recentlyViewed}
              onOpen={openRecent}
              onClear={clearRecentlyViewed}
            />
            <GiftCardsCtaCard
              onOpenWallet={() => pushHubble({ sdkPath: "transactions", showBackButton: "true" })}
              onOpenHelp={() => pushHubble({ sdkPath: "help" })}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
