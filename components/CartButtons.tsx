"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BagIcon, CheckIcon } from "@/components/icons";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/types";

type ProductRef = Pick<Product, "id" | "name" | "inStock">;

/** Adds to the bag and flips to a confirmed state for a moment. */
export function AddToCartButton({
  product,
  className = "",
  quantity = 1,
}: {
  product: ProductRef;
  className?: string;
  quantity?: number;
}) {
  const { addToCart } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  if (!product.inStock) {
    return (
      <button type="button" disabled className={`btn btn-outline ${className}`}>
        Sold out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(product, quantity);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1600);
      }}
      className={`btn btn-outline gap-2 ${className}`}
    >
      {justAdded ? (
        <>
          <CheckIcon className="text-base" />
          Added
        </>
      ) : (
        <>
          <BagIcon className="text-base" />
          Add to Cart
        </>
      )}
    </button>
  );
}

/** Adds the item, then takes the shopper straight to their bag to check out. */
export function BuyNowButton({
  product,
  className = "",
  quantity = 1,
}: {
  product: ProductRef;
  className?: string;
  quantity?: number;
}) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!product.inStock) {
    return (
      <button type="button" disabled className={`btn btn-primary ${className}`}>
        Sold out
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        addToCart(product, quantity);
        router.push("/cart");
      }}
      className={`btn btn-primary ${className}`}
    >
      {pending ? "Opening bag…" : "Buy Now"}
    </button>
  );
}
