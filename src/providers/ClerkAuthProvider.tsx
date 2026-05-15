import { assertClerkPublishableKey, tokenCache } from "@/lib/clerk";
import { ClerkProvider } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  children: ReactNode;
};

export function ClerkAuthProvider({ children }: Props) {
  return (
    <ClerkProvider
      publishableKey={assertClerkPublishableKey()}
      tokenCache={tokenCache}
    >
      {children}
    </ClerkProvider>
  );
}
