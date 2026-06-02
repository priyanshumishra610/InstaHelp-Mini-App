import { useHubbleDeepLinks } from "@/hooks/useHubbleDeepLinks";
import { useAppAuth } from "@/hooks/auth/useAppAuth";

export function HubbleLinkingBridge() {
  const { isLoaded: enabled } = useAppAuth();
  useHubbleDeepLinks(enabled);
  return null;
}
