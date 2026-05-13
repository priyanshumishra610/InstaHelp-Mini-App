import { useHubbleDeepLinks } from "@/hooks/useHubbleDeepLinks";
import { useAuthStore } from "@/store/authStore";

export function HubbleLinkingBridge() {
  const enabled = useAuthStore((s) => s.isAuthenticated);
  useHubbleDeepLinks(enabled);
  return null;
}
