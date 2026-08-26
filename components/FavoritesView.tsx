"use client";

import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { useResolvedProducts } from "@/components/useResolvedProducts";
import { AlertIcon, HeartIcon } from "@/components/icons";

export function FavoritesView() {
  const { favorites, hydrated } = useStore();
  const { products, loading, error } = useResolvedProducts(favorites);

  if (!hydrated || (loading && favorites.length > 0)) {
    return (
      <div
        className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
      <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} eager={index < 4} />
        ))}
      </div>
    </>
  );
}
