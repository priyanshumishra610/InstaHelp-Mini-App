import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { box: string; icon: number; text: string }> = {
  sm: { box: "h-8 w-8", icon: 16, text: "text-sm" },
  md: { box: "h-10 w-10", icon: 20, text: "text-base" },
  lg: { box: "h-14 w-14", icon: 28, text: "text-2xl" },
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
      <View
        className={`${s.box} items-center justify-center rounded-2xl bg-accent shadow-glow`}
      >
        <Ionicons name="flash" size={s.icon} color="#1a1a1a" />
      </View>
      {withWordmark ? (
        <Text className={`${s.text} font-extrabold tracking-tight text-neutral-900 dark:text-white`}>
          Insta<Text className="text-accent-deep dark:text-accent">Help</Text>
        </Text>
      ) : null}
    </View>
  );
}
