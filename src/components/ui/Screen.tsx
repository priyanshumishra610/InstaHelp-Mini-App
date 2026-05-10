import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  className?: string;
  inset?: boolean;
}>;

export function Screen({ children, className, inset = true }: Props) {
  const Body = inset ? SafeAreaView : View;
  return (
    <View className="flex-1">
      <Body className={cn("flex-1 bg-white", className)}>{children}</Body>
    </View>
  );
}
