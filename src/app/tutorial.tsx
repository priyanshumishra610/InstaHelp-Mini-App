/* TUTORIAL_DISABLED — legacy in-app tour kickoff (tutorialFeature.ts)
import { TUTORIAL_ENABLED } from "@/constants/tutorialFeature";
import { useTutorialStore } from "@/store/tutorialStore";
import { useEffect } from "react";
*/
import { Redirect } from "expo-router";

/** Legacy route — starts the in-app tour on the main tabs. */
export default function TutorialRoute() {
  /* TUTORIAL_DISABLED
  useEffect(() => {
    if (!TUTORIAL_ENABLED) return;
    useTutorialStore.getState().startTutorial();
  }, []);
  */

  return <Redirect href="/(tabs)" />;
}
