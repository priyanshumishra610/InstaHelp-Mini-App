import { TutorialTarget } from "@/components/onboarding/TutorialTarget";
import { TAB_BAR_BASE_HEIGHT } from "@/constants/tabBar";
import {
  type FabPosition,
  type FabSlotId,
  useFabPositionStore,
} from "@/store/fabPositionStore";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAB_GAP = 16;
const EDGE_PAD = 12;
const DEFAULT_WIDTH = 148;
const DEFAULT_HEIGHT = 52;

type Anchor = "bottom-left" | "bottom-right";

type Props = {
  id: FabSlotId;
  tutorialId: string;
  defaultAnchor: Anchor;
  onPress: () => void;
  children: React.ReactNode;
  offsetTabBar?: boolean;
  entranceDelayMs?: number;
  accessibilityLabel: string;
};

function clamp(n: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(n, min), max);
}

/** Floating action chip that can be dragged; position persists across launches. */
export function DraggableFab({
  id,
  tutorialId,
  defaultAnchor,
  onPress,
  children,
  offsetTabBar = true,
  entranceDelayMs = 220,
  accessibilityLabel,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const saved = useFabPositionStore((s) => s.positions[id]);
  const setPosition = useFabPositionStore((s) => s.setPosition);

  const [size, setSize] = useState({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });
  const [hydrated, setHydrated] = useState(
    () => useFabPositionStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useFabPositionStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useFabPositionStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  const minBottom = useMemo(() => {
    const bottomInset = Math.max(insets.bottom, 8);
    return offsetTabBar
      ? TAB_BAR_BASE_HEIGHT + bottomInset + FAB_GAP + 4
      : bottomInset + FAB_GAP;
  }, [insets.bottom, offsetTabBar]);

  const maxBottom = Math.max(minBottom, screenH - insets.top - size.h - EDGE_PAD);
  const minLeft = EDGE_PAD;
  const maxLeft = Math.max(minLeft, screenW - size.w - EDGE_PAD);

  const defaultPos = useMemo((): FabPosition => {
    const left =
      defaultAnchor === "bottom-left"
        ? EDGE_PAD + 4
        : Math.max(minLeft, screenW - size.w - EDGE_PAD - 4);
    return { left, bottom: minBottom };
  }, [defaultAnchor, minBottom, minLeft, screenW, size.w]);

  const resolvePos = useCallback(
    (pos: FabPosition | undefined): FabPosition => {
      const base = pos ?? defaultPos;
      return {
        left: Math.min(Math.max(base.left, minLeft), maxLeft),
        bottom: Math.min(Math.max(base.bottom, minBottom), maxBottom),
      };
    },
    [defaultPos, maxBottom, maxLeft, minBottom, minLeft],
  );

  const left = useSharedValue(defaultPos.left);
  const bottom = useSharedValue(defaultPos.bottom);
  const startLeft = useSharedValue(defaultPos.left);
  const startBottom = useSharedValue(defaultPos.bottom);
  const scale = useSharedValue(1);
  const dragging = useSharedValue(false);

  useEffect(() => {
    if (!hydrated) return;
    const next = resolvePos(saved);
    left.value = next.left;
    bottom.value = next.bottom;
  }, [hydrated, saved, resolvePos, left, bottom]);

  useEffect(() => {
    const next = resolvePos({ left: left.value, bottom: bottom.value });
    left.value = next.left;
    bottom.value = next.bottom;
  }, [minLeft, maxLeft, minBottom, maxBottom, left, bottom, resolvePos]);

  const persist = useCallback(
    (pos: FabPosition) => {
      setPosition(id, pos);
    },
    [id, setPosition],
  );

  const handleTap = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ w: Math.ceil(width), h: Math.ceil(height) });
    }
  }, []);

  const pan = Gesture.Pan()
    .minDistance(10)
    .onBegin(() => {
      startLeft.value = left.value;
      startBottom.value = bottom.value;
      dragging.value = false;
    })
    .onUpdate((e) => {
      if (
        !dragging.value &&
        (Math.abs(e.translationX) > 8 || Math.abs(e.translationY) > 8)
      ) {
        dragging.value = true;
        scale.value = withSpring(1.06, { damping: 16, stiffness: 280 });
      }
      left.value = clamp(startLeft.value + e.translationX, minLeft, maxLeft);
      bottom.value = clamp(
        startBottom.value - e.translationY,
        minBottom,
        maxBottom,
      );
    })
    .onEnd(() => {
      const pos = {
        left: clamp(left.value, minLeft, maxLeft),
        bottom: clamp(bottom.value, minBottom, maxBottom),
      };
      left.value = pos.left;
      bottom.value = pos.bottom;
      scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      if (dragging.value) {
        runOnJS(persist)(pos);
      }
      dragging.value = false;
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 16, stiffness: 280 });
    });

  const tap = Gesture.Tap()
    .maxDistance(8)
    .onBegin(() => {
      scale.value = withSpring(0.94, { damping: 18, stiffness: 320 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 16, stiffness: 280 });
    })
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    left: left.value,
    bottom: bottom.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <TutorialTarget
      id={tutorialId}
      pointerEvents="box-none"
      style={styles.anchor}
    >
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 14,
          stiffness: 220,
          delay: entranceDelayMs,
        }}
        style={styles.moti}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityHint="Drag to move"
            onLayout={onLayout}
            style={[styles.fab, animatedStyle]}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </MotiView>
    </TutorialTarget>
  );
}

const styles = StyleSheet.create({
  anchor: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    pointerEvents: "box-none",
  },
  moti: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "box-none",
  },
  fab: {
    position: "absolute",
    zIndex: 50,
  },
});
