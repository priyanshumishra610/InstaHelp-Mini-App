import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import { PAPER } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  className?: string;
  inset?: boolean;
  /** Flat paper backdrop. Pass false to skip. */
  atmosphere?: boolean | "app" | "auth" | "hero";
}>;

export function Screen({
  children,
  className,
  inset = true,
  atmosphere = true,
}: Props) {
  const Body = inset ? SafeAreaView : View;
  const variant =
    atmosphere === true ? "app" : atmosphere === false ? null : atmosphere;

  return (
    <View className="flex-1" style={{ backgroundColor: PAPER }}>
      {variant ? <AppAtmosphere variant={variant} /> : null}
      <Body className={cn("flex-1 bg-transparent", className)}>{children}</Body>
    </View>
  );
}
