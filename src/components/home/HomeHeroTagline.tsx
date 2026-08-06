import { TypewriterText } from "@/components/ui/TypewriterText";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const LINE = "Find trusted vendors nearby";

type Props = {
  startDelayMs?: number;
};

/** Types once on load — no cycling. */
export function HomeHeroTagline({ startDelayMs = 480 }: Props) {
  const [done, setDone] = useState(false);

  return (
    <View style={styles.wrap}>
      <TypewriterText
        text={LINE}
        startDelayMs={startDelayMs}
        charDurationMs={34}
        showCursor={!done}
        cursorColor={AUTH_PRIMARY}
        cursorHeight={14}
        cursorWidth={2}
        cursorOffset={3}
        textStyle={[styles.text, { fontFamily: AUTH_FONT.regular }]}
        onComplete={() => setDone(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
  },
});
