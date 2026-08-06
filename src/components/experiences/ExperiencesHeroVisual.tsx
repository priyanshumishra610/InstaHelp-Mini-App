import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AUTH_PRIMARY, AUTH_PRIMARY_LIGHT } from "@/constants/authPremium";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";

const ICONS: Array<keyof typeof MaterialCommunityIcons.glyphMap> = [
  "bed-king-outline",
  "palm-tree",
  "airplane-takeoff",
];

export function ExperiencesHeroVisual() {
  return (
    <View style={styles.row} pointerEvents="none">
      {ICONS.map((icon, index) => (
        <MotiView
          key={icon}
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 200 + index * 80 }}
        >
          <MotiView
            from={{ translateY: 2 }}
            animate={{ translateY: -2 }}
            transition={{
              type: "timing",
              duration: 2600 + index * 180,
              loop: true,
            }}
          >
            <View style={styles.chip}>
              <MaterialCommunityIcons name={icon} size={15} color={AUTH_PRIMARY} />
            </View>
          </MotiView>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
    height: 36,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.12)",
    shadowColor: AUTH_PRIMARY_LIGHT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});
