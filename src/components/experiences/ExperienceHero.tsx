import { PerfAnimatedView } from "@/components/ui/PerfAnimatedView";
import { EXP } from "@/constants/experienceTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { FadeInDown } from "react-native-reanimated";

type Tone = "resorts" | "holidays" | "countries";

const TONE: Record<
  Tone,
  { colors: [string, string, string]; icon: keyof typeof Ionicons.glyphMap }
> = {
  resorts: {
    colors: [EXP.resorts.from, EXP.resorts.mid, EXP.resorts.to],
    icon: "bed",
  },
  holidays: {
    colors: [EXP.holidays.from, EXP.holidays.mid, EXP.holidays.to],
    icon: "airplane",
  },
  countries: {
    colors: [EXP.countries.from, EXP.countries.mid, EXP.countries.to],
    icon: "earth",
  },
};

type Props = {
  tone: Tone;
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export function ExperienceHero({
  tone,
  eyebrow,
  title,
  subtitle,
  meta,
}: Props) {
  const cfg = TONE[tone];

  return (
    <PerfAnimatedView entering={FadeInDown.duration(380)}>
      <LinearGradient
        colors={cfg.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          paddingHorizontal: 20,
          paddingVertical: 22,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            right: -24,
            top: -28,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 36,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: -0.5,
                lineHeight: 32,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.86)",
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
            {meta ? (
              <View
                style={{
                  alignSelf: "flex-start",
                  marginTop: 10,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {meta}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.14)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={cfg.icon} size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </PerfAnimatedView>
  );
}
