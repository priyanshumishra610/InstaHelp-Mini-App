import { StyleSheet, View } from "react-native";

export const WHITE_HEADER_BG = "#FFFFFF";
export const WHITE_SCREEN_BG = "#FFFFFF";
export const HEADER_LINE = "#E7E5E4";

export function WhiteStackHeaderBackground() {
  return <View style={styles.headerBg} />;
}

const styles = StyleSheet.create({
  headerBg: {
    flex: 1,
    backgroundColor: WHITE_HEADER_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEADER_LINE,
  },
});

export const whiteStackScreenOptions = {
  headerStyle: { backgroundColor: WHITE_HEADER_BG },
  headerBackground: () => <WhiteStackHeaderBackground />,
  headerShadowVisible: false,
  headerTintColor: "#171717",
  headerTitleStyle: {
    fontWeight: "600" as const,
    fontSize: 16,
    color: "#171717",
  },
  contentStyle: { backgroundColor: WHITE_SCREEN_BG },
};
