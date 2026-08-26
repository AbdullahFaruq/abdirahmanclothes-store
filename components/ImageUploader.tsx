"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { AlertIcon, CloseIcon, SpinnerIcon, UploadIcon } from "@/components/icons";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadedImage = {
  url: string;
  publicId: string | null;
};

type SignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/**
 * Two-step secure upload: ask our admin-only API for a folder-scoped signature,
 * then POST the file straight to Cloudinary. The API secret never reaches the
 * browser and the file never passes through the Next.js server.
 */
export function ImageUploader({
  folder,
  value,
  onChange,
  label = "Image",
}: {
  folder: "products" | "hero";
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Please choose a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 8 MB. Please choose a smaller file.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!signatureResponse.ok) {
        const body = (await signatureResponse.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "Could not authorize the upload.");
      }

      const signature = (await signatureResponse.json()) as SignatureResponse;
      const uploaded = await postToCloudinary(file, signature, setProgress);
      onChange(uploaded);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      // Allow re-selecting the same file after an error.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="field-label">{label}</span>

      {value?.url ? (
        <div className="relative aspect-[4/5] w-full max-w-56 overflow-hidden border border-line bg-bone-deep">
          <Image
            src={value.url}
            alt="Selected upload preview"
            fill
            sizes="224px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            aria-label="Remove this image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bone/90 text-base text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <label
          className={`flex aspect-[4/5] w-full max-w-56 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-4 text-center transition-colors ${
            uploading
              ? "border-line bg-bone-deep"
              : "border-line hover:border-ink hover:bg-bone-deep/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />

          {uploading ? (
            <>
              <SpinnerIcon className="text-2xl text-muted" />
              <span className="eyebrow text-muted">Uploading {progress}%</span>
              <span
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
                className="h-0.5 w-full max-w-32 overflow-hidden bg-line"
              >
                <span
                  className="block h-full bg-ink transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </>
          ) : (
            <>
              <UploadIcon className="text-2xl text-muted" />
              <span className="eyebrow text-muted">Choose an image</span>
              <span className="text-[0.6875rem] leading-relaxed text-muted">
                JPG, PNG, WebP or AVIF — up to 8 MB
              </span>
            </>
          )}
        </label>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-red-700"
        >
          <AlertIcon className="mt-0.5 shrink-0 text-sm" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * XHR rather than fetch — it is the only way to report real upload progress,
 * which matters for large product photography on slow connections.
 */
function postToCloudinary(
  file: File,
  signature: SignatureResponse,
  onProgress: (percent: number) => void,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("signature", signature.signature);
    body.append("folder", signature.folder);

    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    );

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      try {
        const response = JSON.parse(request.responseText) as {
          secure_url?: string;
          public_id?: string;
          error?: { message?: string };
        };

        if (request.status >= 200 && request.status < 300 && response.secure_url) {
          resolve({
            url: response.secure_url,
            publicId: response.public_id ?? null,
          });
        } else {
          reject(new Error(response.error?.message ?? "Cloudinary rejected the upload."));
        }
      } catch {
        reject(new Error("Cloudinary returned an unexpected response."));
      }
    });

    request.addEventListener("error", () =>
      reject(new Error("Network error while uploading. Check your connection.")),
    );
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    request.send(body);
  });
}
