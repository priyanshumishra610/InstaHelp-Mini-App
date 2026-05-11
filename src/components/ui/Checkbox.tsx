import { Ionicons } from "@expo/vector-icons";
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
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
          checked
            ? "border-neutral-900 bg-neutral-900"
            : error
              ? "border-red-400 bg-white"
              : "border-neutral-300 bg-white"
        }`}
      >
        {checked ? (
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        ) : null}
      </View>
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
