import { useTutorialStore } from "@/store/tutorialStore";
import { useCallback, useEffect, useRef } from "react";
import { View, type ViewProps } from "react-native";

type Props = ViewProps & {
  id: string;
  children: React.ReactNode;
};

function rectChanged(
  a: { x: number; y: number; width: number; height: number } | undefined,
  b: { x: number; y: number; width: number; height: number },
) {
  if (!a) return true;
  return (
    Math.abs(a.x - b.x) > 1 ||
    Math.abs(a.y - b.y) > 1 ||
    Math.abs(a.width - b.width) > 1 ||
    Math.abs(a.height - b.height) > 1
  );
}

/** Registers a UI element's screen bounds for the in-app tutorial spotlight. */
export function TutorialTarget({ id, children, style, ...rest }: Props) {
  const ref = useRef<View>(null);
  const active = useTutorialStore((s) => s.active);
  const isCurrent = useTutorialStore((s) => s.isTargetForCurrentStep(id));
  const registerTarget = useTutorialStore((s) => s.registerTarget);
  const unregisterTarget = useTutorialStore((s) => s.unregisterTarget);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      const next = { x, y, width, height };
      const prev = useTutorialStore.getState().targets[id];
      if (!rectChanged(prev, next)) return;
      registerTarget(id, next);
    });
  }, [id, registerTarget]);

  useEffect(() => {
    return () => unregisterTarget(id);
  }, [id, unregisterTarget]);

  useEffect(() => {
    if (!active) return;
    measure();
    if (!isCurrent) return;
    const timer = setInterval(measure, 1200);
    return () => clearInterval(timer);
  }, [active, isCurrent, measure]);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={style}
      onLayout={active ? measure : undefined}
      {...rest}
    >
      {children}
    </View>
  );
}
