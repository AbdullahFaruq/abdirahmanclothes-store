"use client";

import type { CartItem } from "@/types";

/**
 * localStorage-backed store for the guest cart and favorites, exposed as a
 * `useSyncExternalStore` source. Modelling it as an external store (rather than
 * reading storage inside an effect) keeps hydration correct and gives cross-tab
 * updates for free.
 */
export type StoreSnapshot = {
  cart: CartItem[];
  favorites: string[];
};

const CART_KEY = "aas.cart.v1";
const FAVORITES_KEY = "aas.favorites.v1";

/** Stable reference — what the server renders and what hydration starts from. */
const EMPTY: StoreSnapshot = Object.freeze({ cart: [], favorites: [] });

let snapshot: StoreSnapshot | null = null;
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Private mode, cleared storage, or corrupt JSON — start clean.
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the in-memory snapshot still works.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep other tabs of the same store in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY || event.key === FAVORITES_KEY || event.key === null) {
      snapshot = null;
      emit();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): StoreSnapshot {
  // Cached so repeated renders get a referentially stable object.
  snapshot ??= {
    cart: read<CartItem[]>(CART_KEY, []),
    favorites: read<string[]>(FAVORITES_KEY, []),
  };
  return snapshot;
}

export function getServerSnapshot(): StoreSnapshot {
  return EMPTY;
}

export function setStoreState(next: StoreSnapshot): void {
  snapshot = next;
  write(CART_KEY, next.cart);
  write(FAVORITES_KEY, next.favorites);
  emit();
}

/** Reports `false` while rendering on the server, `true` once mounted. */
export const hydrationStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};
