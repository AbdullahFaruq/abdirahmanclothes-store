import { NextResponse } from "next/server";

import { AuthError, requireAdmin } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

/**
 * Hands an admin a short-lived, folder-scoped signature so the browser can
 * upload straight to Cloudinary. The API secret stays on the server, and large
 * files never pass through the Next.js server action body limit.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = (await request.json().catch(() => ({}))) as { folder?: string };
    const folder = body.folder === "hero" ? "hero" : "products";

    return NextResponse.json(createUploadSignature(folder));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[cloudinary signature]", error);
    return NextResponse.json(
      { error: "Cloudinary is not configured. Check your environment variables." },
      { status: 500 },
    );
  }
}
