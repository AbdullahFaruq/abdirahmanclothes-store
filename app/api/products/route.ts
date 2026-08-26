import { NextResponse } from "next/server";

import { getProducts } from "@/lib/data";

/** Public read-only product feed. All writes go through Server Actions. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const limitParam = Number(searchParams.get("limit"));

    const products = await getProducts({
      category,
      featuredOnly: searchParams.get("featured") === "true",
      limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[api/products]", error);
    return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  }
}
