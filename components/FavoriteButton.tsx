"use client";

import { HeartIcon } from "@/components/icons";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/types";

/**
 * Heart toggle. `overlay` is the version that sits on a product image;
 * `inline` is the version used beside the buy controls on a detail page.
 */
export function FavoriteButton({
  product,
  variant = "overlay",
}: {
  product: Pick<Product, "id" | "name">;
  variant?: "overlay" | "inline";
}) {
  const { isFavorite, toggleFavorite, hydrated } = useStore();
  const favorited = hydrated && isFavorite(product.id);

  const label = favorited
    ? `Remove ${product.name} from favorites`
    : `Save ${product.name} to favorites`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggleFavorite(product)}
        aria-pressed={favorited}
        aria-label={label}
        className="btn btn-outline gap-2.5"
      >
        <HeartIcon
          filled={favorited}
          className={`text-base transition-transform duration-300 ${favorited ? "scale-110" : ""}`}
        />
        {favorited ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(product)}
      aria-pressed={favorited}
      aria-label={label}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-on-scrim/90 text-base text-scrim shadow-[0_2px_10px_-4px_rgba(11,11,12,0.4)] backdrop-blur-sm transition-all duration-300 hover:bg-on-scrim hover:text-brass focus-visible:opacity-100 md:h-10 md:w-10"
    >
      <HeartIcon
        filled={favorited}
        className={`transition-all duration-300 ${favorited ? "scale-110 text-brass" : ""}`}
      />
    </button>
  );
}
