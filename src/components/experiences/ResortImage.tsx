import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  uri: string | null | undefined;
  height: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function ResortImage({
  uri,
  height,
  width = "100%",
  borderRadius = 0,
  style,
}: Props) {
  const [failed, setFailed] = useState(false);
  const normalized = uri?.trim() ?? "";
  const showFallback = !normalized.startsWith("http") || failed;

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: "hidden",
    backgroundColor: "#e0eaff",
  };

  if (showFallback) {
    return (
      <View style={[containerStyle, styles.fallback, style]}>
        <Ionicons name="bed-outline" size={Math.min(40, height * 0.35)} color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Image
        source={{ uri: normalized }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
