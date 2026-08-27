import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { AlertIcon, BagIcon } from "@/components/icons";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the full Abdirahman Asad Store collection — outerwear, knitwear, shirting, tailoring and accessories.",
};

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const rawCategory = searchParams.category;
  const activeCategory =
    typeof rawCategory === "string" && rawCategory.trim() ? rawCategory : "All";

  const [productsResult, categoriesResult] = await Promise.allSettled([
    getProducts({ category: activeCategory }),
    getCategories(),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const failed = productsResult.status === "rejected";

  if (failed) console.error("[products]", productsResult.reason);

  const filters = ["All", ...categories];

  return (
    <div className="shell py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brass">Shop</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.08] md:text-6xl">
          All products
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
          Every piece in the current collection, made in small runs from natural
          fibres.
        </p>
      </header>

      {filters.length > 1 && (
        <nav
          aria-label="Filter by category"
          className="mt-10 flex flex-wrap gap-2 border-b border-line pb-6"
        >
          {filters.map((category) => {
            const isActive = category === activeCategory;
            return (
              <Link
                key={category}
                href={category === "All" ? "/products" : `/products?category=${encodeURIComponent(category)}`}
                aria-current={isActive ? "page" : undefined}
                className={`eyebrow border px-4 py-2.5 transition-colors duration-300 ${
                  isActive
                    ? "border-ink bg-ink text-bone"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="mt-12 md:mt-14">
        {failed ? (
          <EmptyState
            tone="error"
            icon={<AlertIcon />}
            title="We can't load the catalogue"
            description="The connection to our store database failed. Please refresh in a moment."
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<BagIcon />}
            title={
              activeCategory === "All"
                ? "No products yet"
                : `Nothing in ${activeCategory} yet`
            }
            description={
              activeCategory === "All"
                ? "The collection is still being prepared. Please check back shortly."
                : "This category is empty for now. Browse the full collection instead."
            }
            action={
              activeCategory === "All"
                ? undefined
                : { href: "/products", label: "View all products" }
            }
          />
        ) : (
          <>
            <p className="eyebrow mb-8 text-muted">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} eager={index < 4} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
