"use client";

import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/components/StoreProvider";
import { useResolvedProducts } from "@/components/useResolvedProducts";
import { AlertIcon, BagIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 250;

export function CartView() {
  const { cart, hydrated, setQuantity, removeFromCart, clearCart } = useStore();
  const { products, loading, error } = useResolvedProducts(
    cart.map((item) => item.productId),
  );

  // Join the client's quantities onto the server's product data. Products that
  // no longer exist simply drop out of the bag.
  const lines = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  if (!hydrated || (loading && lines.length === 0 && cart.length > 0)) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        tone="error"
        icon={<AlertIcon />}
        title="We couldn't load your bag"
        description={error}
        action={{ href: "/products", label: "Continue shopping" }}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<BagIcon />}
        title="Your bag is empty"
        description="Pieces you add to your bag will appear here, and stay saved to your account once you sign in."
        action={{ href: "/products", label: "Browse the collection" }}
      />
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.65fr_1fr] lg:gap-16">
      <section aria-label="Bag contents">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <p className="eyebrow text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="eyebrow link-underline text-muted transition-colors hover:text-ink"
          >
            Empty bag
          </button>
        </div>

        <ul className="divide-y divide-line">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 py-6 sm:gap-6">
              <Link
                href={`/products/${product.id}`}
                className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-bone-deep sm:w-32"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 640px) 128px, 96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow text-muted">{product.category}</p>
                    <h2 className="mt-1 font-display text-lg leading-snug sm:text-xl">
                      <Link href={`/products/${product.id}`} className="link-underline">
                        {product.name}
                      </Link>
                    </h2>
                    {!product.inStock && (
                      <p className="mt-1 text-xs text-red-700">
                        This piece has sold out.
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-sm text-ink-soft sm:text-base">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={`Decrease quantity of ${product.name}`}
                      className="flex h-9 w-9 items-center justify-center text-sm transition-colors hover:bg-bone-deep"
                    >
                      <MinusIcon />
                    </button>
                    <span
                      aria-live="polite"
                      className="w-10 text-center text-sm tabular-nums"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      aria-label={`Increase quantity of ${product.name}`}
                      className="flex h-9 w-9 items-center justify-center text-sm transition-colors hover:bg-bone-deep"
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product)}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
                  >
                    <TrashIcon className="text-sm" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside aria-labelledby="summary-heading" className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-line bg-white/60 p-6 md:p-8">
          <h2 id="summary-heading" className="font-display text-2xl">
            Order summary
          </h2>

          <dl className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? "Complimentary" : "Calculated at checkout"}
              </dd>
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-4 text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn btn-primary mt-7 w-full">
            Checkout
          </Link>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            Pay by Salaam Bank transfer or EVC Plus, then confirm your order on
            WhatsApp.
          </p>

          <Link
            href="/products"
            className="link-underline mt-6 block text-center text-xs uppercase tracking-[0.14em] text-muted hover:text-ink"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}

/** Matches the real layout so the page doesn't jump when data lands. */
function CartSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.65fr_1fr] lg:gap-16" aria-hidden="true">
      <div className="flex flex-col gap-6">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-4 border-b border-line pb-6 sm:gap-6">
            <div className="aspect-[4/5] w-24 animate-pulse bg-bone-deep sm:w-32" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-20 animate-pulse bg-bone-deep" />
              <div className="h-5 w-2/3 animate-pulse bg-bone-deep" />
              <div className="h-9 w-28 animate-pulse bg-bone-deep" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse border border-line bg-bone-deep/60" />
    </div>
  );
}
