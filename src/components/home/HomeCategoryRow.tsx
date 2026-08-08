import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type CategoryItem = {
  id: string;
  label: string;
  icon: Parameters<typeof AppIcon>[0]["name"];
  filter?: string | null;
};

const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "All", icon: "view-grid-outline", filter: null },
  { id: "wifi", label: "Wi-Fi", icon: "wifi", filter: "Smart Home" },
  { id: "pets", label: "Pets", icon: "paw", filter: "Pet" },
  { id: "transport", label: "Transport", icon: "car", filter: "Transport" },
  { id: "security", label: "Security", icon: "shield", filter: "Security" },
  { id: "food", label: "Food", icon: "silverware-fork-knife", filter: "Food" },
  { id: "home", label: "Home", icon: "home-outline", filter: "Home" },
  { id: "more", label: "More", icon: "dots-horizontal", filter: null },
];

type Props = {
  activeFilter: string | null;
  onSelect: (filter: string | null) => void;
  onOpenMore?: () => void;
};

export function HomeCategoryRow({ activeFilter, onSelect, onOpenMore }: Props) {
  const { colors, isDark } = useAppTheme();
  const activeId =
    activeFilter == null
      ? "all"
      : CATEGORIES.find((c) => c.filter === activeFilter)?.id ?? "all";

  const activeFill = isDark ? colors.ink : colors.accent;
  const activeFg = isDark ? colors.canvas : colors.accentForeground;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {CATEGORIES.map((cat) => {
        const active = cat.id === activeId;
        const isMore = cat.id === "more";

        return (
          <View key={cat.id}>
            <Pressable
              onPress={() => {
                if (isMore) {
                  onOpenMore?.();
                  return;
                }
                onSelect(cat.filter ?? null);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                !active && cardShadow("sm"),
                pressed && styles.chipPressed,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: active ? activeFill : colors.surface,
                    borderColor: active ? activeFill : colors.line,
                  },
                ]}
              >
                <AppIcon
                  name={cat.icon}
                  size={20}
                  color={active ? activeFg : colors.ink}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: active ? AUTH_FONT.semibold : AUTH_FONT.medium,
                    color: active ? colors.ink : colors.inkMuted,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const CHIP = 56;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    width: CHIP,
    alignItems: "center",
    gap: 6,
  },
  chipActive: {},
  chipPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  iconBox: {
    width: CHIP,
    height: CHIP,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
});
