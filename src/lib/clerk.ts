import { tokenCache } from "@clerk/expo/token-cache";

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY);

export { tokenCache };

export function assertClerkPublishableKey(): string {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.",
    );
  }
  return CLERK_PUBLISHABLE_KEY;
}
