import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import { useAppTheme } from "@/hooks/useAppTheme";
import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  className?: string;
  inset?: boolean;
  /** Flat paper backdrop. Pass false to skip. */
  atmosphere?: boolean | "app" | "auth" | "hero";
  /** Canvas behind content — default warm paper. */
  surface?: "paper" | "white";
}>;

export function Screen({
  children,
  className,
  inset = true,
  atmosphere = true,
  surface = "paper",
}: Props) {
  const { colors } = useAppTheme();
  const Body = inset ? SafeAreaView : View;
  const variant =
    atmosphere === true ? "app" : atmosphere === false ? null : atmosphere;
  const canvas = surface === "white" ? colors.canvas : colors.paper;
  const showAtmosphere = surface !== "white" && variant;

  return (
    <View className="flex-1" style={{ backgroundColor: canvas }}>
      {showAtmosphere ? <AppAtmosphere variant={variant} /> : null}
      <Body className={cn("flex-1 bg-transparent", className)}>{children}</Body>
    </View>
  );
}
