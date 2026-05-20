import { AUTH_ACCENT_TEAL, AUTH_PRIMARY, AUTH_FONT } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const BADGES: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  top: number;
  left?: number;
  right?: number;
}[] = [
  { icon: "flash", label: "Electric", top: 4, left: 8 },
  { icon: "water-outline", label: "Plumber", top: 36, right: 4 },
  { icon: "car", label: "Delivery", top: 68, left: 20 },
  { icon: "sparkles", label: "Beauty", top: 52, left: 52 },
];

export function ServiceIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={AUTH_PRIMARY} />
        </View>
        <View style={styles.helperRing}>
          <Ionicons name="headset" size={16} color="#fff" />
        </View>
      </View>
      {BADGES.map((b) => (
        <View
          key={b.label}
          style={[
            styles.badge,
            { top: b.top, left: b.left, right: b.right },
          ]}
        >
          <Ionicons name={b.icon} size={11} color={AUTH_PRIMARY} />
          <Text style={[styles.badgeText, { fontFamily: AUTH_FONT.semibold }]}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 108,
    marginBottom: 12,
    position: "relative",
  },
  hero: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${AUTH_ACCENT_TEAL}44`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(37,99,235,0.15)",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  helperRing: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AUTH_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.12)",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 9,
    color: "#1e3a5f",
  },
});
