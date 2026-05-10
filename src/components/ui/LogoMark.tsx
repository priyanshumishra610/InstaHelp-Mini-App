import { Text, View } from "react-native";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { box: string; text: string; monogram: string }> = {
  sm: { box: "h-8 w-8", text: "text-sm", monogram: "text-xs" },
  md: { box: "h-10 w-10", text: "text-base", monogram: "text-sm" },
  lg: { box: "h-14 w-14", text: "text-2xl", monogram: "text-lg" },
};

export function LogoMark({
  size = "md",
  withWordmark = false,
}: {
  size?: Size;
  withWordmark?: boolean;
}) {
  const s = SIZE[size];
  return (
    <View className="flex-row items-center gap-3">
      {withWordmark ? (
        <Text className={`${s.text} font-extrabold tracking-tight text-neutral-900 dark:text-white`}>
          Insta<Text className="text-accent-deep dark:text-accent">Help</Text>
        </Text>
      ) : (
        <View
          className={`${s.box} items-center justify-center rounded-2xl bg-accent shadow-glow`}
        >
          <Text className={`${s.monogram} font-extrabold text-accent-foreground`}>
            IH
          </Text>
        </View>
      )}
    </View>
  );
}
