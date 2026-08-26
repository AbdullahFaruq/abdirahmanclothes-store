import "server-only";

import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_FOLDER = "abdirahman-asad-store";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add your Cloudinary credentials to .env.local (see .env.example).`,
    );
  }
  return value;
}

export function getCloudinary() {
  cloudinary.config({
    cloud_name: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  return cloudinary;
}

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/**
 * Signs a direct browser -> Cloudinary upload. The API secret never leaves the
 * server, and the signature pins the folder so a leaked signature cannot be
 * used to write anywhere else in the account.
 */
export function createUploadSignature(subfolder: "products" | "hero"): UploadSignature {
  const client = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CLOUDINARY_FOLDER}/${subfolder}`;

  const signature = client.utils.api_sign_request(
    { folder, timestamp },
    requireEnv("CLOUDINARY_API_SECRET"),
  );

  return {
    signature,
    timestamp,
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    cloudName: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    folder,
  };
}

/** Best-effort cleanup so deleting a product does not orphan its asset. */
export async function destroyImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch (error) {
    // A failed cleanup must not fail the user's delete — log and move on.
    console.error("[cloudinary] failed to destroy asset", publicId, error);
  }
}
