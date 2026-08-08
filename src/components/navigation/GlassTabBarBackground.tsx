import { GLASS, RADIUS } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import {
  glassPill,
  setGlassTabBarOrigin,
} from "@/components/navigation/glassTabPillShared";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type View as RNView,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

type Props = {
  /** Solid opaque fill — hides content behind (Gift Cards / Hubble footer). */
  opaque?: boolean;
};

/** Floating grey glass capsule — frosted stone tint, soft shadow. */
export function GlassTabBarBackground({ opaque = false }: Props) {
  const { isDark } = useAppTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const shellRef = useRef<RNView>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((enabled) => {
        if (mounted) setReduceTransparency(Boolean(enabled));
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const useLiveBlur =
    !opaque && !PERF_MODE && !reduceTransparency && Platform.OS === "ios";

  const lightOpaque = "#FFFFFF";
  const darkOpaque = "#27272A";

  const pillStyle = useAnimatedStyle(() => ({
    opacity: glassPill.opacity.value,
    width: glassPill.w.value,
    height: glassPill.h.value,
    transform: [
      { translateX: glassPill.x.value },
      { translateY: glassPill.y.value },
    ],
  }));

  const syncBarOrigin = () => {
    shellRef.current?.measureInWindow((x, y) => {
      setGlassTabBarOrigin(x, y);
    });
  };

  return (
    <View
      ref={shellRef}
      style={styles.shell}
      pointerEvents="none"
      onLayout={syncBarOrigin}
      collapsable={false}
    >
      <View style={styles.shadowHost}>
        <View
          style={[
            styles.surface,
            opaque
              ? {
                  backgroundColor: isDark ? darkOpaque : lightOpaque,
                }
              : Platform.OS === "android"
                ? {
                    backgroundColor: isDark
                      ? "rgba(39,39,42,0.92)"
                      : "rgba(231,229,228,0.92)",
                  }
                : null,
          ]}
        >
          {useLiveBlur ? (
            <BlurView
              intensity={Platform.OS === "ios" ? 56 : GLASS.blurMedium}
              tint={isDark ? "dark" : "light"}
              experimentalBlurMethod={
                Platform.OS === "android" ? "dimezisBlurView" : undefined
              }
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <LinearGradient
            colors={
              opaque
                ? isDark
                  ? [darkOpaque, darkOpaque]
                  : [lightOpaque, lightOpaque]
                : isDark
                  ? useLiveBlur
                    ? ["rgba(63,63,70,0.55)", "rgba(39,39,42,0.38)"]
                    : ["rgba(39,39,42,0.94)", "rgba(28,28,31,0.9)"]
                  : useLiveBlur
                    ? ["rgba(168,162,158,0.34)", "rgba(245,245,244,0.48)"]
                    : ["rgba(214,211,209,0.92)", "rgba(231,229,228,0.88)"]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {!opaque ? (
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]
                  : ["rgba(255,255,255,0.42)", "rgba(255,255,255,0)"]
              }
              style={styles.specular}
            />
          ) : null}
          <View
            style={[
              styles.rim,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.55)",
              },
            ]}
          />
          <View
            style={[
              styles.innerStroke,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(120,113,108,0.12)",
              },
            ]}
          />
        </View>
      </View>
      <Animated.View
        style={[
          styles.slidingPill,
          pillStyle,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.42)",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(120,113,108,0.14)",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
  },
  shadowHost: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 10,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120,113,108,0.18)",
    backgroundColor: "transparent",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    margin: 1,
  },
  slidingPill: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
