import { ConfettiBurst } from "@/components/onboarding/guided/ui/ConfettiBurst";
import { AUTH_FONT } from "@/constants/authPremium";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  onFinish: () => void;
};

export function CompleteStep({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <ConfettiBurst active />
      <Animated.View
        entering={FadeIn.duration(280)}
        style={[
          styles.cardWrap,
          { paddingBottom: insets.bottom + 28 },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(220).delay(120)}
          style={[
            styles.card,
            {
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.65)",
            },
          ]}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={isDark ? 50 : 76}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? "rgba(28,25,23,0.94)"
                    : "rgba(255,255,255,0.96)",
                },
              ]}
            />
          )}
          <View style={styles.inner}>
            <Animated.View entering={ZoomIn.delay(220).springify()}>
              <Svg width={56} height={56} viewBox="0 0 56 56">
                <Circle cx={28} cy={28} r={28} fill={colors.accent} />
                <Path
                  d="M17 28.5 L25 36.5 L39 21"
                  stroke="#FFFFFF"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.delay(280).springify()}
              style={[styles.title, { color: colors.ink, fontFamily: AUTH_FONT.bold }]}
            >
              You&apos;re ready!
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(340).springify()}
              style={[styles.subtitle, { color: colors.inkMuted, fontFamily: AUTH_FONT.regular }]}
            >
              Find trusted vendors around you.
            </Animated.Text>
            <Pressable
              onPress={onFinish}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.accent },
                pressed && styles.ctaPressed,
              ]}
            >
              <Text style={[styles.ctaLabel, { fontFamily: AUTH_FONT.bold }]}>
                Start Exploring
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    zIndex: 45,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0C0A09",
        shadowOpacity: 0.16,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 14 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  inner: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    gap: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  cta: {
    marginTop: 6,
    width: "100%",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    color: "#FFFFFF",
    fontSize: 15,
  },
});
