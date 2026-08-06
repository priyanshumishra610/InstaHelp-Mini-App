import { cn } from "@/utils/cn";
import { MotiView } from "moti";
import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

export function FormField({
  label,
  hint,
  error,
  children,
  className,
}: PropsWithChildren<{
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}>) {
  return (
    <View className={cn("gap-1.5", className)}>
      <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      {children}
      {error ? (
        <MotiView
          key={`error-${error}`}
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 160 }}
        >
          <Text className="text-xs font-medium text-red-500 dark:text-red-400">
            {error}
          </Text>
        </MotiView>
      ) : hint ? (
        <MotiView
          key="hint"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 160 }}
        >
          <Text className="text-xs text-neutral-400 dark:text-neutral-500">
            {hint}
          </Text>
        </MotiView>
      ) : null}
    </View>
  );
}
