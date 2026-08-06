import { PAPER } from "@/constants/theme";
import type { PropsWithChildren } from "react";
import { View } from "react-native";

type Props = PropsWithChildren<{
  /** Kept for API compatibility */
  emphasizeFooter?: boolean;
}>;

/** Flat auth surface — no decorative circles or orbs. */
export function AuthBackdrop({ children }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      {children}
    </View>
  );
}
