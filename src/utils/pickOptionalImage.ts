import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type PickedImage = {
  uri: string;
  base64?: string | null;
  mime?: string;
};

export type PickOptionalImageOptions = {
  /** Square crop (good for avatars). */
  squareCrop?: boolean;
  /** JPEG/WebP quality 0–1. Default 0.8, or 0.65 when squareCrop. */
  quality?: number;
};

export async function pickOptionalImage(
  options?: PickOptionalImageOptions,
): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const square = options?.squareCrop ?? false;
  const quality =
    options?.quality ?? (square ? 0.65 : 0.8);

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    ...(square ? { aspect: [1, 1] as [number, number] } : {}),
    quality,
    base64: Platform.OS !== "web",
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const a = result.assets[0];
  return {
    uri: a.uri,
    base64: a.base64 ?? null,
    mime: a.mimeType ?? "image/jpeg",
  };
}
