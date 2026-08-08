import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { EXP } from "@/constants/experienceTheme";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type FilterChip = {
  id: string | null;
  label: string;
};

type Props = {
  label?: string;
  labelIcon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  chips: FilterChip[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  activeColor?: string;
  onExpand?: () => void;
};

export function FilterChipRow({
  label,
  labelIcon,
  chips,
  selected,
  onSelect,
  activeColor = EXP.primary,
  onExpand,
}: Props) {
  return (
    <View style={styles.block}>
      {label ? (
        <View style={styles.labelRow}>
          {labelIcon ? (
            <AppIcon name={labelIcon} size={14} color={EXP.muted} />
          ) : null}
          <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
            {label}
          </Text>
        </View>
      ) : null}
      <View style={styles.chipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chipsScroll}
        >
          {chips.map((chip) => {
            const on = selected === chip.id;
            return (
              <Pressable
                key={`${chip.id ?? "all"}-${chip.label}`}
                onPress={() => onSelect(on && chip.id != null ? null : chip.id)}
                style={[
                  styles.chip,
                  on
                    ? { backgroundColor: activeColor, borderColor: activeColor }
                    : styles.chipIdle,
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      fontFamily: AUTH_FONT.semibold,
                      color: on ? "#fff" : EXP.ink,
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {onExpand ? (
          <Pressable
            onPress={onExpand}
            accessibilityRole="button"
            accessibilityLabel={`More ${label ?? "filters"}`}
            style={({ pressed }) => [
              styles.expandBtn,
              pressed && { opacity: 0.75 },
            ]}
          >
            <AppIcon name="chevron-down" size={18} color={EXP.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 14,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: EXP.ink,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: EXP.white,
    borderColor: EXP.line,
  },
  chipLabel: {
    fontSize: 12,
  },
  expandBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: EXP.line,
    backgroundColor: EXP.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
