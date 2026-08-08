import { FakeTouchIndicator } from "@/components/onboarding/guided/ui/FakeTouchIndicator";
import { GlowBorder } from "@/components/onboarding/guided/ui/GlowBorder";
import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

const DEMO_QUERY = "Electrician";

export function SearchDemoStep({ onContinue }: Props) {
  const reduceMotion = useReduceMotion();
  const searchRect = useGuidedTourStore((s) => s.anchors["tour-search"]);
  const setTourSearchText = useGuidedTourStore((s) => s.setTourSearchText);
  const [phase, setPhase] = useState<"finger" | "typing" | "clear" | "done">(
    "finger",
  );
  const [showHint, setShowHint] = useState(reduceMotion);
  const startedRef = useRef(false);

  const runTyping = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPhase("typing");
    setTourSearchText("");
    for (let i = 1; i <= DEMO_QUERY.length; i += 1) {
      await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 85));
      setTourSearchText(DEMO_QUERY.slice(0, i));
    }
    await new Promise((r) => setTimeout(r, reduceMotion ? 200 : 700));
    setPhase("clear");
    for (let i = DEMO_QUERY.length; i >= 0; i -= 1) {
      await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 45));
      setTourSearchText(DEMO_QUERY.slice(0, i));
    }
    setPhase("done");
    setShowHint(true);
  }, [reduceMotion, setTourSearchText]);

  const onTapComplete = useCallback(() => {
    void runTyping();
  }, [runTyping]);

  useEffect(() => {
    if (reduceMotion) {
      setTourSearchText("");
      setPhase("done");
      setShowHint(true);
      return;
    }

    const startTimer = setTimeout(() => {
      void runTyping();
    }, searchRect ? 900 : 500);

    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 3200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(hintTimer);
    };
  }, [reduceMotion, runTyping, searchRect, setTourSearchText]);

  useEffect(
    () => () => {
      setTourSearchText("");
    },
    [setTourSearchText],
  );

  const fingerX = searchRect
    ? searchRect.x + searchRect.width * 0.35
    : 0;
  const fingerY = searchRect
    ? searchRect.y + searchRect.height * 0.55
    : 0;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <GlowBorder
        rect={searchRect ?? null}
        visible={phase !== "finger"}
        radius={18}
      />
      {!reduceMotion && phase === "finger" && searchRect ? (
        <FakeTouchIndicator
          x={fingerX}
          y={fingerY}
          onTapComplete={onTapComplete}
        />
      ) : null}
      {showHint ? (
        <TourHintCard
          hint="Search anything nearby"
          actionLabel="Next"
          onAction={onContinue}
        />
      ) : null}
    </View>
  );
}
