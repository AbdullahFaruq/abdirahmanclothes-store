"use server";

import { getProductsByIds } from "@/lib/data";
import { MAX_RESOLVE_IDS } from "@/lib/catalogLimits";
import type { ActionResult, Product } from "@/types";

/**
 * Cart and favorites are held client-side as bare product ids, so the cart and
 * favorites pages ask the server to expand them into full products. Public
 * data — no auth required — but still server-side so prices can never be
 * tampered with from the client.
 */
export async function resolveProducts(ids: string[]): Promise<ActionResult<Product[]>> {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { ok: true, data: [] };
    // Cap the request so a tampered localStorage payload cannot fan out.
    return { ok: true, data: await getProductsByIds(ids.slice(0, MAX_RESOLVE_IDS)) };
  } catch (error) {
    console.error("[resolveProducts]", error);
    return { ok: false, error: "We couldn't load these items. Please try again." };
  }
}
