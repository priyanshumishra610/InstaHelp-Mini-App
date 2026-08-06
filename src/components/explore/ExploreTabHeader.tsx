import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AppIcon } from "@/components/ui/AppIcon";
import { Input } from "@/components/ui/Input";
import { SearchTypewriterPlaceholder } from "@/components/ui/SearchTypewriterPlaceholder";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
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
  subtitle: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** When set, cycles typed hints in the search bar while empty. */
  searchTypingPlaceholders?: string[];
  stat?: ExploreTabStat;
  searchTrailing?: ReactNode;
  variant?: "default" | "glass";
  heroSlot?: ReactNode;
};

/** Shared explore header for Home + Experiences. Home uses glass + hero slot. */
export function ExploreTabHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchTypingPlaceholders,
  stat,
  searchTrailing,
  variant = "default",
  heroSlot,
}: Props) {
  const [focused, setFocused] = useState(false);
  const isGlass = variant === "glass";

  const statBody = stat ? (
    <>
      <AnimatedNumber
        value={stat.value}
        style={[styles.statValue, { fontFamily: AUTH_FONT.bold }]}
      />
      <Text style={[styles.statLabel, { fontFamily: AUTH_FONT.medium }]}>
        {stat.label}
      </Text>
      {stat.hint ? (
        <Text style={[styles.statHint, { fontFamily: AUTH_FONT.semibold }]}>
          {stat.hint}
        </Text>
      ) : null}
    </>
  ) : null;

  const statPillStyle = [
    styles.statPill,
    isGlass && styles.statPillGlass,
  ];

  const useTypingPlaceholder =
    Boolean(searchTypingPlaceholders?.length) &&
    searchValue.length === 0 &&
    !focused;

  return (
    <View style={[styles.root, isGlass && styles.rootGlass]}>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        style={styles.introBlock}
      >
        <View style={styles.topRow}>
          <MotiView
            from={{ opacity: 0, translateX: -8 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 420, delay: 40 }}
          >
            <Text style={[styles.brand, { fontFamily: AUTH_FONT.bold }]}>
              InstaHelp
            </Text>
          </MotiView>
          {stat ? (
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
                {isGlass ? <View style={styles.glassFill} /> : null}
                {isGlass ? <View style={styles.glassRim} /> : null}
                <View style={styles.statInner}>{statBody}</View>
              </Pressable>
            ) : (
              <View style={statPillStyle}>
                {isGlass ? <View style={styles.glassFill} /> : null}
                {isGlass ? <View style={styles.glassRim} /> : null}
                <View style={styles.statInner}>{statBody}</View>
              </View>
            )
          ) : null}
        </View>

        <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontFamily: AUTH_FONT.regular }]}>
          {subtitle}
        </Text>
        {heroSlot}
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 12, scale: 0.98 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 300, delay: 80 }}
        style={styles.searchWrap}
      >
        <MotiView
          animate={{
            scale: focused ? 1.01 : 1,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
          style={[
            styles.searchBar,
            isGlass && styles.searchBarGlass,
            focused && (isGlass ? styles.searchBarGlassFocused : styles.searchBarFocused),
            !isGlass && cardShadow("sm"),
          ]}
        >
          {isGlass ? <View style={styles.glassFill} /> : null}
          {isGlass ? <View style={styles.glassRim} /> : null}
          <View style={styles.searchInner}>
            <MotiView
              animate={{ scale: focused ? 1.08 : 1 }}
              transition={{ type: "spring", damping: 16, stiffness: 320 }}
            >
              <AppIcon
                name="magnify"
                size={20}
                color={focused ? "#171717" : "#A8A29E"}
              />
            </MotiView>
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
                className="border-0 bg-transparent py-3 text-[15px] text-neutral-900"
                style={styles.searchInput}
                placeholderTextColor="#A8A29E"
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
                <Text style={[styles.clear, { fontFamily: AUTH_FONT.semibold }]}>
                  Clear
                </Text>
              </Pressable>
            ) : (
              searchTrailing
            )}
          </View>
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
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
    fontSize: 15,
    letterSpacing: -0.3,
    color: "#171717",
  },
  statPill: {
    alignItems: "flex-end",
    borderRadius: RADIUS.md,
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 72,
    overflow: "hidden",
  },
  statPillGlass: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.1)",
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
    color: "#171717",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    marginTop: 1,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#78716C",
  },
  statHint: {
    marginTop: 3,
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: "#171717",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#78716C",
    maxWidth: "92%",
  },
  searchWrap: {
    marginTop: 16,
    zIndex: 1,
  },
  searchBar: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 0 },
      default: {},
    }),
  },
  searchBarGlass: {
    borderColor: "rgba(28,25,23,0.1)",
    backgroundColor: "#FFFFFF",
  },
  searchBarFocused: {
    borderColor: "#D6D3D1",
    backgroundColor: "#FFFFFF",
  },
  searchBarGlassFocused: {
    borderColor: "rgba(28,25,23,0.16)",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  glassRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.08)",
    borderRadius: RADIUS.lg,
  },
  clear: {
    fontSize: 13,
    color: "#57534E",
  },
});
