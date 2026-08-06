import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";

type Spark = {
  icon: keyof typeof Ionicons.glyphMap;
  top: number | `${number}%`;
  left?: number | `${number}%`;
  right?: number | `${number}%`;
  delay: number;
  size: number;
  color: string;
};

type Props = {
  accent?: string;
};

export function TutorialFunSparkles({ accent = "#E11D48" }: Props) {
  const sparks: Spark[] = [
    { icon: "star", top: "7%", left: "6%", delay: 0, size: 12, color: accent },
    { icon: "sparkles", top: "14%", right: "10%", delay: 120, size: 14, color: "#F59E0B" },
    { icon: "star-outline", top: "24%", left: "14%", delay: 240, size: 10, color: "#38BDF8" },
    { icon: "flash", top: "11%", right: "28%", delay: 80, size: 11, color: "#34D399" },
    { icon: "heart", top: "20%", right: "6%", delay: 180, size: 11, color: "#FB7185" },
  ];

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {sparks.map((spark, index) => (
        <MotiView
          key={`${spark.icon}-${index}`}
          from={{ opacity: 0, scale: 0.4, rotate: "-12deg" }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.85, 1.18, 0.85],
            rotate: ["-12deg", "12deg", "-12deg"],
            translateY: [0, -5, 0],
          }}
          transition={{
            type: "timing",
            duration: 1400,
            delay: spark.delay,
            loop: true,
          }}
          style={[
            styles.spark,
            {
              top: spark.top,
              left: spark.left,
              right: spark.right,
            },
          ]}
        >
          <Ionicons name={spark.icon} size={spark.size} color={spark.color} />
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
  },
  spark: {
    position: "absolute",
  },
});
