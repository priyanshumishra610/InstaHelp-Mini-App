import { Image } from "expo-image";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  uri: string;
  fallbackLabel: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentFit?: "cover" | "contain";
};

function isHttpImageUrl(value: string): boolean {
  return value.trim().toLowerCase().startsWith("http");
}

export function ShopProductImage({
  uri,
  fallbackLabel,
  style,
  containerStyle,
  contentFit = "contain",
}: Props) {
  const primary = uri.trim();
  const [failed, setFailed] = useState(!isHttpImageUrl(primary));

  if (failed) {
    return (
      <View style={[style, styles.fallback, containerStyle]}>
        <Text style={styles.fallbackText}>{fallbackLabel}</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri: primary }}
        style={style}
        contentFit={contentFit}
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
    backgroundColor: "#f3f4f6",
  },
  fallbackText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#9ca3af",
  },
});
