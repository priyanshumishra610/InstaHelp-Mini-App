import { MotiView } from "moti";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export type GuidePose = "wave" | "talk" | "point-down" | "point-tab" | "celebrate";

type Props = {
  pose: GuidePose;
  message: string;
  stepKey: string;
  comicFont?: string;
  labelFont?: string;
  role?: string;
};

const INK = "#171717";
const RUN_MS = 320;

type LimbMotion = {
  leftArm: readonly string[];
  rightArm: readonly string[];
  leftLeg: readonly string[];
  rightLeg: readonly string[];
  bodyY: readonly number[];
  bodyX: readonly number[];
  lean: readonly string[];
};

function motionForPose(pose: GuidePose): LimbMotion {
  switch (pose) {
    case "wave":
      return {
        leftArm: ["-12deg", "-12deg", "-12deg"],
        rightArm: ["-70deg", "20deg", "-70deg"],
        leftLeg: ["10deg", "-8deg", "10deg"],
        rightLeg: ["-8deg", "10deg", "-8deg"],
        bodyY: [0, -6, 0],
        bodyX: [0, 2, 0],
        lean: ["-2deg", "2deg", "-2deg"],
      };
    case "point-down":
      return {
        leftArm: ["-8deg", "-8deg", "-8deg"],
        rightArm: ["68deg", "72deg", "68deg"],
        leftLeg: ["8deg", "8deg", "8deg"],
        rightLeg: ["-6deg", "-6deg", "-6deg"],
        bodyY: [0, -2, 0],
        bodyX: [0, 0, 0],
        lean: ["6deg", "6deg", "6deg"],
      };
    case "point-tab":
      return {
        leftArm: ["-35deg", "35deg", "-35deg"],
        rightArm: ["35deg", "-35deg", "35deg"],
        leftLeg: ["-38deg", "32deg", "-38deg"],
        rightLeg: ["32deg", "-38deg", "32deg"],
        bodyY: [0, -5, 0],
        bodyX: [0, 7, 0],
        lean: ["0deg", "0deg", "0deg"],
      };
    case "celebrate":
      return {
        leftArm: ["-52deg", "-62deg", "-52deg"],
        rightArm: ["52deg", "62deg", "52deg"],
        leftLeg: ["-18deg", "-26deg", "-18deg"],
        rightLeg: ["18deg", "26deg", "18deg"],
        bodyY: [0, -12, 0],
        bodyX: [0, 0, 0],
        lean: ["0deg", "0deg", "0deg"],
      };
    case "talk":
    default:
      return {
        leftArm: ["-28deg", "24deg", "-28deg"],
        rightArm: ["24deg", "-28deg", "24deg"],
        leftLeg: ["-32deg", "26deg", "-32deg"],
        rightLeg: ["26deg", "-32deg", "26deg"],
        bodyY: [0, -4, 0],
        bodyX: [0, 6, 0],
        lean: ["0deg", "0deg", "0deg"],
      };
  }
}

function isRunningPose(pose: GuidePose) {
  return pose === "talk" || pose === "point-tab";
}

function StickLimb({
  rotate,
  duration,
  length,
  style,
  thickness = 3,
  animated = true,
}: {
  rotate: readonly string[];
  duration: number;
  length: number;
  style?: object;
  thickness?: number;
  animated?: boolean;
}) {
  const limb = <View style={[styles.limb, { height: length, width: thickness }]} />;
  return (
    <View style={[styles.limbPivot, style]}>
      {animated ? (
        <MotiView
          animate={{ rotate }}
          transition={{ type: "timing", duration, loop: true }}
          style={[styles.limbPivotInner, { transformOrigin: "top center" }]}
        >
          {limb}
        </MotiView>
      ) : (
        <View
          style={[
            styles.limbPivotInner,
            { transform: [{ rotate: rotate[0] ?? "0deg" }] },
          ]}
        >
          {limb}
        </View>
      )}
    </View>
  );
}

function AnimatedStickFigure({
  pose,
  scale = 1,
  showLane = true,
  animated = true,
}: {
  pose: GuidePose;
  scale?: number;
  showLane?: boolean;
  animated?: boolean;
}) {
  const motion = useMemo(() => motionForPose(pose), [pose]);
  const running = isRunningPose(pose) && animated;
  const duration = running ? RUN_MS : pose === "celebrate" ? 520 : pose === "wave" ? 550 : 900;
  const headSize = 22 * scale;
  const torsoLen = 24 * scale;
  const armLen = 22 * scale;
  const legLen = 26 * scale;
  const stroke = Math.max(2, 3 * scale);

  const body = (
    <>
      <View
        style={[
          styles.head,
          {
            width: headSize,
            height: headSize,
            borderRadius: headSize / 2,
            borderWidth: stroke,
          },
        ]}
      />
      <View style={[styles.neck, { width: stroke, height: 4 * scale }]} />
      <View style={[styles.torso, { width: stroke, height: torsoLen }]} />

      <View style={[styles.shoulderRow, { top: 28 * scale, width: 56 * scale }]}>
        <StickLimb
          rotate={motion.leftArm}
          duration={duration}
          length={armLen}
          thickness={stroke}
          animated={animated}
          style={[styles.armLeft, { left: 24 * scale }]}
        />
        <StickLimb
          rotate={motion.rightArm}
          duration={duration}
          length={armLen}
          thickness={stroke}
          animated={animated}
          style={[styles.armRight, { right: 24 * scale }]}
        />
      </View>

      <View style={[styles.hipRow, { top: 50 * scale, width: 56 * scale }]}>
        <StickLimb
          rotate={motion.leftLeg}
          duration={duration}
          length={legLen}
          thickness={stroke}
          animated={animated}
          style={[styles.legLeft, { left: 26 * scale }]}
        />
        <StickLimb
          rotate={motion.rightLeg}
          duration={duration}
          length={legLen}
          thickness={stroke}
          animated={animated}
          style={[styles.legRight, { right: 26 * scale }]}
        />
      </View>
    </>
  );

  return (
    <View style={[styles.figureStage, { width: 72 * scale, height: 98 * scale }]}>
      {showLane ? (
        <View style={styles.runLane}>
          <View style={[styles.laneDash, { height: stroke }]} />
          <View style={[styles.laneDash, styles.laneDashMid, { height: stroke }]} />
          <View style={[styles.laneDash, styles.laneDashFar, { height: stroke }]} />
        </View>
      ) : null}

      {animated ? (
        <MotiView
          animate={{
            translateX: motion.bodyX.map((v) => v * scale),
            translateY: motion.bodyY.map((v) => v * scale),
            rotate: motion.lean,
          }}
          transition={{ type: "timing", duration, loop: true }}
          style={[styles.figureWrap, { width: 56 * scale, height: 88 * scale }]}
        >
          {body}
        </MotiView>
      ) : (
        <View style={[styles.figureWrap, { width: 56 * scale, height: 88 * scale }]}>
          {body}
        </View>
      )}
    </View>
  );
}

export function TutorialStickOnly({
  pose,
  scale = 0.68,
  cloudFill = "#FFFFFF",
  cloudAccent = "#E0F2FE",
  animated = true,
}: {
  pose: GuidePose;
  scale?: number;
  cloudFill?: string;
  cloudAccent?: string;
  animated?: boolean;
}) {
  const w = 96 * Math.max(scale, 0.7);
  const h = 80 * Math.max(scale, 0.7);

  return (
    <View
      pointerEvents="none"
      style={[styles.stickCloudWrap, { width: w + 10, height: h + 10 }]}
    >
      <View
        style={[
          styles.cloudPuff,
          styles.cloudPuffBack,
          {
            backgroundColor: cloudAccent,
            width: w * 0.6,
            height: w * 0.46,
            left: w * 0.04,
            top: h * 0.14,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          styles.cloudPuffBack,
          {
            backgroundColor: cloudAccent,
            width: w * 0.56,
            height: w * 0.44,
            right: 0,
            top: h * 0.18,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          {
            backgroundColor: cloudFill,
            width: w * 0.68,
            height: w * 0.52,
            left: w * 0.06,
            top: h * 0.22,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          {
            backgroundColor: cloudFill,
            width: w * 0.74,
            height: w * 0.56,
            left: w * 0.14,
            top: h * 0.06,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          {
            backgroundColor: cloudFill,
            width: w * 0.9,
            height: w * 0.42,
            left: w * 0.06,
            bottom: 0,
          },
        ]}
      />

      <View style={styles.stickInCloud}>
        <AnimatedStickFigure
          pose={pose}
          scale={scale}
          showLane={false}
          animated={animated}
        />
      </View>
    </View>
  );
}

export function TutorialStickRunner({
  target,
  stepKey,
  preferAbove = false,
}: {
  target: { x: number; y: number; width: number; height: number };
  stepKey: string;
  /** Sit above the control when the coach panel is below (bottom FABs/tabs). */
  preferAbove?: boolean;
}) {
  const cx = target.x + target.width / 2;
  const top = preferAbove
    ? Math.max(8, target.y - 78)
    : target.y + target.height + 10;

  return (
    <MotiView
      key={stepKey}
      pointerEvents="none"
      from={{ opacity: 0, translateX: -36 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "spring", damping: 18, stiffness: 200 }}
      style={[styles.runner, { left: Math.max(8, cx - 20), top }]}
    >
      <AnimatedStickFigure pose="point-tab" scale={0.72} showLane={false} />
    </MotiView>
  );
}

export function TutorialGuideCharacter({
  pose,
  message,
  stepKey,
  comicFont,
  labelFont,
  role,
}: Props) {
  const running = isRunningPose(pose);
  const roleLabel = role ?? (running ? "On the move" : "Your guide");

  return (
    <MotiView
      key={stepKey}
      from={{ opacity: 0, translateX: running ? -52 : -22 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "spring", damping: 16, stiffness: 240 }}
      style={styles.wrap}
    >
      <View>
        {pose === "wave" ? (
          <MotiView
            pointerEvents="none"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ type: "timing", duration: 900, loop: true }}
            style={styles.wavePop}
          >
            <Text style={styles.wavePopText}>Hi!</Text>
          </MotiView>
        ) : null}
        <AnimatedStickFigure pose={pose} />
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.94, translateY: 6 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 60, damping: 16 }}
        style={styles.bubbleCol}
      >
        <View style={styles.nameTag}>
          <Text style={[styles.name, labelFont && { fontFamily: labelFont }]}>Stick</Text>
          <Text style={[styles.role, labelFont && { fontFamily: labelFont }]}>{roleLabel}</Text>
        </View>
        <View style={styles.bubble}>
          <Text style={[styles.bubbleText, comicFont && { fontFamily: comicFont }]}>{message}</Text>
        </View>
        <View style={styles.bubbleTail} />
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  stickCloudWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  cloudPuff: {
    position: "absolute",
    borderRadius: 999,
  },
  cloudPuffBack: {
    opacity: 0.95,
  },
  stickInCloud: {
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  wavePop: {
    position: "absolute",
    top: 2,
    right: 4,
    zIndex: 5,
    backgroundColor: "#171717",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  wavePopText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  figureStage: {
    width: 72,
    height: 98,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  runLane: {
    position: "absolute",
    bottom: 2,
    left: 6,
    right: 6,
    height: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    opacity: 0.3,
  },
  laneDash: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: INK,
  },
  laneDashMid: {
    width: 8,
    opacity: 0.7,
  },
  laneDashFar: {
    width: 6,
    opacity: 0.45,
  },
  figureWrap: {
    width: 56,
    height: 88,
    alignItems: "center",
  },
  head: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: INK,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
  },
  neck: {
    width: 3,
    height: 4,
    backgroundColor: INK,
    marginTop: -1,
  },
  torso: {
    width: 3,
    height: 24,
    backgroundColor: INK,
    borderRadius: 2,
  },
  shoulderRow: {
    position: "absolute",
    top: 28,
    width: 56,
    height: 24,
  },
  hipRow: {
    position: "absolute",
    top: 50,
    width: 56,
    height: 30,
  },
  limb: {
    backgroundColor: INK,
    borderRadius: 2,
  },
  limbPivot: {
    position: "absolute",
    top: 0,
    alignItems: "center",
  },
  limbPivotInner: {
    alignItems: "center",
  },
  armLeft: {
    left: 24,
    transformOrigin: "top center",
  },
  armRight: {
    right: 24,
    transformOrigin: "top center",
  },
  legLeft: {
    left: 26,
    transformOrigin: "top center",
  },
  legRight: {
    right: 26,
    transformOrigin: "top center",
  },
  speedLines: {
    position: "absolute",
    left: 0,
    bottom: 30,
    gap: 4,
  },
  speedLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: INK,
  },
  speedLineShort: {
    width: 8,
    marginLeft: 3,
  },
  runner: {
    position: "absolute",
    zIndex: 10001,
    elevation: 10001,
    width: 52,
    alignItems: "center",
  },
  bubbleCol: {
    flex: 1,
    minWidth: 0,
  },
  nameTag: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 6,
    marginLeft: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: INK,
  },
  role: {
    fontSize: 11,
    fontWeight: "600",
    color: "#78716C",
  },
  bubble: {
    backgroundColor: "#FFFDF5",
    borderWidth: 2.5,
    borderColor: INK,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 21,
    lineHeight: 26,
    color: INK,
  },
  bubbleTail: {
    width: 12,
    height: 12,
    backgroundColor: "#FFFDF5",
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: INK,
    marginLeft: 18,
    marginTop: -7,
    transform: [{ rotate: "45deg" }],
  },
});
