import { ShopWidgetCard } from "@/components/shop/ShopWidgetCard";
import { Screen } from "@/components/ui/Screen";
import {
  FLIPKART_BANNER_WIDGET,
  FLIPKART_SEARCH_WIDGET,
  SHOP_CATEGORIES,
  SHOP_SEARCH_PLACEHOLDERS,
  type ShopCategoryId,
} from "@/constants/shop";
import { buildFlipkartWidgetHtml } from "@/utils/flipkartWidgetHtml";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BANNER_HTML = buildFlipkartWidgetHtml(FLIPKART_BANNER_WIDGET);
const SEARCH_HTML = buildFlipkartWidgetHtml(FLIPKART_SEARCH_WIDGET);

const BANNER_ASPECT = FLIPKART_BANNER_WIDGET.width / FLIPKART_BANNER_WIDGET.height;
const SEARCH_ASPECT = FLIPKART_SEARCH_WIDGET.width / FLIPKART_SEARCH_WIDGET.height;

const CATEGORY_COPY: Partial<
  Record<ShopCategoryId, { banner: string; search: string }>
> = {
  electronics: {
    banner: "Top electronics picks & launch deals",
    search: "Search phones, laptops & gadgets",
  },
  beauty: {
    banner: "Beauty bestsellers & self-care",
    search: "Search skincare, makeup & wellness",
  },
  travel: {
    banner: "Travel essentials & luggage",
    search: "Search bags, accessories & gear",
  },
  gaming: {
    banner: "Gaming gear & accessories",
    search: "Search consoles, controllers & more",
  },
  fashion: {
    banner: "Fashion trends & wardrobe staples",
    search: "Search apparel, footwear & bags",
  },
  decor: {
    banner: "Home decor & lifestyle upgrades",
    search: "Search furniture, lighting & decor",
  },
  gifts: {
    banner: "Gift ideas for every occasion",
    search: "Search curated gift picks",
  },
};

function ShopSearchBar() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderOpacity = useSharedValue(1);

  useEffect(() => {
    const id = setInterval(() => {
      placeholderOpacity.value = withSequence(
        withTiming(0, { duration: 180 }),
        withTiming(1, { duration: 220 }),
      );
      setPlaceholderIndex((i) => (i + 1) % SHOP_SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [placeholderOpacity]);

  const placeholderStyle = useAnimatedStyle(() => ({
    opacity: placeholderOpacity.value,
  }));

  const glow = useSharedValue(0.4);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 2200 }),
        withTiming(0.4, { duration: 2200 }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.searchWrap}>
      <Animated.View style={[styles.searchGlow, glowStyle]} pointerEvents="none" />
      <View style={styles.searchCard}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={36} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(240,246,255,0.9)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#004aad" />
          <Animated.Text
            style={[styles.searchPlaceholder, placeholderStyle]}
            numberOfLines={1}
          >
            {SHOP_SEARCH_PLACEHOLDERS[placeholderIndex]}
          </Animated.Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice search preview"
            hitSlop={8}
            style={styles.micBtn}
          >
            <Ionicons name="mic-outline" size={20} color="#525252" />
          </Pressable>
        </View>
      </View>
      <Text style={styles.searchHint}>
        Tap widgets below to browse — search bar is visual preview only
      </Text>
    </Animated.View>
  );
}

function ShopCategoryTabs({
  active,
  onChange,
}: {
  active: ShopCategoryId;
  onChange: (id: ShopCategoryId) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(160)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const on = active === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onChange(cat.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={styles.tabPressable}
            >
              {on ? (
                <LinearGradient
                  colors={["#003a85", "#004aad", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabPillActive}
                >
                  <Text style={styles.tabLabelActive}>{cat.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabPill}>
                  <Text style={styles.tabLabel}>{cat.label}</Text>
                </View>
              )}
              {on ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

export function InstaHelpShopScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ShopCategoryId>("all");

  const copy = useMemo(() => {
    if (category === "all") {
      return {
        banner: "Featured deals & seasonal offers",
        search: "Search across Flipkart catalog",
      };
    }
    return (
      CATEGORY_COPY[category] ?? {
        banner: "Curated picks for you",
        search: "Search products",
      }
    );
  }, [category]);

  const showBanner =
    category === "all" ||
    ["electronics", "fashion", "gifts", "travel"].includes(category);

  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2400 }),
        withTiming(4, { duration: 2400 }),
      ),
      -1,
      true,
    );
  }, [floatY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <Screen className="bg-[#f4f7fc]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140 + insets.bottom,
        }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <LinearGradient
            colors={["#003a85", "#004aad", "#1e5bb8", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {Platform.OS === "ios" ? (
            <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.headerOrb1} pointerEvents="none" />
          <View style={styles.headerOrb2} pointerEvents="none" />

          <Animated.View entering={FadeIn.duration(400)} style={styles.headerContent}>
            <View style={styles.previewPill}>
              <Ionicons name="flask-outline" size={12} color="#ffd500" />
              <Text style={styles.previewPillText}>Widget preview</Text>
            </View>
            <Text style={styles.headerTitle}>InstaHelp Shop</Text>
            <Text style={styles.headerSubtitle}>
              Discover trending products & deals
            </Text>
          </Animated.View>
        </View>

        <View style={styles.body}>
          <ShopSearchBar />
          <ShopCategoryTabs active={category} onChange={setCategory} />

          <Animated.View style={floatStyle}>
            {showBanner ? (
              <ShopWidgetCard
                title="Deals banner"
                subtitle={copy.banner}
                html={BANNER_HTML}
                aspectRatio={BANNER_ASPECT}
                delay={200}
                badge="Flipkart"
              />
            ) : null}

            <View style={showBanner ? styles.cardGap : undefined}>
              <ShopWidgetCard
                title="Product search"
                subtitle={copy.search}
                html={SEARCH_HTML}
                aspectRatio={SEARCH_ASPECT}
                delay={showBanner ? 280 : 200}
                badge="Live embed"
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(420).delay(340)}
            style={styles.disclaimer}
          >
            <Ionicons name="information-circle-outline" size={16} color="#737373" />
            <Text style={styles.disclaimerText}>
              Prototype only — no checkout or cart. Use this screen to judge how
              Flipkart affiliate widgets feel inside InstaHelp.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  headerOrb1: {
    position: "absolute",
    right: -24,
    top: 12,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerOrb2: {
    position: "absolute",
    left: -20,
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,213,0,0.15)",
  },
  headerContent: {
    paddingTop: 8,
  },
  previewPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  previewPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "500",
    maxWidth: 300,
  },
  body: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  searchWrap: {
    marginBottom: 16,
  },
  searchGlow: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 6,
    bottom: 28,
    borderRadius: 20,
    backgroundColor: "#004aad",
  },
  searchCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    shadowColor: "#004aad",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#525252",
  },
  micBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,74,173,0.08)",
  },
  searchHint: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  tabsContent: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 8,
  },
  tabPressable: {
    alignItems: "center",
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.1)",
  },
  tabPillActive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#004aad",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#525252",
  },
  tabLabelActive: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  tabUnderline: {
    marginTop: 6,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#ffd500",
    shadowColor: "#ffd500",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  cardGap: {
    marginTop: 16,
  },
  disclaimer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.08)",
    padding: 14,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#737373",
    fontWeight: "500",
  },
});
