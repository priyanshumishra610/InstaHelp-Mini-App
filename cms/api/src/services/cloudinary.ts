import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function initCloudinary(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return true;
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export async function getSignedUploadParams(folder?: string) {
  if (!configured) throw new Error("Cloudinary not configured");
  const uploadFolder =
    folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? "instahelp-cms";
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: uploadFolder,
    transformation: "q_auto,f_auto",
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

export function optimizeImageUrl(url: string, width = 800): string {
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

export { cloudinary };
