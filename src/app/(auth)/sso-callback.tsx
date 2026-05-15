import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";

/** Deep-link target for OAuth; `useSSO` completes the session in-browser. */
export default function SsoCallbackRoute() {
  return <AuthLoadingSkeleton />;
}
