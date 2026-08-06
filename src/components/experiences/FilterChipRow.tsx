import { EXP } from "@/constants/experienceTheme";
import { Pressable, ScrollView, Text } from "react-native";

export type FilterChip = {
  id: string | null;
  label: string;
};

type Props = {
  label?: string;
  chips: FilterChip[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  activeColor?: string;
};

export function FilterChipRow({
  label,
  chips,
  selected,
  onSelect,
  activeColor = EXP.resorts.to,
}: Props) {
  return (
    <>
      {label ? (
        <Text
          style={{
            marginTop: 16,
            marginBottom: 8,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: EXP.muted,
          }}
        >
          {label}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        style={label ? undefined : { marginTop: 14 }}
      >
        {chips.map((chip) => {
          const on = selected === chip.id;
          return (
            <Pressable
              key={`${chip.id ?? "all"}-${chip.label}`}
              onPress={() => onSelect(on && chip.id != null ? null : chip.id)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 9,
                backgroundColor: on ? activeColor : EXP.white,
                borderWidth: 1,
                borderColor: on ? activeColor : EXP.line,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: on ? "#fff" : EXP.ink,
                }}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}
