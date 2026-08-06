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
  ...SHOP_STORE_SECTIONS.map((s) => ({
    id: s.id as FilterId,
    label: s.title.replace(/ Stores$/, ""),
  })),
];

const COLS = 4;
const H_PAD = 20;
const COL_GAP = 16;
const ROW_GAP = 18;
const SECTION_GAP = 32;
const NAME_LINES = 2;
const NAME_LINE_HEIGHT = 14;
const NAME_HEIGHT = NAME_LINES * NAME_LINE_HEIGHT;

function chunkRows<T>(items: T[], cols: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }
  return rows;
}

function CategoryBadge({
  section,
  size = 36,
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
        borderRadius: size * 0.28,
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
  const iconSize = tileWidth;
  const radius = Math.round(iconSize * 0.26);
  const logoBox = Math.round(iconSize * 0.58);
  const wordmarkW = Math.round(iconSize * 0.72);
  const wordmarkH = Math.round(iconSize * 0.32);

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
      <View
        style={[
          styles.tileIcon,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: radius,
          },
          isWordmark && styles.tileIconWordmark,
        ]}
      >
        {failed ? (
          <Text
            style={[
              styles.tileInitial,
              { fontSize: Math.round(iconSize * 0.26) },
            ]}
          >
            {store.name.slice(0, 2).toUpperCase()}
          </Text>
        ) : (
          <Image
            source={{ uri: src }}
            style={
              isWordmark
                ? { width: wordmarkW, height: wordmarkH }
                : { width: logoBox, height: logoBox }
            }
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
      <Text style={styles.tileName} numberOfLines={NAME_LINES}>
        {store.name}
      </Text>
    </Pressable>
  );
}

function StoreGrid({
  stores,
  tileWidth,
  onOpen,
}: {
  stores: ShopStore[];
  tileWidth: number;
  onOpen: (store: ShopStore) => void;
}) {
  const rows = useMemo(() => chunkRows(stores, COLS), [stores]);

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.gridRow}>
          {Array.from({ length: COLS }, (_, colIndex) => {
            const store = row[colIndex];
            if (!store) {
              return (
                <View
                  key={`spacer-${rowIndex}-${colIndex}`}
                  style={{ width: tileWidth }}
                />
              );
            }
            return (
              <StoreTile
                key={store.id}
                store={store}
                tileWidth={tileWidth}
                onOpen={onOpen}
              />
            );
          })}
        </View>
      ))}
    </View>
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

  const contentWidth = windowWidth - H_PAD * 2;
  const tileWidth = Math.floor(
    (contentWidth - COL_GAP * (COLS - 1)) / COLS,
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

  const topPad = embedded ? 4 : insets.top + 8;
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
        <View style={[styles.hero, { paddingTop: topPad + 10 }]}>
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
          <Text style={styles.heroSub}>
            Tap a store to open deals in your browser
          </Text>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={17}
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
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionMeta}>
                  <Text style={styles.sectionTitle}>Results</Text>
                  <Text style={styles.sectionSub}>
                    {searchResults.length}{" "}
                    {searchResults.length === 1 ? "store" : "stores"}
                  </Text>
                </View>
              </View>
              <StoreGrid
                stores={searchResults}
                tileWidth={tileWidth}
                onOpen={openStore}
              />
            </View>
          ) : (
            visibleSections.map(({ section, stores }) => (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHead}>
                  <CategoryBadge section={section} size={36} />
                  <View style={styles.sectionMeta}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionSub}>
                      {stores.length}{" "}
                      {stores.length === 1 ? "store" : "stores"}
                    </Text>
                  </View>
                </View>

                <StoreGrid
                  stores={stores}
                  tileWidth={tileWidth}
                  onOpen={openStore}
                />
              </View>
            ))
          )}

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
              <Ionicons name="call" size={15} color={WEB_SHOP.black} />
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
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 32,
    color: WEB_SHOP.black,
    textAlign: "center",
  },
  heroTitleEm: {
    color: WEB_SHOP.accent,
    fontWeight: "800",
  },
  heroSub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    color: WEB_SHOP.gray400,
    textAlign: "center",
  },
  toolbar: {
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WEB_SHOP.gray50,
    borderWidth: 1,
    borderColor: WEB_SHOP.gray200,
    borderRadius: WEB_SHOP.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginHorizontal: H_PAD,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    marginLeft: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: WEB_SHOP.black,
    paddingVertical: 11,
  },
  filtersRow: {
    gap: 8,
    paddingHorizontal: H_PAD,
    paddingVertical: 2,
  },
  filterChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WEB_SHOP.gray100,
    borderRadius: WEB_SHOP.radiusPill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: WEB_SHOP.yellow,
    borderColor: "rgba(0,0,0,0.06)",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: WEB_SHOP.gray700,
  },
  filterChipTextActive: {
    color: WEB_SHOP.black,
    fontWeight: "700",
  },
  main: {
    paddingHorizontal: H_PAD,
    paddingTop: 20,
    gap: SECTION_GAP,
  },
  section: {
    gap: 16,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.35,
    color: WEB_SHOP.black,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: "500",
    color: WEB_SHOP.gray400,
  },
  grid: {
    gap: ROW_GAP,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tile: {
    alignItems: "center",
    gap: 8,
  },
  tilePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  tileIcon: {
    backgroundColor: WEB_SHOP.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WEB_SHOP.gray200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tileIconWordmark: {
    paddingHorizontal: 6,
    backgroundColor: WEB_SHOP.gray50,
  },
  tileInitial: {
    fontWeight: "700",
    color: WEB_SHOP.gray400,
  },
  tileName: {
    height: NAME_HEIGHT,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: NAME_LINE_HEIGHT,
    color: WEB_SHOP.gray700,
    width: "100%",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
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
    fontSize: 18,
    fontWeight: "700",
    color: WEB_SHOP.black,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: WEB_SHOP.gray400,
    textAlign: "center",
  },
  ctaCard: {
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.25,
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
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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
    marginTop: -8,
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 17,
    color: WEB_SHOP.gray400,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
