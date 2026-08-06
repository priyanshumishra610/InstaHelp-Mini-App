import { MotiView } from "moti";
import { Pressable, Text, View } from "react-native";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
  delay = 0,
}: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay }}
      className="mb-3"
    >
      <View className="flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1">
          {eyebrow ? (
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep">
              {eyebrow}
            </Text>
          ) : null}
          <Text
            className={`${eyebrow ? "mt-1" : ""} text-xl font-extrabold tracking-tight text-neutral-900`}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm leading-5 text-neutral-500">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            accessibilityRole="button"
            className="rounded-full bg-accent-soft px-3 py-1.5 active:opacity-80"
          >
            <Text className="text-xs font-bold text-accent">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </MotiView>
  );
}
