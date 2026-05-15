import { useHubbleDeepLinks } from "@/hooks/useHubbleDeepLinks";
import { useAppAuth } from "@/hooks/auth/useAppAuth";

export function HubbleLinkingBridge() {
  const { isAuthenticated: enabled } = useAppAuth();
  useHubbleDeepLinks(enabled);
  return null;
}
