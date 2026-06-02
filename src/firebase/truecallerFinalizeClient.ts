import { getPublicEnv } from "@/config/env";
import { getFirebaseApp } from "@/firebase/config";
import { getFunctions, httpsCallable } from "firebase/functions";

export type TruecallerFinalizeResponse = {
  customToken: string;
  profile: {
    uid: string;
    phoneNumber: string;
    fullName: string;
    email: string | null;
    profileImage: string | null;
  };
};

export async function finalizeTruecallerWithServer(params: {
  authorizationCode: string;
  codeVerifier: string;
}): Promise<TruecallerFinalizeResponse> {
  const app = getFirebaseApp();
  const region = getPublicEnv("EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION", "us-central1");

  const functionsInstance = getFunctions(app, region);
  const finalize = httpsCallable(functionsInstance, "truecallerFinalize");

  const res = await finalize({
    authorizationCode: params.authorizationCode,
    codeVerifier: params.codeVerifier,
  });

  const data = res.data as Partial<TruecallerFinalizeResponse>;

  if (typeof data.customToken !== "string" || data.customToken.length === 0) {
    throw new Error("Callable truecallerFinalize did not return customToken.");
  }

  const profilePartial = data.profile;

  const profile =
    typeof profilePartial?.uid === "string" &&
    typeof profilePartial?.phoneNumber === "string"
      ? {
          uid: profilePartial.uid,
          phoneNumber: profilePartial.phoneNumber,
          fullName: typeof profilePartial.fullName === "string" ? profilePartial.fullName : "",
          email:
            typeof profilePartial.email === "string" || profilePartial.email === null
              ? profilePartial.email ?? null
              : null,
          profileImage:
            typeof profilePartial.profileImage === "string" || profilePartial.profileImage === null
              ? profilePartial.profileImage ?? null
              : null,
        }
      : {
          uid: "",
          phoneNumber: "",
          fullName: "",
          email: null,
          profileImage: null,
        };

  return { customToken: data.customToken, profile };
}
