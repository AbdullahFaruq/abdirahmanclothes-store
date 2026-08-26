import Image from "next/image";
import Link from "next/link";

import { AddToCartButton, BuyNowButton } from "@/components/CartButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  /** Load without waiting for scroll — use for the first visible row. */
  eager?: boolean;
}) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone-deep">
        <Link
          href={`/products/${product.id}`}
          // `relative` matters: it is the positioned parent the `fill` image
          // sizes itself against.
          className="relative block h-full w-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 90vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
          />
        </Link>

        <FavoriteButton product={product} />

        {!product.inStock && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-bone">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow text-muted">{product.category}</p>

        <h3 className="mt-1.5 font-display text-xl leading-snug">
          <Link href={`/products/${product.id}`} className="link-underline">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-ink-soft">{formatPrice(product.price)}</p>

        {/* Stacked full-width so the labels never wrap in a narrow card, and
            a sold-out piece shows one disabled control rather than two. */}
        <div className="mt-4 flex flex-col gap-2">
          {product.inStock ? (
            <>
              <BuyNowButton product={product} className="w-full !px-4 !py-3 !text-[0.6875rem]" />
              <AddToCartButton
                product={product}
                className="w-full !px-4 !py-3 !text-[0.6875rem]"
              />
            </>
          ) : (
            <button
              type="button"
              disabled
              className="btn btn-outline w-full !px-4 !py-3 !text-[0.6875rem]"
            >
              Sold out
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
