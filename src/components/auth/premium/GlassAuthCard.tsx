import { AUTH_ACCENT_TEAL, AUTH_CARD_RADIUS_LG } from "@/constants/authPremium";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Props = PropsWithChildren<{
  style?: ViewStyle;
  elevated?: boolean;
  /** Thin accent bar at top (main login card) */
  accentEdge?: boolean;
}>;

export function GlassAuthCard({ children, style, elevated, accentEdge }: Props) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {accentEdge ? (
        <LinearGradient
          pointerEvents="none"
          colors={[AUTH_ACCENT_TEAL, AUTH_ACCENT_TEAL, "transparent"]}
          locations={[0, 0.35, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />
      ) : null}
      <View pointerEvents="none" style={styles.shine} />
      <View pointerEvents="none" style={styles.innerRim} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: AUTH_CARD_RADIUS_LG,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    overflow: "hidden",
    shadowColor: "#061229",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  elevated: {
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowOpacity: 0.32,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 22 },
    elevation: 18,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
  shine: {
    position: "absolute",
    top: -48,
    right: -36,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(37,99,235,0.06)",
  },
  innerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AUTH_CARD_RADIUS_LG,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
});
