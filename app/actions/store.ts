"use server";

import { AuthError, getStoreUser, syncUserToDatabase } from "@/lib/auth";
import { getCartItems, getFavoriteIds, isValidObjectId } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { CartModel } from "@/lib/models/Cart";
import { FavoriteModel } from "@/lib/models/Favorite";
import type { ActionResult, CartItem } from "@/types";

/**
 * Cart and favorites live in localStorage for guests so the store is usable
 * without an account. Once signed in, MongoDB becomes the source of truth and
 * these actions keep the two in step.
 */

export type StoreState = {
  cart: CartItem[];
  favorites: string[];
};

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof AuthError) return { ok: false, error: error.message };
  console.error("[store action]", error);
  return { ok: false, error: "We could not save your changes. Please try again." };
}

function sanitizeCart(items: CartItem[]): CartItem[] {
  const merged = new Map<string, number>();

  for (const item of items) {
    if (!isValidObjectId(item.productId)) continue;
    const quantity = Math.min(99, Math.max(1, Math.floor(Number(item.quantity) || 1)));
    merged.set(item.productId, Math.min(99, (merged.get(item.productId) ?? 0) + quantity));
  }

  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Called by the client right after sign-in: whatever the guest collected is
 * merged into the account rather than discarded, and the merged result becomes
 * the new client state.
 */
export async function mergeGuestState(guest: StoreState): Promise<ActionResult<StoreState>> {
  try {
    const user = await getStoreUser();
    if (!user) return { ok: false, error: "You must be signed in to sync." };

    await syncUserToDatabase(user);
    await connectToDatabase();

    const [serverCart, serverFavorites] = await Promise.all([
      getCartItems(user.clerkId),
      getFavoriteIds(user.clerkId),
    ]);

    // Quantities add up when the same product exists on both sides.
    const cart = sanitizeCart([...serverCart, ...sanitizeCart(guest.cart ?? [])]);
    await CartModel.updateOne(
      { userId: user.clerkId },
      { $set: { items: cart } },
      { upsert: true },
    ).exec();

    const guestFavorites = (guest.favorites ?? []).filter(isValidObjectId);
    const newFavorites = guestFavorites.filter((id) => !serverFavorites.includes(id));
    if (newFavorites.length > 0) {
      await FavoriteModel.insertMany(
        newFavorites.map((productId) => ({ userId: user.clerkId, productId })),
        // A racing duplicate must not abort the whole merge.
        { ordered: false },
      ).catch(() => undefined);
    }

    return {
      ok: true,
      data: { cart, favorites: [...new Set([...serverFavorites, ...guestFavorites])] },
    };
  } catch (error) {
    return toResult(error);
  }
}

/** Persists the whole cart. The client already holds the authoritative list. */
export async function saveCart(items: CartItem[]): Promise<ActionResult> {
  try {
    const user = await getStoreUser();
    // Guests persist to localStorage only — not an error.
    if (!user) return { ok: true, data: undefined };

    await connectToDatabase();
    await CartModel.updateOne(
      { userId: user.clerkId },
      { $set: { items: sanitizeCart(items) } },
      { upsert: true },
    ).exec();

    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}

export async function setFavorite(
  productId: string,
  favorited: boolean,
): Promise<ActionResult> {
  try {
    const user = await getStoreUser();
    if (!user) return { ok: true, data: undefined };
    if (!isValidObjectId(productId)) return { ok: false, error: "Unknown product." };

    await connectToDatabase();

    if (favorited) {
      await FavoriteModel.updateOne(
        { userId: user.clerkId, productId },
        { $setOnInsert: { userId: user.clerkId, productId } },
        { upsert: true },
      ).exec();
    } else {
      await FavoriteModel.deleteOne({ userId: user.clerkId, productId }).exec();
    }

    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}
