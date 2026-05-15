import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function discoveryImpact(style: "light" | "medium" = "light") {
  if (Platform.OS === "web") return;
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
  };
  void Haptics.impactAsync(map[style]).catch(() => {});
}

export function discoverySelection() {
  if (Platform.OS === "web") return;
  void Haptics.selectionAsync().catch(() => {});
}
