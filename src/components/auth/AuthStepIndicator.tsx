import { ACCENT } from "@/constants/theme";
import { Text, View } from "react-native";

const STEPS = ["Sign in", "Location"] as const;

type Step = (typeof STEPS)[number];

const STEP_INDEX: Record<Step, number> = {
  "Sign in": 0,
  Location: 1,
};

export function AuthStepIndicator({ current }: { current: Step }) {
  const active = STEP_INDEX[current];

  return (
    <View className="flex-row items-center gap-2">
      {STEPS.map((label, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <View key={label} className="flex-1">
            <View
              className="h-1 rounded-full"
              style={{
                backgroundColor: isActive || isDone ? ACCENT : "#e5e7eb",
                opacity: isActive ? 1 : isDone ? 0.55 : 1,
              }}
            />
            {isActive ? (
              <Text
                className="mt-1.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: ACCENT }}
              >
                {label}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
