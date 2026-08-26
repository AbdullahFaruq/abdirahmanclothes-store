import Link from "next/link";
import { redirect } from "next/navigation";

import { getStoreUser } from "@/lib/auth";

/**
 * Server-side gate for the whole admin section. `proxy.ts` already redirects
 * unauthenticated visitors, but this is the authoritative check: it runs on the
 * server for every admin page regardless of how the request arrived.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getStoreUser();

  if (!user) redirect("/sign-in?redirect_url=/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="shell py-12 md:py-16">
      <header className="border-b border-line pb-8">
        <p className="eyebrow text-brass">Administration</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          Store management
        </h1>
        <p className="mt-3 text-sm text-muted">
          Signed in as {user.name || user.email}
        </p>

        <nav aria-label="Admin sections" className="mt-8 flex flex-wrap gap-2">
          <AdminLink href="/admin">Overview</AdminLink>
          <AdminLink href="/admin/products">Products</AdminLink>
          <AdminLink href="/admin/hero">Hero images</AdminLink>
          <AdminLink href="/">Back to store</AdminLink>
        </nav>
      </header>

      <div className="pt-10 md:pt-12">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="eyebrow border border-line px-4 py-2.5 text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </Link>
  );
}
