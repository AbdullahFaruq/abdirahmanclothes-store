"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { mergeGuestState, saveCart, setFavorite } from "@/app/actions/store";
import { useToast } from "@/components/ToastProvider";
import {
  getServerSnapshot,
  getSnapshot,
  hydrationStore,
  setStoreState,
  subscribe,
} from "@/lib/clientStore";
import type { CartItem } from "@/types";

const MAX_QUANTITY = 99;

type StoreContextValue = {
  cart: CartItem[];
  favorites: string[];
  /** False during the server render and first hydration pass. */
  hydrated: boolean;
  cartCount: number;
  favoriteCount: number;
  isFavorite: (productId: string) => boolean;
  quantityOf: (productId: string) => number;
  addToCart: (product: { id: string; name: string }, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (product: { id: string; name: string }) => void;
  clearCart: () => void;
  toggleFavorite: (product: { id: string; name: string }) => void;
  /**
   * Drops stored entries whose product no longer exists. Deleting a product
   * clears it from server-side carts, but nothing can reach a browser's
   * localStorage — so the bag kept counting items the cart page could not
   * show. Pass the ids the catalogue actually returned.
   */
  pruneCart: (availableIds: string[]) => void;
  pruneFavorites: (availableIds: string[]) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}

/**
 * Cart and favorites live in localStorage so guests can shop immediately, then
 * mirror to MongoDB once signed in. On sign-in the guest basket is merged into
 * the account rather than thrown away.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { toast } = useToast();

  const { cart, favorites } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot,
  );

  // Which Clerk user we have already merged, so the sync runs once per sign-in.
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === userId) return;
    mergedFor.current = userId;

    let cancelled = false;

    // Read the live snapshot here rather than depending on it, so the merge
    // runs once per sign-in instead of on every basket change.
    void mergeGuestState(getSnapshot()).then((result) => {
      if (cancelled || !result.ok) return;
      setStoreState({ cart: result.data.cart, favorites: result.data.favorites });
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  /** Applies a cart change locally, then persists it for signed-in users. */
  const commitCart = useCallback(
    (next: CartItem[]) => {
      setStoreState({ cart: next, favorites });
      if (isSignedIn) void saveCart(next);
    },
    [favorites, isSignedIn],
  );

  const addToCart = useCallback(
    (product: { id: string; name: string }, quantity = 1) => {
      const existing = cart.find((item) => item.productId === product.id);
      const nextQuantity = Math.min(MAX_QUANTITY, (existing?.quantity ?? 0) + quantity);

      commitCart(
        existing
          ? cart.map((item) =>
              item.productId === product.id ? { ...item, quantity: nextQuantity } : item,
            )
          : [...cart, { productId: product.id, quantity }],
      );

      toast(
        existing
          ? `${product.name} — quantity updated to ${nextQuantity}.`
          : `${product.name} added to your bag.`,
      );
    },
    [cart, commitCart, toast],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const clamped = Math.max(0, Math.min(MAX_QUANTITY, Math.floor(quantity)));

      commitCart(
        clamped === 0
          ? cart.filter((item) => item.productId !== productId)
          : cart.map((item) =>
              item.productId === productId ? { ...item, quantity: clamped } : item,
            ),
      );
    },
    [cart, commitCart],
  );

  const removeFromCart = useCallback(
    (product: { id: string; name: string }) => {
      commitCart(cart.filter((item) => item.productId !== product.id));
      toast(`${product.name} removed from your bag.`);
    },
    [cart, commitCart, toast],
  );

  const clearCart = useCallback(() => {
    commitCart([]);
    toast("Your bag has been emptied.");
  }, [commitCart, toast]);

  const toggleFavorite = useCallback(
    (product: { id: string; name: string }) => {
      const isFavorited = favorites.includes(product.id);

      setStoreState({
        cart,
        favorites: isFavorited
          ? favorites.filter((id) => id !== product.id)
          : [product.id, ...favorites],
      });

      if (isSignedIn) void setFavorite(product.id, !isFavorited);

      toast(
        isFavorited
          ? `${product.name} removed from favorites.`
          : `${product.name} saved to favorites.`,
      );
    },
    [cart, favorites, isSignedIn, toast],
  );

  const pruneCart = useCallback(
    (availableIds: string[]) => {
      const alive = new Set(availableIds);
      const kept = cart.filter((item) => alive.has(item.productId));
      if (kept.length === cart.length) return;

      const removed = cart.length - kept.length;
      // Tell the shopper rather than letting the count quietly drop.
      toast(
        removed === 1
          ? "One piece in your bag is no longer available, so we removed it."
          : `${removed} pieces in your bag are no longer available, so we removed them.`,
      );
      commitCart(kept);
    },
    [cart, commitCart, toast],
  );

  const pruneFavorites = useCallback(
    (availableIds: string[]) => {
      const alive = new Set(availableIds);
      const kept = favorites.filter((id) => alive.has(id));
      if (kept.length === favorites.length) return;

      setStoreState({ cart, favorites: kept });
      // The server rows were already removed with the product itself, so there
      // is nothing to persist here.
    },
    [cart, favorites],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      favorites,
      hydrated,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      favoriteCount: favorites.length,
      isFavorite: (productId) => favorites.includes(productId),
      quantityOf: (productId) =>
        cart.find((item) => item.productId === productId)?.quantity ?? 0,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toggleFavorite,
      pruneCart,
      pruneFavorites,
    }),
    [
      cart,
      favorites,
      hydrated,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toggleFavorite,
      pruneCart,
      pruneFavorites,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
