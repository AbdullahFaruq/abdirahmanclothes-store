import { notFound } from "next/navigation";

import { ProductForm } from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]/edit">,
) {
  await requireAdmin();

  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h2 className="font-display text-3xl">Edit product</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Changes go live on the storefront as soon as you save. Replacing the
        image also removes the previous file from Cloudinary.
      </p>

      <div className="mt-10">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
