import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";
import { GlassTabBarButton } from "@/components/navigation/GlassTabBarButton";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import {
  TAB_BAR_BASE_HEIGHT,
  TAB_BAR_FLOAT_GAP,
  TAB_BAR_FLOAT_INSET,
  TAB_BAR_HUBBLE_COVER_EXTRA,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_LINE_HEIGHT,
  TAB_BAR_LABEL_SIZE,
} from "@/constants/tabBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useShopTabStore } from "@/store/shopTabStore";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function isRouteVisible(key: string, props: BottomTabBarProps): boolean {
  const options = props.descriptors[key].options;
  if (options.tabBarItemStyle?.display === "none") return false;
  if ("href" in options && options.href === null) return false;
  if (options.tabBarButton === null) return false;
  return true;
}

/** Independent floating tab bar — zero padding, overlays content. */
export function FloatingTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const shopSection = useShopTabStore((s) => s.section);
  const activeTabName = state.routes[state.index]?.name;
  const coverHubbleFooter =
    activeTabName === "shop" && shopSection === "giftcards";

  const bottomOffset = Math.max(insets.bottom, 4) + TAB_BAR_FLOAT_GAP;
  const coverHeight =
    bottomOffset + TAB_BAR_BASE_HEIGHT + TAB_BAR_HUBBLE_COVER_EXTRA;
  const coverColor = isDark ? "#27272A" : "#FFFFFF";

  const visibleRoutes = state.routes.filter((route) =>
    isRouteVisible(route.key, props),
  );

  return (
    <>
      {coverHubbleFooter ? (
        <View
          pointerEvents="none"
          style={[
            styles.hubbleCover,
            { height: coverHeight, backgroundColor: coverColor },
          ]}
        />
      ) : null}
      <View
        pointerEvents="box-none"
        style={[styles.host, { bottom: bottomOffset, height: TAB_BAR_BASE_HEIGHT }]}
      >
        <View style={styles.bar}>
          <GlassTabBarBackground opaque={coverHubbleFooter} />
        <View style={styles.row}>
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const routeIndex = state.routes.findIndex((r) => r.key === route.key);
            const isFocused = state.index === routeIndex;
            const tint = isFocused ? colors.accent : colors.inkMuted;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const CustomButton = options.tabBarButton;
            if (CustomButton) {
              return (
                <CustomButton
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  style={styles.item}
                />
              );
            }

            const labelContent =
              typeof options.tabBarLabel === "function"
                ? options.tabBarLabel({
                    focused: isFocused,
                    color: tint,
                    position: "below-icon",
                    children: options.title ?? route.name,
                  })
                : options.tabBarLabel === false
                  ? null
                  : options.title ?? route.name;

            return (
              <GlassTabBarButton
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                style={styles.item}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: tint,
                  size: TAB_BAR_ICON_SIZE,
                })}
                {typeof labelContent === "string" ? (
                  <Text
                    style={[
                      styles.label,
                      {
                        color: tint,
                        fontFamily: AUTH_FONT.regular,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {labelContent}
                  </Text>
                ) : (
                  labelContent
                )}
              </GlassTabBarButton>
            );
          })}
        </View>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  hubbleCover: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 49,
  },
  host: {
    position: "absolute",
    left: TAB_BAR_FLOAT_INSET,
    right: TAB_BAR_FLOAT_INSET,
    zIndex: 50,
  },
  bar: {
    flex: 1,
    borderRadius: RADIUS.pill,
    overflow: "visible",
  },
  row: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "stretch",
  },
  item: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  label: {
    fontSize: TAB_BAR_LABEL_SIZE,
    lineHeight: TAB_BAR_LABEL_LINE_HEIGHT,
    letterSpacing: 0.05,
    marginTop: 2,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
