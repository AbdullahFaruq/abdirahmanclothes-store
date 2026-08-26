import Image from "next/image";
import Link from "next/link";

import { DeleteProductButton } from "@/components/DeleteProductButton";
import { EmptyState } from "@/components/EmptyState";
import { AlertIcon, BagIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  let products;
  try {
    products = await getProducts();
  } catch (error) {
    console.error("[admin/products]", error);
    return (
      <EmptyState
        tone="error"
        icon={<AlertIcon />}
        title="Can't reach the database"
        description="Check that MONGODB_URI is set correctly and the database is reachable, then reload."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Products</h2>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      <div className="mt-8">
        {products.length === 0 ? (
          <EmptyState
            icon={<BagIcon />}
            title="No products yet"
            description="Publish your first piece and it will appear on the storefront immediately."
            action={{ href: "/admin/products/new", label: "Add your first product" }}
          />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap sm:gap-6"
              >
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-bone-deep">
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-muted">{product.category}</p>
                  <h3 className="mt-1 truncate font-display text-lg">
                    <Link
                      href={`/products/${product.id}`}
                      className="link-underline"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="tabular-nums text-ink-soft">
                      {formatPrice(product.price)}
                    </span>
                    <span>{product.inStock ? "In stock" : "Sold out"}</span>
                    {product.featured && <span className="text-brass">Featured</span>}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
