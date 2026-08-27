import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton, BuyNowButton } from "@/components/CartButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/products/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const product = await getProductById(id);
    if (!product) return { title: "Product not found" };

    return {
      title: product.name,
      description: product.description || `${product.name} — ${product.category}.`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [{ url: product.imageUrl }],
      },
    };
  } catch {
    // Metadata must never break the page render.
    return { title: "Product" };
  }
}

export default async function ProductDetailPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;

  const product = await getProductById(id);
  if (!product) notFound();

  // A failed "you may also like" query should not take the page down.
  const related = await getProducts({ category: product.category, limit: 5 })
    .then((items) => items.filter((item) => item.id !== product.id).slice(0, 4))
    .catch(() => []);

  return (
    <div className="shell py-10 md:py-16">
      <nav aria-label="Breadcrumb" className="eyebrow text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="link-underline hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="link-underline hover:text-ink">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone-deep">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            preload
            quality={90}
            className="object-cover"
          />
          {!product.inStock && (
            <span className="absolute left-4 top-4 bg-scrim px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.16em] text-on-scrim">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-col md:pt-6">
          <p className="eyebrow text-brass">{product.category}</p>

          <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-xl text-ink-soft">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted md:text-base">
              {product.description}
            </p>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-6 text-sm">
            <dt className="eyebrow text-muted">Category</dt>
            <dd className="text-right text-ink-soft">{product.category}</dd>
            <dt className="eyebrow text-muted">Availability</dt>
            <dd className="text-right text-ink-soft">
              {product.inStock ? "In stock" : "Sold out"}
            </dd>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* A sold-out piece shows one disabled control, not two identical ones. */}
            {product.inStock ? (
              <>
                <BuyNowButton product={product} className="flex-1" />
                <AddToCartButton product={product} className="flex-1" />
              </>
            ) : (
              <button type="button" disabled className="btn btn-outline flex-1">
                Sold out
              </button>
            )}
            <FavoriteButton product={product} variant="inline" />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Complimentary worldwide shipping on orders over $250. Returns accepted
            within 30 days in original condition.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-24 md:mt-32">
          <h2 id="related-heading" className="font-display text-3xl md:text-4xl">
            You may also like
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
