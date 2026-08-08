import { PerfAnimatedView } from "@/components/ui/PerfAnimatedView";
import type { ExploreFormSuggestion } from "@/services/vendors/matchFormToExplore";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";

type Props = {
  suggestion: ExploreFormSuggestion;
  onBrowse: (suggestion: ExploreFormSuggestion) => void;
  onDismiss?: () => void;
};

function formatVendorCount(count: number): string {
  if (count <= 0) return "listings";
  if (count >= 100) return "100+ vendors";
  if (count === 1) return "1 vendor";
  return `${count} vendors`;
}

export function ExploreServiceSuggestion({
  suggestion,
  onBrowse,
  onDismiss,
}: Props) {
  const related =
    suggestion.relatedLabels.length > 0
      ? ` Also related: ${suggestion.relatedLabels.slice(0, 2).join(", ")}.`
      : "";

  const body =
    suggestion.vendorCount > 0
      ? `We already list ${formatVendorCount(suggestion.vendorCount)} for ${suggestion.label} in Explore. Browse them now, or keep submitting for concierge help.${related}`
      : `We cover ${suggestion.label}${
          suggestion.categoryTitle ? ` under ${suggestion.categoryTitle}` : ""
        } in Explore. Browse matching services, or keep submitting for concierge help.${related}`;

  return (
    <PerfAnimatedView
      entering={FadeInDown.duration(280)}
      exiting={FadeOutUp.duration(180)}
      className="mt-3 overflow-hidden rounded-2xl border border-accent-tint bg-accent-soft px-3.5 py-3"
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="compass-outline" size={18} color="#171717" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[13px] font-extrabold text-neutral-900">
            Already available in Explore
          </Text>
          <Text className="mt-1 text-[12px] leading-[17px] text-neutral-600">
            {body}
          </Text>
          <View className="mt-2.5 flex-row flex-wrap items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Browse ${suggestion.label} in Explore`}
              onPress={() => onBrowse(suggestion)}
              className="rounded-full bg-neutral-900 px-3.5 py-2 active:opacity-90"
            >
              <Text className="text-[12px] font-bold text-white">
                Browse {suggestion.label}
              </Text>
            </Pressable>
            {onDismiss ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss Explore suggestion"
                onPress={onDismiss}
                hitSlop={8}
                className="rounded-full px-2 py-2 active:opacity-70"
              >
                <Text className="text-[12px] font-semibold text-neutral-500">
                  Keep filling form
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </PerfAnimatedView>
  );
}
