import type {
  BottomTabSceneStyleInterpolator,
  TransitionSpec,
} from "@react-navigation/bottom-tabs";
import { Dimensions, Easing } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

/** Horizontal page slide when switching tabs. */
export const slideSceneInterpolator: BottomTabSceneStyleInterpolator = ({
  current,
}) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, -0.35, 0, 0.35, 1],
      outputRange: [0, 1, 1, 1, 0],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-SCREEN_WIDTH * 0.55, 0, SCREEN_WIDTH * 0.55],
        }),
      },
    ],
  },
});

export const slideTransitionSpec: TransitionSpec = {
  animation: "timing",
  config: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
};
