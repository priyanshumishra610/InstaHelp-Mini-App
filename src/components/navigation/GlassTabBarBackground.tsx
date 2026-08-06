import { GLASS, RADIUS } from "@/constants/designSystem";
import { LAVENDER_GLOW } from "@/constants/theme";
import {
  glassPill,
  setGlassTabBarOrigin,
} from "@/components/navigation/glassTabPillShared";
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

/**
 * Floating liquid-glass capsule — high transparency, live blur, soft rim.
 */
export function GlassTabBarBackground() {
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

  const useLiveBlur = !reduceTransparency && Platform.OS !== "web";

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
        <View style={styles.surface}>
          {useLiveBlur ? (
            <BlurView
              intensity={Platform.OS === "ios" ? 72 : GLASS.blurTab}
              tint={
                Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "default"
              }
              experimentalBlurMethod={
                Platform.OS === "android" ? "dimezisBlurView" : undefined
              }
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          {/* Minimal wash — blur does the glass work */}
          <LinearGradient
            colors={
              useLiveBlur
                ? ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)"]
                : ["rgba(255,255,255,0.82)", "rgba(255,255,255,0.76)"]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Soft glass edge light */}
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
            style={styles.specular}
          />
          {/* Bottom refraction tint */}
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0)", "rgba(237,233,254,0.22)"]}
            style={styles.refraction}
          />
          <View style={styles.rim} />
          <View style={styles.innerGlow} />
        </View>
      </View>
      <Animated.View style={[styles.slidingPill, pillStyle]} />
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
    shadowColor: LAVENDER_GLOW,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 18,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor:
      Platform.OS === "android" ? "rgba(255,255,255,0.1)" : "transparent",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  refraction: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,
    height: 18,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    margin: 1,
  },
  slidingPill: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.4)",
  },
});
