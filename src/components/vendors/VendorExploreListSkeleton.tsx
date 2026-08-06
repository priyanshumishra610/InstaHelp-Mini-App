import { AUTH_PRIMARY } from "@/constants/authPremium";
import { View, StyleSheet } from "react-native";

export function VendorExploreListSkeleton() {
  return (
    <View style={styles.wrap}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={`sk-${i}`} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.lines}>
            <View style={[styles.line, { width: "72%" }]} />
            <View style={[styles.lineSm, { width: "48%" }]} />
            <View style={[styles.lineSm, { width: "86%" }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,74,173,0.06)",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(0,74,173,0.06)",
  },
  lines: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,74,173,0.08)",
  },
  lineSm: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0,74,173,0.05)",
  },
});
