import { RADIUS } from "@/constants/designSystem";
import { AUTH_PRIMARY } from "@/constants/authPremium";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const ICONS: Array<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
}> = [
  { icon: "hammer-wrench", tint: "rgba(23,23,23,0.08)" },
  { icon: "broom", tint: "rgba(120,113,108,0.12)" },
  { icon: "store-outline", tint: "rgba(23,23,23,0.06)" },
  { icon: "pipe-wrench", tint: "rgba(87,83,78,0.1)" },
  { icon: "snowflake", tint: "rgba(23,23,23,0.07)" },
  { icon: "truck-delivery-outline", tint: "rgba(120,113,108,0.1)" },
  { icon: "flower-outline", tint: "rgba(23,23,23,0.05)" },
  { icon: "wifi", tint: "rgba(87,83,78,0.08)" },
  { icon: "paw", tint: "rgba(120,113,108,0.11)" },
  { icon: "car-outline", tint: "rgba(23,23,23,0.08)" },
  { icon: "shield-home-outline", tint: "rgba(87,83,78,0.09)" },
  { icon: "silverware-fork-knife", tint: "rgba(120,113,108,0.1)" },
];

const CHIP = 36;
const GAP = 10;

function ServiceChip({
  icon,
  tint,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
}) {
  return (
    <View style={styles.chip}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      <View style={styles.chipRim} />
      <MaterialCommunityIcons name={icon} size={16} color={AUTH_PRIMARY} />
    </View>
  );
}

/** Static horizontal service icon row — no auto-scroll or looping animation. */
export function HomeHeroVisual() {
  return (
    <View style={styles.shell} pointerEvents="box-none">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CHIP + GAP}
        contentContainerStyle={styles.scrollContent}
      >
        {ICONS.map(({ icon, tint }) => (
          <ServiceChip key={icon} icon={icon} tint={tint} />
        ))}
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.98)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeLeft}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(255,255,255,0.98)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeRight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 8,
    marginBottom: 2,
    height: 44,
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: GAP,
    alignItems: "center",
  },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#171717",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  chipRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.05)",
    borderRadius: RADIUS.sm,
  },
  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
});
