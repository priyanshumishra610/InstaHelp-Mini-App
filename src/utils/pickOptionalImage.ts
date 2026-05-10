import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type PickedImage = {
  uri: string;
  base64?: string | null;
  mime?: string;
};

export async function pickOptionalImage(): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
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
