import { useSaveVendor } from "@/hooks/useSaveVendor";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  vendorId: string;
  size?: number;
  className?: string;
};

export function SaveVendorButton({ vendorId, size = 20, className }: Props) {
  const { colors, isDark } = useAppTheme();
  const { saved, toggle } = useSaveVendor(vendorId);

  return (
    <Pressable
      onPress={() => {
        toggle();
      }}
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove from saved vendors" : "Save vendor"}
      hitSlop={10}
      className={`h-9 w-9 items-center justify-center rounded-full active:opacity-80 ${className ?? ""}`}
      style={{
        backgroundColor: isDark
          ? "rgba(39,39,42,0.95)"
          : "rgba(255,255,255,0.95)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.line,
      }}
    >
      <Ionicons
        name={saved ? "bookmark" : "bookmark-outline"}
        size={size}
        color={saved ? colors.ink : colors.inkMuted}
      />
    </Pressable>
  );
}
