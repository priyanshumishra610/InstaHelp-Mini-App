import { useAppTheme } from "@/hooks/useAppTheme";
import { View, StyleSheet } from "react-native";

export function VendorExploreListSkeleton() {
  const { isDark } = useAppTheme();
  const bone = isDark ? "rgba(255,255,255,0.08)" : "rgba(23,23,23,0.06)";
  const boneStrong = isDark ? "rgba(255,255,255,0.12)" : "rgba(23,23,23,0.08)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(23,23,23,0.06)";

  return (
    <View style={styles.wrap}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={`sk-${i}`} style={[styles.row, { borderBottomColor: divider }]}>
          <View style={[styles.avatar, { backgroundColor: bone }]} />
          <View style={styles.lines}>
            <View style={[styles.line, { width: "72%", backgroundColor: boneStrong }]} />
            <View style={[styles.lineSm, { width: "48%", backgroundColor: bone }]} />
            <View style={[styles.lineSm, { width: "86%", backgroundColor: bone }]} />
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  lines: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  line: {
    height: 14,
    borderRadius: 7,
  },
  lineSm: {
    height: 10,
    borderRadius: 5,
  },
});
