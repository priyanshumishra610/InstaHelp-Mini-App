import { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/**
 * Splits a string into perceived characters (grapheme-ish clusters), keeping
 * variation selectors and ZWJ joiners attached to the previous codepoint so the
 * typewriter does not reveal invisible characters as separate steps.
 */
function splitGraphemes(input: string): string[] {
  const out: string[] = [];
  for (const cp of [...input]) {
    const code = cp.codePointAt(0) ?? 0;
    const isCombining =
      out.length > 0 &&
      ((code >= 0xfe00 && code <= 0xfe0f) || // variation selectors
        code === 0x200d || // ZWJ
        (code >= 0x180b && code <= 0x180d) ||
        (code >= 0x0300 && code <= 0x036f));
    if (isCombining) {
      out[out.length - 1] += cp;
    } else {
      out.push(cp);
    }
  }
  return out;
}

export type TypewriterTextProps = {
  text: string;
  /** Delay before the first character appears, in ms. */
  startDelayMs?: number;
  /** Time between each character reveal, in ms. */
  charDurationMs?: number;
  /** Whether to render the blinking cursor. */
  showCursor?: boolean;
  /** Full blink cycle duration in ms (250ms each direction by default). */
  cursorBlinkMs?: number;
  /** Min cursor opacity at the dim end of the pulse. */
  cursorMinOpacity?: number;
  /** Style applied to the typed Text. */
  textStyle?: StyleProp<TextStyle>;
  /** Style applied to the cursor View (overrides defaults). */
  cursorStyle?: StyleProp<ViewStyle>;
  cursorColor?: string;
  cursorWidth?: number;
  cursorHeight?: number;
  /** Gap between the typed text and the cursor, in px. */
  cursorOffset?: number;
  /** Called once typing finishes. */
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  startDelayMs = 0,
  charDurationMs = 60,
  showCursor = true,
  cursorBlinkMs = 500,
  cursorMinOpacity = 0.15,
  textStyle,
  cursorStyle,
  cursorColor = "#F5F5F5",
  cursorWidth = 2,
  cursorHeight = 26,
  cursorOffset = 6,
  onComplete,
}: TypewriterTextProps) {
  const graphemes = useMemo(() => splitGraphemes(text), [text]);
  const [visible, setVisible] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    if (!showCursor) {
      cursorOpacity.value = 0;
      return;
    }
    const half = Math.max(60, cursorBlinkMs / 2);
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(cursorMinOpacity, {
          duration: half,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(1, {
          duration: half,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(cursorOpacity);
    };
  }, [showCursor, cursorBlinkMs, cursorMinOpacity, cursorOpacity]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let i = 0;
    completedRef.current = false;
    setVisible(0);

    const step = () => {
      if (!mounted) return;
      i += 1;
      setVisible(i);
      if (i < graphemes.length) {
        timer = setTimeout(step, charDurationMs);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    timer = setTimeout(step, startDelayMs);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [graphemes, startDelayMs, charDurationMs]);

  const cursorAnimStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const visibleText = useMemo(
    () => graphemes.slice(0, visible).join(""),
    [graphemes, visible],
  );

  return (
    <View style={styles.row}>
      <Text style={textStyle} accessibilityLabel={text}>
        {visibleText}
      </Text>
      {showCursor ? (
        <Animated.View
          style={[
            {
              width: cursorWidth,
              height: cursorHeight,
              backgroundColor: cursorColor,
              marginLeft: cursorOffset,
              borderRadius: cursorWidth / 2,
            },
            cursorStyle,
            cursorAnimStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
