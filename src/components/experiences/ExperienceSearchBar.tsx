import { EXP } from "@/constants/experienceTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  accent?: string;
};

export function ExperienceSearchBar({
  value,
  onChangeText,
  placeholder,
  accent = EXP.resorts.to,
}: Props) {
  return (
    <View
      style={{
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: EXP.white,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: EXP.line,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Ionicons name="search" size={20} color={accent} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={{
          marginLeft: 10,
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: EXP.ink,
          paddingVertical: 0,
        }}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color="#94A3B8" />
        </Pressable>
      ) : null}
    </View>
  );
}
