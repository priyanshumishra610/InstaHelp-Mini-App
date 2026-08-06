/**
 * InstaHelp Shop — curated store directory.
 * Layout, copy, and catalog mirrored from https://instahelp.in/shop
 */
import { WEB_SHOP } from "@/constants/shopWebTheme";
import {
  SHOP_STORES,
  SHOP_STORE_SECTIONS,
  shopCategoryImage,
  shopStoreLogoUrl,
  type ShopStore,
  type ShopStoreCategoryId,
  type ShopStoreSection,
} from "@/data/shopStores";
import {
  initializeCuelinks,
  openCuelinksTrackedUrl,
} from "@/services/cuelinksService";
import { dialPhone } from "@/utils/vendorContactActions";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterId = "all" | ShopStoreCategoryId;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  ...SHOP_STORE_SECTIONS.map((s) => ({ id: s.id as FilterId, label: s.title })),
];

function CategoryBadge({
  section,
  size = 44,
}: {
  section: ShopStoreSection;
  size?: number;
}) {
  return (
    <Image
      source={shopCategoryImage(section.id)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
      }}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

function faviconUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}

function StoreTile({
  store,
  tileWidth,
  onOpen,
}: {
  store: ShopStore;
  tileWidth: number;
  onOpen: (store: ShopStore) => void;
}) {
  const [src, setSrc] = useState(shopStoreLogoUrl(store));
  const [failed, setFailed] = useState(false);
  const isWordmark = store.logoType === "wordmark" && !failed;

  return (
    <Pressable
      onPress={() => onOpen(store)}
      style={({ pressed }) => [
        styles.tile,
        { width: tileWidth },
        pressed && styles.tilePressed,
      ]}
      accessibilityRole="link"
      accessibilityLabel={`Open ${store.name}`}
    >
      <View style={[styles.tileIcon, isWordmark && styles.tileIconWordmark]}>
        {failed ? (
          <Text style={styles.tileInitial} numberOfLines={1}>
            {store.name.slice(0, 2).toUpperCase()}
          </Text>
        ) : (
          <Image
            source={{ uri: src }}
            style={isWordmark ? styles.tileLogoWordmark : styles.tileLogo}
            contentFit="contain"
            onError={() => {
              const fallback = faviconUrl(store.url);
              if (fallback && src !== fallback) {
                setSrc(fallback);
                return;
              }
              setFailed(true);
            }}
            accessibilityIgnoresInvertColors
          />
        )}
      </View>
      <Text style={styles.tileName} numberOfLines={2}>
        {store.name}
      </Text>
    </Pressable>
  );
}

export function InstaHelpShopScreen({ embedded = false }: { embedded?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const matchesStore = useCallback(
    (store: ShopStore) => {
      if (!query) return true;
      const section = SHOP_STORE_SECTIONS.find((s) => s.id === store.category);
      return (
        store.name.toLowerCase().includes(query) ||
        Boolean(section?.title.toLowerCase().includes(query))
      );
    },
    [query],
  );

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return SHOP_STORES.filter(matchesStore);
  }, [isSearching, matchesStore]);

  const visibleSections = useMemo(() => {
    if (isSearching) return [];
    const sections =
      filter === "all"
        ? SHOP_STORE_SECTIONS
        : SHOP_STORE_SECTIONS.filter((s) => s.id === filter);
    return sections
      .map((section) => ({
        section,
        stores: SHOP_STORES.filter((s) => s.category === section.id),
      }))
      .filter((row) => row.stores.length > 0);
  }, [filter, isSearching]);

  const cols = 4;
  const hPad = 16;
  const gutter = 8;
  const tileWidth = Math.floor(
    (windowWidth - hPad * 2 - 14 * 2 - gutter * (cols - 1)) / cols,
  );

  const openStore = useCallback(async (store: ShopStore) => {
    const result = await openCuelinksTrackedUrl(store.url, {
      subid: store.id,
      subid2: Platform.OS,
      subid3: `shop-${store.category}`,
      source: "app",
      analyticsId: `shop-${store.id}`,
    });
    if (!result.ok) {
      await Linking.openURL(store.url).catch(() => {});
    }
  }, []);

  useEffect(() => {
    initializeCuelinks();
  }, []);

  const callSupport = useCallback(() => {
    void dialPhone(WEB_SHOP.supportPhoneTel);
  }, []);

  const selectFilter = useCallback((id: FilterId) => {
    setFilter(id);
    setSearch("");
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (text.trim()) setFilter("all");
  }, []);

  const topPad = embedded ? 8 : insets.top + 8;
  const hasResults = isSearching
    ? searchResults.length > 0
    : visibleSections.length > 0;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 96,
        }}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[1]}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topPad + 12 }]}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
              colors={[WEB_SHOP.gray50, WEB_SHOP.white]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <Text style={styles.heroTitle}>
            Shop smarter.{"\n"}
            <Text style={styles.heroTitleEm}>Best stores only.</Text>
          </Text>
        </View>

        {/* Sticky toolbar */}
        <View style={styles.toolbar}>
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={18}
              color={WEB_SHOP.gray400}
              style={styles.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search stores..."
              placeholderTextColor={WEB_SHOP.gray400}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              accessibilityLabel="Search stores"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={WEB_SHOP.gray300} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((chip) => {
              const active = filter === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => selectFilter(chip.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Sections */}
        <View style={styles.main}>
          {!hasResults ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={22} color={WEB_SHOP.gray400} />
              </View>
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptyBody}>
                Try another name or pick a category above.
              </Text>
            </View>
          ) : isSearching ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHead}>
                <View style={styles.catFallbackSearch}>
                  <Ionicons name="search" size={18} color={WEB_SHOP.accent} />
                </View>
                <View style={styles.sectionMeta}>
                  <Text style={styles.sectionTitle}>Search results</Text>
                  <Text style={styles.sectionSub}>
                    {searchResults.length} stores found
                  </Text>
                </View>
              </View>
              <View style={styles.grid}>
                {searchResults.map((store) => (
                  <StoreTile
                    key={store.id}
                    store={store}
                    tileWidth={tileWidth}
                    onOpen={openStore}
                  />
                ))}
              </View>
            </View>
          ) : (
            visibleSections.map(({ section, stores }) => (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHead}>
                  <View style={styles.catLogoWrap}>
                    <CategoryBadge section={section} size={44} />
                  </View>
                  <View style={styles.sectionMeta}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionSub}>
                      {stores.length} curated stores
                    </Text>
                  </View>
                </View>

                <View style={styles.grid}>
                  {stores.map((store) => (
                    <StoreTile
                      key={store.id}
                      store={store}
                      tileWidth={tileWidth}
                      onOpen={openStore}
                    />
                  ))}
                </View>
              </View>
            ))
          )}

          {/* CTA */}
          <View style={styles.ctaCard}>
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaTitle}>Need help placing an order?</Text>
              <Text style={styles.ctaBody}>
                Our team can find the best deal and coordinate delivery for you.
              </Text>
            </View>
            <Pressable
              onPress={callSupport}
              style={({ pressed }) => [
                styles.ctaBtn,
                pressed && styles.ctaBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Call ${WEB_SHOP.supportPhoneDisplay}`}
            >
              <Text style={styles.ctaBtnText}>
                Call {WEB_SHOP.supportPhoneDisplay}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.disclaimer}>
            InstaHelp Shop links you to official third-party websites. We are not
            affiliated with listed brands.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WEB_SHOP.white,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
    color: WEB_SHOP.black,
    textAlign: "center",
  },
  heroTitleEm: {
    color: WEB_SHOP.accent,
    fontWeight: "800",
  },
  toolbar: {
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WEB_SHOP.white,
    borderWidth: 1,
    borderColor: WEB_SHOP.gray200,
    borderRadius: WEB_SHOP.radiusPill,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 10,
  },
  searchIcon: {
    marginLeft: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: WEB_SHOP.black,
    paddingVertical: 12,
  },
  filtersRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
  },
  filterChip: {
    backgroundColor: WEB_SHOP.gray100,
    borderRadius: WEB_SHOP.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: WEB_SHOP.yellow,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: WEB_SHOP.black,
  },
  filterChipTextActive: {
    color: WEB_SHOP.black,
  },
  main: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: WEB_SHOP.white,
    borderWidth: 1,
    borderColor: WEB_SHOP.gray200,
    borderRadius: WEB_SHOP.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: WEB_SHOP.gray100,
  },
  catLogoWrap: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  catFallbackSearch: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WEB_SHOP.gray50,
    borderWidth: 1,
    borderColor: WEB_SHOP.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionMeta: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: WEB_SHOP.black,
  },
  sectionSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
    color: WEB_SHOP.gray400,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    rowGap: 12,
    justifyContent: "flex-start",
  },
  tile: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tilePressed: {
    transform: [{ scale: 0.96 }],
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: WEB_SHOP.gray50,
    borderWidth: 1,
    borderColor: WEB_SHOP.gray200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tileIconWordmark: {
    paddingHorizontal: 6,
  },
  tileLogo: {
    width: 40,
    height: 40,
  },
  tileLogoWordmark: {
    width: 48,
    height: 20,
  },
  tileInitial: {
    fontSize: 13,
    fontWeight: "700",
    color: WEB_SHOP.gray400,
  },
  tileName: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
    color: WEB_SHOP.gray700,
    maxWidth: "100%",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: WEB_SHOP.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: WEB_SHOP.black,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: WEB_SHOP.gray400,
    textAlign: "center",
  },
  ctaCard: {
    marginTop: 10,
    backgroundColor: WEB_SHOP.black,
    borderRadius: WEB_SHOP.radiusLg,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 14,
    alignItems: "stretch",
  },
  ctaCopy: {
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: WEB_SHOP.white,
    textAlign: "center",
  },
  ctaBody: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 18,
  },
  ctaBtn: {
    backgroundColor: WEB_SHOP.yellow,
    borderRadius: WEB_SHOP.radiusPill,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  ctaBtnPressed: {
    backgroundColor: WEB_SHOP.yellowDk,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: WEB_SHOP.black,
  },
  disclaimer: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 18,
    color: WEB_SHOP.gray400,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
