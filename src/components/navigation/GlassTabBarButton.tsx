import { slideGlassPillTo } from "@/components/navigation/glassTabPillShared";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type View as RNView } from "react-native";

/**
 * Tab item that drives the shared sliding active pill + press feedback.
 */
export function GlassTabBarButton({
  children,
  style,
  accessibilityState,
  onPressIn,
  onPressOut,
  ...rest
}: BottomTabBarButtonProps) {
  const focused = Boolean(accessibilityState?.selected);
  const [pressed, setPressed] = useState(false);
  const slotRef = useRef<RNView>(null);

  useEffect(() => {
    if (!focused) return;
    const id = requestAnimationFrame(() => {
      slotRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          slideGlassPillTo(x, y, width, height);
        }
      });
    });
    return () => cancelAnimationFrame(id);
  }, [focused]);

  return (
    <PlatformPressable
      {...rest}
      accessibilityState={accessibilityState}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[styles.pressable, style]}
    >
      <MotiView
        animate={{
          scale: pressed ? 0.92 : 1,
          opacity: pressed ? 0.88 : 1,
        }}
        transition={{ type: "timing", duration: 90 }}
        style={styles.slotOuter}
      >
        <View
          ref={slotRef}
          collapsable={false}
          style={styles.slot}
          onLayout={() => {
            if (!focused) return;
            slotRef.current?.measureInWindow((x, y, width, height) => {
              if (width > 0 && height > 0) {
                slideGlassPillTo(x, y, width, height);
              }
            });
          }}
        >
          {children}
        </View>
      </MotiView>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slotOuter: {
    flex: 1,
    alignSelf: "stretch",
  },
  slot: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    marginVertical: 4,
  },
});
