import { AppIcon } from "@/components/ui/AppIcon";
import { COLORS, RADIUS, SPRING } from "@/constants/designSystem";
import type { AppIconKey } from "@/constants/icons";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";

type Props = {
  name: AppIconKey;
  focused: boolean;
  color: string;
  size?: number;
};

/**
 * Liquid-glass tab glyph with a pop when the tab becomes active.
 */
export function GlassTabIcon({ name, focused, color, size = 22 }: Props) {
  return (
    <View style={styles.wrap}>
      <MotiView
        animate={{
          backgroundColor: focused ? COLORS.accent : "rgba(255,255,255,0)",
          scale: focused ? 1 : 0.88,
          translateY: focused ? 0 : 1,
        }}
        transition={{
          type: "spring",
          damping: SPRING.bouncy.damping,
          stiffness: SPRING.bouncy.stiffness,
          mass: SPRING.bouncy.mass,
        }}
        style={[
          styles.disc,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: RADIUS.pill,
          },
        ]}
      >
        <MotiView
          key={focused ? "on" : "off"}
          from={
            focused
              ? { scale: 0.65, opacity: 0.4 }
              : { scale: 1, opacity: 1 }
          }
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: SPRING.bouncy.damping,
            stiffness: SPRING.bouncy.stiffness,
            mass: SPRING.bouncy.mass,
          }}
        >
          <AppIcon
            name={name}
            size={size}
            color={focused ? "#FFFFFF" : color}
            filled={focused}
          />
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  disc: {
    alignItems: "center",
    justifyContent: "center",
  },
});
