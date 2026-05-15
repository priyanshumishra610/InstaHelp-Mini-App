import { AnimatedSplash } from "@/components/ui/AnimatedSplash";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthHydration } from "@/hooks/usePersistHydration";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Index() {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const destination = useAuthDestination();

  const [animationDone, setAnimationDone] = useState(false);
  const navigated = useRef(false);

  const handleFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (navigated.current) return;
    if (!hydrated) return;
    if (!animationDone) return;
    if (!destination) return;
    navigated.current = true;
    router.replace(destination);
  }, [animationDone, destination, hydrated, router]);

  return <AnimatedSplash onFinish={handleFinish} minDurationMs={2400} />;
}
