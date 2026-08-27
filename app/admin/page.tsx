import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getHeroImages, getProducts } from "@/lib/data";
import { UserModel } from "@/lib/models/User";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Redundant with the layout by design — every admin surface re-checks.
  await requireAdmin();

  const [productsResult, heroResult, customersResult] = await Promise.allSettled([
    getProducts(),
    getHeroImages({ includeInactive: true }),
    connectToDatabase().then(() => UserModel.countDocuments({ role: "user" }).exec()),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const slides = heroResult.status === "fulfilled" ? heroResult.value : [];
  const customers = customersResult.status === "fulfilled" ? customersResult.value : 0;
  const unreachable =
    productsResult.status === "rejected" || heroResult.status === "rejected";

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    {
      label: "In stock",
      value: products.filter((product) => product.inStock).length,
      href: "/admin/products",
    },
    {
      label: "Hero slides",
      value: slides.length,
      href: "/admin/hero",
    },
    {
      label: "Active slides",
      value: slides.filter((slide) => slide.active).length,
      href: "/admin/hero",
    },
    // Mirrored from Clerk on first sign-in — see syncUserToDatabase().
    { label: "Customers", value: customers, href: "/admin" },
  ];

  return (
    <div>
      {unreachable && (
        <p
          role="alert"
          className="mb-8 border border-danger-line bg-danger-surface px-4 py-3 text-sm text-danger"
        >
          Some data could not be loaded — check that MONGODB_URI is set and the
          database is reachable.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-line bg-surface p-6 transition-colors hover:border-ink"
          >
            <p className="eyebrow text-muted">{stat.label}</p>
            <p className="mt-3 font-display text-4xl tabular-nums">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products/new"
          className="border border-line bg-surface p-8 transition-colors hover:border-ink"
        >
          <h2 className="font-display text-2xl">Add a product</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Upload photography, set the price and publish it to the storefront.
          </p>
        </Link>

        <Link
          href="/admin/hero"
          className="border border-line bg-surface p-8 transition-colors hover:border-ink"
        >
          <h2 className="font-display text-2xl">Manage the hero</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Add, reorder, hide or delete the slides in the homepage carousel.
          </p>
        </Link>
      </div>
    </div>
  );
}
