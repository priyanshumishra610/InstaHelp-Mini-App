import { cn } from "@/utils/cn";
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
        <Text className="text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-xs text-neutral-400 dark:text-neutral-500">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
