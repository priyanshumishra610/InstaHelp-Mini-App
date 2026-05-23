import { getFirebaseStorage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/** Upload a vendor image; returns a public download URL for Firestore `images[]`. */
export async function uploadVendorImage(
  vendorId: string,
  fileName: string,
  bytes: Uint8Array | ArrayBuffer,
  contentType = "image/jpeg",
): Promise<string> {
  const storage = getFirebaseStorage();
  const objectRef = ref(storage, `vendors/${vendorId}/${fileName}`);
  await uploadBytes(objectRef, bytes, { contentType });
  return getDownloadURL(objectRef);
}
