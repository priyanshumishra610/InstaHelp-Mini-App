import { ExploreGlassCard } from "@/components/vendors/ExploreGlassCard";
import { RADIUS } from "@/constants/designSystem";
import { ACCENT } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onPress: () => void;
  serviceLabel?: string | null;
};

export function RequestFormTrigger({ onPress, serviceLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open service request form"
      className="mt-4 active:opacity-92"
    >
      <ExploreGlassCard radius={RADIUS.xl} intensity="medium">
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-1 pr-3">
            <Text
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: ACCENT }}
            >
              Concierge request
            </Text>
            <Text className="mt-1 text-[18px] font-extrabold text-neutral-950">
              Get it done today
            </Text>
            <Text className="mt-1 text-[12px] font-medium text-neutral-500">
              {serviceLabel
                ? `${serviceLabel} — tap to complete your request`
                : "Tap to tell us your task — we handle the rest"}
            </Text>
          </View>
          <View style={styles.arrow}>
            <Text className="text-[18px] font-medium" style={{ color: ACCENT }}>
              →
            </Text>
          </View>
        </View>
      </ExploreGlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23,23,23,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.14)",
  },
});
