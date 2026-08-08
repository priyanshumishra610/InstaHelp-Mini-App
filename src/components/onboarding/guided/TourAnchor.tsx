import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Registers an on-screen region for guided tour highlights and demos. */
export function TourAnchor({ id, children, style }: Props) {
  const ref = useRef<View>(null);
  const active = useGuidedTourStore((s) => s.active);
  const registerAnchor = useGuidedTourStore((s) => s.registerAnchor);
  const unregisterAnchor = useGuidedTourStore((s) => s.unregisterAnchor);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      registerAnchor(id, { x, y, width, height });
    });
  }, [id, registerAnchor]);

  useEffect(() => {
    if (!active) return;
    measure();
    const timer = setInterval(measure, 900);
    return () => clearInterval(timer);
  }, [active, measure]);

  useEffect(() => () => unregisterAnchor(id), [id, unregisterAnchor]);

  return (
    <View
      ref={ref}
      style={style}
      onLayout={measure}
      collapsable={false}
    >
      {children}
    </View>
  );
}
