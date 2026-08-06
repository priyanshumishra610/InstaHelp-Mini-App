import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  error?: boolean;
  accessibilityLabel?: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
  error,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-start gap-3 active:opacity-80"
      hitSlop={6}
    >
      <MotiView
        animate={{
          backgroundColor: checked ? "#171717" : "#ffffff",
          borderColor: checked ? "#171717" : error ? "#f87171" : "#d4d4d4",
        }}
        transition={{ type: "timing", duration: 160 }}
        className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border"
      >
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ type: "spring", damping: 14, stiffness: 400 }}
        >
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        </MotiView>
      </MotiView>
      {typeof label === "string" ? (
        <Text className="flex-1 text-[12px] leading-[18px] text-neutral-600">
          {label}
        </Text>
      ) : (
        <View className="flex-1">{label}</View>
      )}
    </Pressable>
  );
}
