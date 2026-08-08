import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";

/** Soft 3D store scene — static in perf mode. */
export function HomeStoreHeroVisual() {
  const { colors, isDark } = useAppTheme();
  const pinFill = isDark ? colors.ink : "#171717";
  const pinBorder = isDark ? colors.canvas : "#FFFFFF";
  const roof = isDark ? "#57534E" : "#D6D3D1";
  const awning = isDark ? "#78716C" : "#A8A29E";
  const body = isDark ? "#3F3F46" : "#E7E5E4";
  const bodyBorder = isDark ? "#52525B" : "#D6D3D1";
  const pane = isDark ? "#27272A" : "#FAFAF9";
  const sign = isDark ? "#D6D3D1" : "#57534E";

  return (
    <View style={styles.stage} pointerEvents="none">
      <View style={styles.scene}>
        <View style={styles.pinWrap}>
          <View
            style={[
              styles.pinHead,
              { backgroundColor: pinFill, borderColor: pinBorder },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color={isDark ? colors.canvas : "#FFFFFF"}
            />
          </View>
          <View style={[styles.pinStem, { backgroundColor: pinFill }]} />
        </View>

        <View style={styles.storeWrap}>
          <View style={[styles.storeRoof, { backgroundColor: roof }]}>
            <View style={[styles.storeAwning, { backgroundColor: awning }]} />
          </View>
          <View
            style={[
              styles.storeBody,
              { backgroundColor: body, borderColor: bodyBorder },
            ]}
          >
            <View style={styles.storeWindowRow}>
              <View
                style={[
                  styles.storeWindow,
                  { backgroundColor: pane, borderColor: bodyBorder },
                ]}
              />
              <View
                style={[
                  styles.storeWindow,
                  { backgroundColor: pane, borderColor: bodyBorder },
                ]}
              />
            </View>
            <View
              style={[
                styles.storeDoor,
                { backgroundColor: pane, borderColor: bodyBorder },
              ]}
            >
              <View
                style={[
                  styles.storeDoorHandle,
                  { backgroundColor: colors.inkMuted },
                ]}
              />
            </View>
          </View>
          <View style={[styles.storeBase, { backgroundColor: roof }]} />
          <Text
            style={[
              styles.storeSign,
              { fontFamily: AUTH_FONT.bold, color: sign },
            ]}
          >
            SHOP
          </Text>
        </View>

        <View style={styles.briefcaseWrap}>
          <View style={styles.briefcase}>
            <View style={styles.briefcaseLid} />
            <View style={styles.briefcaseHandle} />
            <View style={styles.briefcaseClasp} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 148,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  scene: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pinWrap: {
    position: "absolute",
    top: 0,
    right: 8,
    alignItems: "center",
    zIndex: 3,
  },
  pinHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#171717",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  pinStem: {
    width: 3,
    height: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -2,
  },
  storeWrap: {
    alignItems: "center",
    zIndex: 2,
  },
  storeRoof: {
    width: 96,
    height: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  storeAwning: {
    width: "100%",
    height: 6,
  },
  storeBody: {
    width: 96,
    height: 64,
    borderWidth: 1,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    ...cardShadow("sm"),
  },
  storeWindowRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  storeWindow: {
    width: 28,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
  },
  storeDoor: {
    marginTop: 6,
    alignSelf: "center",
    width: 22,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 3,
  },
  storeDoorHandle: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  storeBase: {
    width: 104,
    height: 6,
    borderRadius: 3,
    marginTop: -1,
  },
  storeSign: {
    position: "absolute",
    top: 18,
    fontSize: 7,
    letterSpacing: 1.2,
  },
  briefcaseWrap: {
    position: "absolute",
    left: 4,
    bottom: 18,
    zIndex: 1,
  },
  briefcase: {
    width: 44,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#292524",
    borderWidth: 1,
    borderColor: "#44403C",
    alignItems: "center",
    ...cardShadow("sm"),
  },
  briefcaseLid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: "#1C1917",
    borderBottomWidth: 1,
    borderBottomColor: "#44403C",
  },
  briefcaseHandle: {
    position: "absolute",
    top: -6,
    width: 18,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#57534E",
  },
  briefcaseClasp: {
    position: "absolute",
    top: 12,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#78716C",
  },
});
