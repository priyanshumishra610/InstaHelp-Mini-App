import { HUB_COLORS } from "@/constants/gamingHub";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export function GamingHubBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[HUB_COLORS.bgTop, HUB_COLORS.bgMid, HUB_COLORS.bgBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
