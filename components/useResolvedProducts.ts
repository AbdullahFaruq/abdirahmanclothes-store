"use client";

import { useEffect, useState } from "react";

import { resolveProducts } from "@/app/actions/catalog";
import type { Product } from "@/types";

type State = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

type Resolved = {
  /** The id list this result belongs to, so stale results are ignored. */
  key: string;
  products: Product[];
  error: string | null;
};

/**
 * Expands the product ids held in client state into full products. Loading is
 * derived from whether the stored result matches the ids being asked for, so
 * changing the ids shows a loading state without any extra setState.
 */
export function useResolvedProducts(ids: string[]): State {
  const key = ids.join(",");
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (!key) return;

    let cancelled = false;

    void resolveProducts(key.split(",")).then((result) => {
      if (cancelled) return;
      setResolved(
        result.ok
          ? { key, products: result.data, error: null }
          : { key, products: [], error: result.error },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) return { products: [], loading: false, error: null };
  if (!resolved || resolved.key !== key) {
    return { products: [], loading: true, error: null };
  }

  return { products: resolved.products, loading: false, error: resolved.error };
}
