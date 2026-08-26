import { ProductForm } from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div>
      <h2 className="font-display text-3xl">Add a product</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Upload the photography, describe the piece, and it will appear on the
        storefront as soon as you publish.
      </p>

      <div className="mt-10">
        <ProductForm />
      </div>
    </div>
  );
}
