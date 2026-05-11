import type { QuickService } from "@/constants/quickServices";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View } from "react-native";

const MAP: Record<
  QuickService["icon"],
  ComponentProps<typeof Ionicons>["name"]
> = {
  clean: "sparkles-outline",
  bolt: "flash-outline",
  water: "water-outline",
  car: "car-outline",
  package: "cube-outline",
  briefcase: "briefcase-outline",
  plane: "airplane-outline",
  tool: "construct-outline",
};

export function ServiceIcon({
  icon,
  active,
}: {
  icon: QuickService["icon"];
  active?: boolean;
}) {
  return (
    <View
      className={`h-11 w-11 items-center justify-center rounded-2xl ${
        active ? "bg-accent" : "bg-accent dark:bg-accent"
      }`}
    >
      <Ionicons name={MAP[icon]} size={22} color="#ffffff" />
    </View>
  );
}
