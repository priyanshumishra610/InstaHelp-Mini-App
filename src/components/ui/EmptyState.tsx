import { cn } from "@/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, PropsWithChildren } from "react";
import { Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function EmptyState({
  title,
  subtitle,
  icon = "sparkles-outline",
  children,
  className,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  icon?: IoniconName;
  className?: string;
}>) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white/70 px-6 py-10 dark:border-neutral-800 dark:bg-neutral-900/40",
        className,
      )}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
        <Ionicons name={icon} size={26} color="#ffffff" />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-neutral-900 dark:text-white">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </Text>
      ) : null}
      {children ? <View className="mt-5 w-full">{children}</View> : null}
    </View>
  );
}
