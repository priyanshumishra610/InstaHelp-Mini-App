import { Redirect } from "expo-router";
/* TUTORIAL_DISABLED — comic intro screen (tutorialFeature.ts)
import { TUTORIAL_ENABLED } from "@/constants/tutorialFeature";
import { AppTutorialScreen } from "@/screens/onboarding/AppTutorialScreen";
*/

export default function TutorialRoute() {
  return <Redirect href="/(auth)/phone" />;

  /* TUTORIAL_DISABLED — restore when re-enabling (tutorialFeature.ts)
  if (!TUTORIAL_ENABLED) {
    return <Redirect href="/(auth)/phone" />;
  }
  return <AppTutorialScreen />;
  */
}
