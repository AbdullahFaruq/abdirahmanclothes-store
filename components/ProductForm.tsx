"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createProduct, updateProduct } from "@/app/actions/products";
import { ImageUploader, type UploadedImage } from "@/components/ImageUploader";
import { useToast } from "@/components/ToastProvider";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { PRODUCT_CATEGORIES, type Product } from "@/types";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { toast } = useToast();

  const [image, setImage] = useState<UploadedImage | null>(
    product ? { url: product.imageUrl, publicId: product.imagePublicId } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(product);

  async function onSubmit(formData: FormData) {
    setError(null);

    if (!image?.url) {
      setError("Please upload a product image before saving.");
      return;
    }

    setSaving(true);
    // The uploader holds the image outside the form, so attach it here.
    formData.set("imageUrl", image.url);
    formData.set("imagePublicId", image.publicId ?? "");

    const result = isEdit
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    toast(isEdit ? "Product updated." : "Product published to the storefront.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14">
      <ImageUploader
        folder="products"
        value={image}
        onChange={setImage}
        label="Product image"
      />

      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="field-label">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name}
            placeholder="Oversized wool overcoat"
            className="field"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="field-label">
              Price (USD)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={product?.price}
              placeholder="249.00"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="category" className="field-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={product?.category ?? ""}
              className="field"
            >
              <option value="" disabled>
                Select a category
              </option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            defaultValue={product?.description}
            placeholder="Cut from a heavyweight Italian wool blend, with a relaxed shoulder and horn buttons."
            className="field resize-y"
          />
        </div>

        <fieldset className="flex flex-col gap-3 border border-line p-5">
          <legend className="field-label !mb-0 px-2">Visibility</legend>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="inStock"
              defaultChecked={product?.inStock ?? true}
              className="h-4 w-4 accent-[var(--color-ink)]"
            />
            In stock — customers can add this to their bag
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 accent-[var(--color-ink)]"
            />
            Featured — highlight this piece in the collection
          </label>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 border border-danger-line bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            <AlertIcon className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary gap-2">
            {saving && <SpinnerIcon />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Publish product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
