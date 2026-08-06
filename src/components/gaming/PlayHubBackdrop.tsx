import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

/** Flat gaming backdrop — no glow orbs. */
export function PlayHubBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#070b1a", "#0f172a", "#111827"]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
