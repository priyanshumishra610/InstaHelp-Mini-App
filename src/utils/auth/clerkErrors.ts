import { isClerkAPIResponseError } from "@clerk/expo";

export function clerkErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
