import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";

/** Soft tropical resort silhouette behind the Experiences hero copy. */
export function ExperiencesHeroVisual() {
  return (
    <View style={styles.root} pointerEvents="none">
      <LinearGradient
        colors={["rgba(250,248,244,0)", "rgba(232,242,238,0.55)", "rgba(246,235,215,0.4)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wash}
      />
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 520, delay: 120 }}
        style={styles.scene}
      >
        <View style={styles.sun} />
        <MaterialCommunityIcons
          name="palm-tree"
          size={46}
          color="rgba(27,77,62,0.18)"
          style={styles.palmLeft}
        />
        <MaterialCommunityIcons
          name="palm-tree"
          size={38}
          color="rgba(27,77,62,0.14)"
          style={styles.palmRight}
        />
        <View style={styles.building}>
          <View style={styles.roof} />
          <View style={styles.facade} />
        </View>
        <MaterialCommunityIcons
          name="waves"
          size={28}
          color="rgba(27,77,62,0.12)"
          style={styles.waves}
        />
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 128,
    height: 96,
    overflow: "hidden",
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  sun: {
    position: "absolute",
    top: 10,
    right: 22,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(232,184,74,0.55)",
  },
  palmLeft: {
    position: "absolute",
    left: 4,
    bottom: 10,
  },
  palmRight: {
    position: "absolute",
    right: 8,
    bottom: 16,
  },
  building: {
    alignItems: "center",
    marginBottom: 2,
  },
  roof: {
    width: 48,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "rgba(27,77,62,0.16)",
  },
  facade: {
    width: 40,
    height: 28,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: "rgba(27,77,62,0.12)",
    borderWidth: 1,
    borderColor: "rgba(27,77,62,0.08)",
  },
  waves: {
    marginTop: 2,
    opacity: 0.9,
  },
});
