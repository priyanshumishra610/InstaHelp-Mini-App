import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  className?: string;
  inset?: boolean;
}>;

export function Screen({ children, className, inset = true }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const Body = inset ? SafeAreaView : View;
  return (
    <View className={cn("flex-1", isDark && "dark")}>
      <Body
        className={cn("flex-1 bg-[#FAFAF7] dark:bg-[#0B0B0C]", className)}
      >
        {children}
      </Body>
    </View>
  );
}
