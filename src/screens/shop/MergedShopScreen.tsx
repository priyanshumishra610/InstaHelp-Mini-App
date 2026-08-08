import { HubbleWebViewScreen } from "@/screens/giftcards/HubbleWebViewScreen";
import { InstaHelpShopScreen } from "@/screens/shop/InstaHelpShopScreen";
import {
  SHOP_GREEN,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShopTabStore } from "@/store/shopTabStore";

type ShopSection = "shop" | "giftcards";

const SECTIONS: { id: ShopSection; label: string }[] = [
  { id: "giftcards", label: "Gift Cards" },
  { id: "shop", label: "Shop" },
];

function resolveInitialSection(
  sectionParam: string | undefined,
  hasGiftCardDeepLink: boolean,
): ShopSection {
  if (sectionParam === "shop") return "shop";
  if (sectionParam === "giftcards" || hasGiftCardDeepLink) return "giftcards";
  return "giftcards";
}

export function MergedShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    section?: string;
    sdkPath?: string;
    brandId?: string;
    category?: string;
  }>();

  const hasGiftCardDeepLink = useMemo(
    () =>
      Boolean(params.sdkPath || params.brandId || params.category),
    [params.brandId, params.category, params.sdkPath],
  );

  const sectionParam =
    typeof params.section === "string" ? params.section : undefined;

  const [section, setSection] = useState<ShopSection>(() =>
    resolveInitialSection(sectionParam, hasGiftCardDeepLink),
  );
  const syncShopTabSection = useShopTabStore((s) => s.setSection);

  useEffect(() => {
    syncShopTabSection(section);
  }, [section, syncShopTabSection]);

  useEffect(() => {
    const next = resolveInitialSection(sectionParam, hasGiftCardDeepLink);
    setSection(next);
  }, [sectionParam, hasGiftCardDeepLink]);

  const selectSection = useCallback(
    (next: ShopSection) => {
      setSection(next);
      router.navigate({
        pathname: "/(tabs)/shop",
        params: next === "giftcards" ? { section: "giftcards" } : { section: "shop" },
      });
    },
    [router],
  );

  const exitGiftCards = useCallback(() => {
    selectSection("shop");
  }, [selectSection]);

  return (
    <View style={styles.root}>
      <View style={[styles.segmentBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.segmentTrack}>
          {SECTIONS.map((item) => {
            const active = section === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => selectSection(item.id)}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.label}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    active && styles.segmentLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.content}>
        {section === "shop" ? (
          <InstaHelpShopScreen embedded />
        ) : (
          <HubbleWebViewScreen embedded onExit={exitGiftCards} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  segmentBar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  segmentTrack: {
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
  },
  segmentBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: SHOP_TEXT_MUTED,
  },
  segmentLabelActive: {
    color: SHOP_GREEN,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
