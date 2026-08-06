import { useTutorialStore } from "@/store/tutorialStore";
import { Redirect } from "expo-router";
import { useEffect } from "react";

/** Legacy route — starts the in-app tour on the main tabs. */
export default function TutorialRoute() {
  useEffect(() => {
    useTutorialStore.getState().startTutorial();
  }, []);

  return <Redirect href="/(tabs)" />;
}
