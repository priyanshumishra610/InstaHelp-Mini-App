import { AppIcon } from "@/components/ui/AppIcon";
import { COLORS } from "@/constants/designSystem";
import { TAB_BAR_ICON_SIZE } from "@/constants/tabBar";
import type { AppIconKey } from "@/constants/icons";
import { StyleSheet, View } from "react-native";

type Props = {
  name: AppIconKey;
  focused: boolean;
  color: string;
  size?: number;
};

/** Compact tab glyph — outlined icons, color indicates active state. */
export function GlassTabIcon({
  name,
  focused,
  color,
  size = TAB_BAR_ICON_SIZE,
}: Props) {
  return (
    <View style={styles.wrap}>
      <AppIcon
        name={name}
        size={size}
        color={focused ? COLORS.accent : color}
        filled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: TAB_BAR_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
