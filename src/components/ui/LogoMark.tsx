import { Text, View } from "react-native";

type Size = "sm" | "md" | "lg";
type Variant = "icon" | "wordmark" | "full";

const SIZE: Record<
  Size,
  { box: string; text: string; monogram: string; wordmark: string }
> = {
  sm: { box: "h-8 w-8", text: "text-sm", monogram: "text-xs", wordmark: "text-base" },
  md: { box: "h-10 w-10", text: "text-base", monogram: "text-sm", wordmark: "text-lg" },
  lg: { box: "h-14 w-14", text: "text-2xl", monogram: "text-lg", wordmark: "text-3xl" },
};

export function LogoMark({
  size = "md",
  withWordmark = false,
  variant,
}: {
  size?: Size;
  withWordmark?: boolean;
  variant?: Variant;
}) {
  const resolved: Variant = variant ?? (withWordmark ? "wordmark" : "icon");
  const s = SIZE[size];

  const icon = (
    <View
      className={`${s.box} items-center justify-center rounded-2xl bg-neutral-900`}
      style={{
        shadowColor: "#171717",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Text className={`${s.monogram} font-extrabold text-accent-foreground`}>
        IH
      </Text>
    </View>
  );

  const wordmark = (
    <Text className={`${s.wordmark} font-extrabold tracking-tight text-neutral-900`}>
      InstaHelp
    </Text>
  );

  if (resolved === "icon") return icon;
  if (resolved === "wordmark") return wordmark;

  return (
    <View className="flex-row items-center gap-3">
      {icon}
      {wordmark}
    </View>
  );
}
