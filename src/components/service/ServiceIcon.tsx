import type { QuickService } from "@/constants/quickServices";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconKey } from "@/constants/icons";
import { View } from "react-native";

const MAP: Record<QuickService["icon"], AppIconKey> = {
  clean: "sparkles",
  bolt: "flash",
  water: "water",
  car: "car",
  package: "package",
  briefcase: "briefcase",
  plane: "plane",
  tool: "tool",
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
        active ? "bg-accent" : "bg-accent"
      }`}
    >
      <AppIcon name={MAP[icon]} size={22} color="#ffffff" filled />
    </View>
  );
}
