import { FlipkartAffiliateWebView } from "@/components/shop/FlipkartAffiliateWebView";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type Props = {
  title: string;
  subtitle?: string;
  html: string;
  aspectRatio: number;
  delay?: number;
  badge?: string;
  footer?: ReactNode;
};

export function ShopWidgetCard({
  title,
  subtitle,
  html,
  aspectRatio,
  delay = 0,
  badge,
  footer,
}: Props) {
  return (
    <Animated.View
      entering={FadeInUp.duration(480).delay(delay).springify().damping(18)}
      style={styles.cardShadow}
    >
      <View style={styles.cardOuter}>
        <LinearGradient
          colors={["rgba(255,255,255,0.92)", "rgba(248,251,255,0.88)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <LinearGradient
          colors={["rgba(0,74,173,0.06)", "transparent", "rgba(255,213,0,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowOverlay}
          pointerEvents="none"
        />

        <View style={styles.cardInner}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.widgetFrame}>
            <FlipkartAffiliateWebView html={html} aspectRatio={aspectRatio} />
          </View>

          {footer ?? (
            <View style={styles.footer}>
              <Ionicons name="sparkles-outline" size={12} color="#004aad" />
              <Text style={styles.footerText}>Powered by Flipkart Affiliate</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#004aad",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardOuter: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.12)",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardInner: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#171717",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#737373",
    fontWeight: "500",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "rgba(0,74,173,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#004aad",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  widgetFrame: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
  },
});
