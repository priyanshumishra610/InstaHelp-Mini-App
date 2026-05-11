import { AnimatedSplash } from "@/components/ui/AnimatedSplash";
import { useAuthHydration } from "@/hooks/usePersistHydration";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Index() {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [animationDone, setAnimationDone] = useState(false);
  const navigated = useRef(false);

  const handleFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (navigated.current) return;
    if (!hydrated) return;
    if (!animationDone) return;
    navigated.current = true;
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/phone");
    }
  }, [animationDone, hydrated, isAuthenticated, router]);

  return <AnimatedSplash onFinish={handleFinish} minDurationMs={2400} />;
}
