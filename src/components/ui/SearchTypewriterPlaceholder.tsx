import { TypewriterText } from "@/components/ui/TypewriterText";
import { AUTH_FONT } from "@/constants/authPremium";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  phrases: string[];
  active: boolean;
  startDelayMs?: number;
};

/** Cycles typed placeholder hints inside an empty search field. */
export function SearchTypewriterPlaceholder({
  phrases,
  active,
  startDelayMs = 200,
}: Props) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const phrase = phrases[index % phrases.length] ?? "";

  const onComplete = useCallback(() => {
    setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setTick((t) => t + 1);
    }, 1600);
  }, [phrases.length]);

  useEffect(() => {
    if (!active) return;
    setIndex(0);
    setTick(0);
  }, [active, phrases]);

  if (!active || !phrase) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <TypewriterText
        key={`${index}-${tick}`}
        text={phrase}
        startDelayMs={startDelayMs}
        charDurationMs={28}
        showCursor
        cursorColor="#A8A29E"
        cursorHeight={16}
        cursorWidth={2}
        cursorOffset={2}
        textStyle={[styles.text, { fontFamily: AUTH_FONT.regular }]}
        onComplete={onComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingLeft: 0,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: "#A8A29E",
  },
});
