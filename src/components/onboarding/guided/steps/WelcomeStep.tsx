import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { AUTH_FONT } from "@/constants/authPremium";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onStart: () => void;
};

export function WelcomeStep({ onStart }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(260)}
      exiting={SlideOutDown.duration(220)}
      style={[styles.root, { paddingBottom: insets.bottom + 24 }]}
      pointerEvents="auto"
    >
      <View
        style={[
          styles.card,
          {
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
          },
        ]}
        pointerEvents="auto"
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={isDark ? 52 : 78}
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
          <Text style={[styles.kicker, { color: colors.accent, fontFamily: AUTH_FONT.bold }]}>
            InstaHelp
          </Text>
          <Text style={[styles.title, { color: colors.ink, fontFamily: AUTH_FONT.bold }]}>
            Welcome to InstaHelp
          </Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted, fontFamily: AUTH_FONT.regular }]}>
            Find trusted local services in seconds.
          </Text>
          <Pressable
            onPress={onStart}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.accent },
              pressed && styles.ctaPressed,
            ]}
          >
            <Text style={[styles.ctaLabel, { fontFamily: AUTH_FONT.bold }]}>
              Start Tour
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    zIndex: 40,
    pointerEvents: "box-none",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0C0A09",
        shadowOpacity: 0.14,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  inner: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 8,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  cta: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  ctaLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
