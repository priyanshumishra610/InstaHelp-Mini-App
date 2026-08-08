import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { TourAnchor } from "@/components/onboarding/guided/TourAnchor";
import { AppIcon } from "@/components/ui/AppIcon";
import { Input } from "@/components/ui/Input";
import { SearchTypewriterPlaceholder } from "@/components/ui/SearchTypewriterPlaceholder";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MotiView } from "moti";
import { useState, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ExploreTabStat = {
  value: number;
  label: string;
  onPress?: () => void;
  hint?: string | null;
};

type Props = {
  title: string;
  subtitle: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchTypingPlaceholders?: string[];
  stat?: ExploreTabStat;
  statSlot?: ReactNode;
  searchTrailing?: ReactNode;
  variant?: "default" | "glass";
  heroSlot?: ReactNode;
  searchTourAnchorId?: string;
  showTagline?: boolean;
  /** Soft yellow sparkle over the brand mark (Experiences). */
  brandSparkle?: boolean;
  /** Override header canvas color. */
  canvasColor?: string;
};

const Box = PERF_MODE ? View : MotiView;

/** Shared explore header for Home + Experiences. Home uses glass + hero slot. */
export function ExploreTabHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchTypingPlaceholders,
  stat,
  statSlot,
  searchTrailing,
  variant = "default",
  heroSlot,
  searchTourAnchorId,
  showTagline = false,
  brandSparkle = false,
  canvasColor,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const isGlass = variant === "glass";

  const searchIconColor = focused ? colors.ink : colors.inkSubtle;
  const surfaceBg = colors.surface;
  const lineColor = colors.line;
  const glassWash = isDark ? "rgba(39,39,42,0.94)" : "rgba(255,255,255,0.92)";
  const glassRim = isDark ? "rgba(255,255,255,0.08)" : "rgba(28,25,23,0.08)";
  const searchBorder = isDark
    ? focused
      ? "rgba(255,255,255,0.18)"
      : "rgba(255,255,255,0.1)"
    : focused
      ? "#D6D3D1"
      : isGlass
        ? "rgba(28,25,23,0.1)"
        : "#E7E5E4";

  const statBody = stat ? (
    <>
      <AnimatedNumber
        value={stat.value}
        style={[
          styles.statValue,
          { fontFamily: AUTH_FONT.bold, color: colors.ink },
        ]}
      />
      <Text
        style={[
          styles.statLabel,
          { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
        ]}
      >
        {stat.label}
      </Text>
      {stat.hint ? (
        <Text
          style={[
            styles.statHint,
            { fontFamily: AUTH_FONT.semibold, color: colors.inkSubtle },
          ]}
        >
          {stat.hint}
        </Text>
      ) : null}
    </>
  ) : null;

  const statPillStyle = [
    styles.statPill,
    {
      backgroundColor: isGlass ? surfaceBg : colors.surfaceMuted,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(28,25,23,0.1)",
    },
    isGlass && styles.statPillGlass,
  ];

  const useTypingPlaceholder =
    Boolean(searchTypingPlaceholders?.length) &&
    searchValue.length === 0 &&
    !focused;

  const introProps = PERF_MODE
    ? { style: styles.introBlock }
    : {
        from: { opacity: 0, translateY: 8 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: "spring" as const, damping: 20, stiffness: 280 },
        style: styles.introBlock,
      };

  const searchWrapProps = PERF_MODE
    ? { style: styles.searchWrap }
    : {
        from: { opacity: 0, translateY: 12, scale: 0.98 },
        animate: { opacity: 1, translateY: 0, scale: 1 },
        transition: {
          type: "spring" as const,
          damping: 18,
          stiffness: 300,
          delay: 80,
        },
        style: styles.searchWrap,
      };

  const searchBarProps = PERF_MODE
    ? {
        style: [
          styles.searchBar,
          {
            backgroundColor: surfaceBg,
            borderColor: searchBorder,
          },
          !isGlass && cardShadow("sm"),
        ],
      }
    : {
        animate: { scale: focused || searchValue.length > 0 ? 1.02 : 1 },
        transition: { type: "spring" as const, damping: 20, stiffness: 400 },
        style: [
          styles.searchBar,
          {
            backgroundColor: surfaceBg,
            borderColor: searchBorder,
          },
          !isGlass && cardShadow("sm"),
        ],
      };

  const searchBlock = (
    <Box {...searchWrapProps}>
      <Box {...searchBarProps}>
        {isGlass ? (
          <View style={[styles.glassFill, { backgroundColor: glassWash }]} />
        ) : null}
        {isGlass ? (
          <View
            style={[
              styles.glassRim,
              { borderColor: glassRim },
            ]}
          />
        ) : null}
        <View style={styles.searchInner}>
          <AppIcon name="search" size={20} color={searchIconColor} />
          <View style={styles.inputWrap}>
            <Input
              value={searchValue}
              onChangeText={onSearchChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={useTypingPlaceholder ? " " : searchPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="never"
              className="border-0 bg-transparent py-3 text-[15px]"
              style={[styles.searchInput, { color: colors.ink }]}
              placeholderTextColor={colors.inkSubtle}
            />
            {useTypingPlaceholder && searchTypingPlaceholders ? (
              <SearchTypewriterPlaceholder
                phrases={searchTypingPlaceholders}
                active
                startDelayMs={400}
              />
            ) : null}
          </View>
          {searchValue.length > 0 ? (
            <Pressable
              onPress={() => onSearchChange("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text
                style={[
                  styles.clear,
                  { fontFamily: AUTH_FONT.semibold, color: colors.inkMuted },
                ]}
              >
                Clear
              </Text>
            </Pressable>
          ) : (
            searchTrailing
          )}
        </View>
      </Box>
    </Box>
  );

  return (
    <View
      style={[
        styles.root,
        isGlass && styles.rootGlass,
        {
          backgroundColor: canvasColor ?? (isGlass ? "transparent" : colors.canvas),
        },
      ]}
    >
      <Box {...introProps}>
        <View style={styles.topRow}>
          <View>
            <View style={styles.brandRow}>
              {brandSparkle ? <View style={styles.brandSparkle} /> : null}
              <Text
                style={[
                  styles.brand,
                  { fontFamily: AUTH_FONT.bold, color: colors.ink },
                ]}
              >
                InstaHelp
              </Text>
            </View>
            {showTagline ? (
              <Text
                style={[
                  styles.tagline,
                  { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
                ]}
              >
                We'll get it done.
              </Text>
            ) : null}
          </View>
          {statSlot ??
            (stat ? (
              stat.onPress ? (
                <Pressable
                  onPress={stat.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={`${stat.value} ${stat.label}`}
                  style={({ pressed }) => [
                    ...statPillStyle,
                    pressed && styles.statPillPressed,
                  ]}
                >
                  {isGlass ? (
                    <View style={[styles.glassFill, { backgroundColor: glassWash }]} />
                  ) : null}
                  {isGlass ? (
                    <View style={[styles.glassRim, { borderColor: glassRim }]} />
                  ) : null}
                  <View style={styles.statInner}>{statBody}</View>
                </Pressable>
              ) : (
                <View style={statPillStyle}>
                  {isGlass ? (
                    <View style={[styles.glassFill, { backgroundColor: glassWash }]} />
                  ) : null}
                  {isGlass ? (
                    <View style={[styles.glassRim, { borderColor: glassRim }]} />
                  ) : null}
                  <View style={styles.statInner}>{statBody}</View>
                </View>
              )
            ) : null)}
        </View>

        {heroSlot ? (
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Text
                style={[
                  styles.titleHero,
                  { fontFamily: AUTH_FONT.bold, color: colors.ink },
                ]}
              >
                {title}
              </Text>
              {typeof subtitle === "string" ? (
                <Text
                  style={[
                    styles.subtitle,
                    { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
                  ]}
                >
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )}
            </View>
            <View style={styles.heroVisualCol}>{heroSlot}</View>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.title,
                { fontFamily: AUTH_FONT.bold, color: colors.ink },
              ]}
            >
              {title}
            </Text>
            {typeof subtitle === "string" ? (
              <Text
                style={[
                  styles.subtitle,
                  { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
                ]}
              >
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </>
        )}
      </Box>

      {searchTourAnchorId ? (
        <TourAnchor id={searchTourAnchorId}>{searchBlock}</TourAnchor>
      ) : (
        searchBlock
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  rootGlass: {
    backgroundColor: "transparent",
  },
  introBlock: {
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    fontSize: 20,
    letterSpacing: -0.4,
  },
  brandRow: {
    position: "relative",
    alignSelf: "flex-start",
  },
  brandSparkle: {
    position: "absolute",
    top: -2,
    left: 7,
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#E8B84A",
    transform: [{ rotate: "20deg" }],
    zIndex: 1,
  },
  tagline: {
    marginTop: 1,
    fontSize: 11,
  },
  statPill: {
    alignItems: "flex-end",
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 72,
    overflow: "hidden",
    borderWidth: 1,
  },
  statPillGlass: {
    ...Platform.select({
      ios: {
        shadowColor: "#171717",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  statPillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  statInner: {
    zIndex: 1,
  },
  statValue: {
    fontSize: 18,
    lineHeight: 22,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    marginTop: 1,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statHint: {
    marginTop: 3,
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  titleHero: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 16,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
  },
  heroVisualCol: {
    flexShrink: 0,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: "100%",
  },
  searchWrap: {
    marginTop: 16,
    zIndex: 1,
  },
  searchBar: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 0 },
      default: {},
    }),
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    zIndex: 1,
  },
  inputWrap: {
    flex: 1,
    marginLeft: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 0,
    minHeight: 44,
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  glassRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: RADIUS.pill,
  },
  clear: {
    fontSize: 13,
  },
});
