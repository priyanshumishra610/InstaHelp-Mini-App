import { ExperiencesHeroVisual } from "@/components/experiences/ExperiencesHeroVisual";
import { ExploreTabHeader } from "@/components/explore/ExploreTabHeader";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { EXP } from "@/constants/experienceTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CatalogMode = "resorts" | "holidays";

type Props = {
  greeting: string;
  query: string;
  onQueryChange: (value: string) => void;
  statusLine: string;
  propertyCount: number;
  mode?: CatalogMode;
  onFilterPress?: () => void;
};

export function ExperiencesExploreChrome({
  query,
  onQueryChange,
  statusLine,
  propertyCount,
  mode = "resorts",
  onFilterPress,
}: Props) {
  const isHolidays = mode === "holidays";

  return (
    <View style={styles.shell}>
      <ExploreTabHeader
        title={isHolidays ? "Holiday packages" : "Resorts & stays"}
        subtitle={
          statusLine.includes("Best prices")
            ? statusLine
            : `${statusLine} · Best prices`
        }
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder={
          isHolidays
            ? "Search destination, theme, or trip"
            : "Goa beach resort"
        }
        searchTypingPlaceholders={
          isHolidays
            ? ["Singapore luxury", "Thailand beaches", "Japan cherry blossom"]
            : ["Goa beach resort", "Kerala backwaters", "Rajasthan palace"]
        }
        brandSparkle
        canvasColor={EXP.canvas}
        heroSlot={<ExperiencesHeroVisual />}
        statSlot={
          <View style={styles.staysBadge}>
            <AppIcon name="star" size={14} color={EXP.gold} filled />
            <AnimatedNumber
              value={propertyCount}
              style={[styles.staysValue, { fontFamily: AUTH_FONT.bold }]}
            />
            <Text style={[styles.staysLabel, { fontFamily: AUTH_FONT.semibold }]}>
              {isHolidays ? "TRIPS" : "STAYS"}
            </Text>
          </View>
        }
        searchTrailing={
          <Pressable
            onPress={onFilterPress}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
            hitSlop={6}
            style={({ pressed }) => [
              styles.filterBtn,
              pressed && styles.filterBtnPressed,
            ]}
          >
            <AppIcon name="tune-variant" size={18} color="#FFFFFF" />
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: EXP.canvas,
  },
  staysBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: EXP.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: EXP.line,
    shadowColor: "#1B4D3E",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  staysValue: {
    fontSize: 14,
    lineHeight: 18,
    color: EXP.ink,
    fontVariant: ["tabular-nums"],
  },
  staysLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: EXP.ink,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: EXP.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
