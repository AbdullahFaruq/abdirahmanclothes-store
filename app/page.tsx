import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { AlertIcon, BagIcon } from "@/components/icons";
import { getHeroImages, getProducts } from "@/lib/data";
import type { HeroImage, Product } from "@/types";

// Product and hero content is admin-editable, so render per request rather
// than prerendering a snapshot at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // One failed collection must not blank the whole page.
  const [heroResult, productsResult] = await Promise.allSettled([
    getHeroImages(),
    getProducts({ limit: 8 }),
  ]);

  const slides: HeroImage[] =
    heroResult.status === "fulfilled" ? heroResult.value : [];
  const products: Product[] =
    productsResult.status === "fulfilled" ? productsResult.value : [];
  // Tracked per section: a failed query must never be reported as "nothing
  // here yet", which would hide a real outage behind a friendly empty state.
  const heroFailed = heroResult.status === "rejected";
  const productsFailed = productsResult.status === "rejected";

  if (heroFailed) console.error("[home] hero images", heroResult.reason);
  if (productsFailed) console.error("[home] products", productsResult.reason);

  return (
    <>
      {slides.length > 0 ? (
        <HeroSlider slides={slides} />
      ) : (
        // Keeps the page composed when no slides exist yet.
        <section
          aria-label="Featured collection"
          className="flex h-[45vh] min-h-[18rem] w-full items-center justify-center border-b border-line bg-bone-deep"
        >
          <p className="eyebrow text-muted">
            {heroFailed ? "Hero unavailable" : "No hero images yet"}
          </p>
        </section>
      )}

      <section aria-labelledby="collection-heading" className="shell py-20 md:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-brass">Our Collection</p>
            <h1
              id="collection-heading"
              className="mt-4 font-display text-4xl leading-[1.08] md:text-6xl"
            >
              Clothes you&rsquo;ll love to wear
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Good fabrics, clean cuts, and pieces made to last for years &mdash;
              not just one season.
            </p>
          </div>

          <Link
            href="/products"
            className="eyebrow link-underline shrink-0 text-ink"
          >
            See all products
          </Link>
        </div>

        <div className="mt-14 md:mt-16">
          {productsFailed ? (
            <EmptyState
              tone="error"
              icon={<AlertIcon />}
              title="We can't reach the store right now"
              description="The product catalogue is temporarily unavailable. Please refresh in a moment."
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<BagIcon />}
              title="The collection is being prepared"
              description="No products have been published yet. An administrator can add the first pieces from the admin dashboard."
              action={{ href: "/products", label: "Browse products" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  eager={index < 4}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
