import { RADIUS } from "@/constants/designSystem";
import { AUTH_PRIMARY } from "@/constants/authPremium";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

const ICONS: Array<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
}> = [
  { icon: "hammer-wrench", tint: "rgba(23,23,23,0.08)" },
  { icon: "broom", tint: "rgba(120,113,108,0.12)" },
  { icon: "store-outline", tint: "rgba(23,23,23,0.06)" },
  { icon: "pipe-wrench", tint: "rgba(87,83,78,0.1)" },
  { icon: "snowflake", tint: "rgba(23,23,23,0.07)" },
  { icon: "truck-delivery-outline", tint: "rgba(120,113,108,0.1)" },
  { icon: "flower-outline", tint: "rgba(23,23,23,0.05)" },
  { icon: "wifi", tint: "rgba(87,83,78,0.08)" },
  { icon: "paw", tint: "rgba(120,113,108,0.11)" },
  { icon: "car-outline", tint: "rgba(23,23,23,0.08)" },
  { icon: "shield-home-outline", tint: "rgba(87,83,78,0.09)" },
  { icon: "silverware-fork-knife", tint: "rgba(120,113,108,0.1)" },
];

const CHIP = 36;
const GAP = 10;
const LOOP = [...ICONS, ...ICONS];

function ServiceChip({
  icon,
  tint,
  index,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16, stiffness: 260, delay: 80 + (index % ICONS.length) * 45 }}
    >
      <MotiView
        animate={{
          translateY: [0, -4, 0],
          rotate: ["-3deg", "3deg", "-3deg"],
        }}
        transition={{
          type: "timing",
          duration: 2600 + (index % 5) * 240,
          loop: true,
        }}
      >
        <View style={styles.chip}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
          <View style={styles.chipRim} />
          <MaterialCommunityIcons name={icon} size={16} color={AUTH_PRIMARY} />
        </View>
      </MotiView>
    </MotiView>
  );
}

/** Horizontally scrolling glass service icons with gentle auto-drift. */
export function HomeHeroVisual() {
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const userScrolling = useRef(false);
  const loopWidth = ICONS.length * (CHIP + GAP);

  useEffect(() => {
    const timer = setInterval(() => {
      if (userScrolling.current) return;
      offsetRef.current += 0.6;
      if (offsetRef.current >= loopWidth) {
        offsetRef.current = 0;
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        return;
      }
      scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
    }, 28);
    return () => clearInterval(timer);
  }, [loopWidth]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetRef.current = e.nativeEvent.contentOffset.x;
    if (offsetRef.current >= loopWidth) {
      offsetRef.current = 0;
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  };

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CHIP + GAP}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          userScrolling.current = true;
        }}
        onScrollEndDrag={() => {
          userScrolling.current = false;
        }}
        onMomentumScrollEnd={() => {
          userScrolling.current = false;
        }}
      >
        {LOOP.map(({ icon, tint }, index) => (
          <ServiceChip key={`${icon}-${index}`} icon={icon} tint={tint} index={index} />
        ))}
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.98)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeLeft}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(255,255,255,0.98)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeRight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 8,
    marginBottom: 2,
    height: 44,
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: GAP,
    alignItems: "center",
  },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#171717",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  chipRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.05)",
    borderRadius: RADIUS.sm,
  },
  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
});
