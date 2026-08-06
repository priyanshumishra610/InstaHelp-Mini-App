import { AppIcon } from "@/components/ui/AppIcon";
import { cardShadow } from "@/constants/designSystem";
import { APP_ICONS, type AppIconKey } from "@/constants/icons";
import { cn } from "@/utils/cn";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import type { ComponentProps, PropsWithChildren } from "react";
import { Text, View } from "react-native";

type MciName = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Bridge legacy Ionicons EmptyState props → Material Community Icons */
const LEGACY_ICON_MAP: Record<string, MciName> = {
  "sparkles-outline": "auto-fix",
  "search-outline": "magnify",
  "cloud-offline-outline": "cloud-off-outline",
  "receipt-outline": "receipt",
  "checkmark-done-outline": "check-all",
  "trophy-outline": "trophy-outline",
  "calendar-outline": "calendar-month-outline",
  "calendar": "calendar-month",
  "hourglass": "timer-sand",
  "key-outline": "key-outline",
  "cube-outline": "package-variant-closed",
  "cash-outline": "cash",
};

type IconName = AppIconKey | MciName | string;

function resolveEmptyIcon(icon: IconName): AppIconKey | MciName {
  if (icon in APP_ICONS) return icon as AppIconKey;
  if (icon in LEGACY_ICON_MAP) return LEGACY_ICON_MAP[icon];
  return icon as MciName;
}

export function EmptyState({
  title,
  subtitle,
  icon = "empty",
  children,
  className,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  icon?: IconName;
  className?: string;
}>) {
  const resolved = resolveEmptyIcon(icon);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.96, translateY: 8 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 18, stiffness: 280 }}
      className={cn(
        "items-center justify-center rounded-3xl border border-dashed border-white/80 bg-white/70 px-6 py-10",
        className,
      )}
      style={cardShadow("sm")}
    >
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 100 }}
      >
        <AppIcon name={resolved} size={28} color="#171717" chip />
      </MotiView>
      <Text className="mt-4 text-center text-base font-bold text-neutral-900">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-neutral-500">
          {subtitle}
        </Text>
      ) : null}
      {children ? <View className="mt-5 w-full">{children}</View> : null}
    </MotiView>
  );
}
