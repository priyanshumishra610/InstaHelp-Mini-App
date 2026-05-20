import { ACCENT, ACCENT_TINT, BRAND_GOLD } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { View } from "react-native";

type Props = PropsWithChildren<{
  /** Slightly stronger bottom glow for screens with a fixed CTA card */
  emphasizeFooter?: boolean;
}>;

export function AuthBackdrop({ children, emphasizeFooter }: Props) {
  return (
    <LinearGradient
      colors={["#dce8ff", "#eef4ff", "#ffffff"]}
      locations={[0, 0.42, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        pointerEvents="none"
        className="absolute -right-24 top-20 h-72 w-72 rounded-full"
        style={{ backgroundColor: `${ACCENT}18` }}
      />
      <View
        pointerEvents="none"
        className="absolute -left-20 top-[38%] h-56 w-56 rounded-full"
        style={{ backgroundColor: `${ACCENT_TINT}aa` }}
      />
      {emphasizeFooter ? (
        <View
          pointerEvents="none"
          className="absolute -bottom-10 left-1/2 h-40 w-[120%] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: `${BRAND_GOLD}22` }}
        />
      ) : null}
      {children}
    </LinearGradient>
  );
}
