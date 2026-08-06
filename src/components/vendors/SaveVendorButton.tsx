import { useSaveVendor } from "@/hooks/useSaveVendor";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

type Props = {
  vendorId: string;
  size?: number;
  className?: string;
};

export function SaveVendorButton({ vendorId, size = 20, className }: Props) {
  const { saved, toggle } = useSaveVendor(vendorId);

  return (
    <Pressable
      onPress={() => {
        toggle();
      }}
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove from saved vendors" : "Save vendor"}
      hitSlop={10}
      className={`h-9 w-9 items-center justify-center rounded-full bg-white/95 active:opacity-80 ${className ?? ""}`}
    >
      <Ionicons
        name={saved ? "bookmark" : "bookmark-outline"}
        size={size}
        color={saved ? "#0A0A0A" : "#737373"}
      />
    </Pressable>
  );
}
