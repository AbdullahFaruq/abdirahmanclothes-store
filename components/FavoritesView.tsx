"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { useResolvedProducts } from "@/components/useResolvedProducts";
import { MAX_RESOLVE_IDS } from "@/lib/catalogLimits";
import { AlertIcon, HeartIcon } from "@/components/icons";

export function FavoritesView() {
  const { favorites, hydrated, pruneFavorites } = useStore();
  const { products, loading, error } = useResolvedProducts(favorites);

  // Same reconciliation as the bag: drop hearts whose product is gone, but
  // only when the lookup actually returned.
  useEffect(() => {
    // A truncated lookup would report the overflow as missing.
    if (loading || error || favorites.length === 0) return;
    if (favorites.length > MAX_RESOLVE_IDS) return;
    pruneFavorites(products.map((product) => product.id));
  }, [loading, error, products, favorites, pruneFavorites]);

  if (!hydrated || (loading && favorites.length > 0)) {
    return (
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className="flex flex-col gap-4">
            <div className="aspect-[4/5] w-full animate-pulse bg-bone-deep" />
            <div className="h-3 w-16 animate-pulse bg-bone-deep" />
            <div className="h-5 w-3/4 animate-pulse bg-bone-deep" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        tone="error"
        icon={<AlertIcon />}
        title="We couldn't load your favorites"
        description={error}
        action={{ href: "/products", label: "Browse the collection" }}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<HeartIcon />}
        title="No favorites yet"
        description="Tap the heart on any piece to save it here. Favorites follow you to every device once you sign in."
        action={{ href: "/products", label: "Find something to love" }}
      />
    );
  }

  return (
    <>
      <p className="eyebrow mb-8 text-muted">
        {products.length} {products.length === 1 ? "piece saved" : "pieces saved"}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} eager={index < 4} />
        ))}
      </div>
    </>
  );
}
