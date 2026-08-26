"use server";

import { revalidatePath } from "next/cache";

import { AuthError, requireAdmin } from "@/lib/auth";
import { destroyImage } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { isValidObjectId } from "@/lib/data";
import { ProductModel } from "@/lib/models/Product";
import { FavoriteModel } from "@/lib/models/Favorite";
import { CartModel } from "@/lib/models/Cart";
import type { ActionResult } from "@/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends `-2`, `-3`… until the slug is free. */
async function uniqueSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name) || "product";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await ProductModel.findOne({ slug: candidate })
      .select("_id")
      .lean()
      .exec();
    if (!existing || String(existing._id) === ignoreId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imagePublicId: string | null;
  inStock: boolean;
  featured: boolean;
};

function parseProductForm(formData: FormData): ProductInput | string {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imagePublicId = String(formData.get("imagePublicId") ?? "").trim() || null;
  const price = Number(formData.get("price"));

  if (!name) return "Product name is required.";
  if (!category) return "Category is required.";
  if (!imageUrl) return "Please upload a product image.";
  if (!Number.isFinite(price) || price < 0) return "Enter a valid price.";

  return {
    name,
    description,
    price: Math.round(price * 100) / 100,
    category,
    imageUrl,
    imagePublicId,
    inStock: formData.get("inStock") === "on",
    featured: formData.get("featured") === "on",
  };
}

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof AuthError) return { ok: false, error: error.message };
  console.error("[products action]", error);
  return { ok: false, error: "Something went wrong. Please try again." };
}

function revalidateStorefront(productId?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/products/${productId}`);
}

export async function createProduct(formData: FormData): Promise<ActionResult<string>> {
  try {
    await requireAdmin();

    const parsed = parseProductForm(formData);
    if (typeof parsed === "string") return { ok: false, error: parsed };

    await connectToDatabase();
    const created = await ProductModel.create({
      ...parsed,
      slug: await uniqueSlug(parsed.name),
    });

    revalidateStorefront();
    return { ok: true, data: String(created._id) };
  } catch (error) {
    return toResult(error);
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, error: "Unknown product." };

    const parsed = parseProductForm(formData);
    if (typeof parsed === "string") return { ok: false, error: parsed };

    await connectToDatabase();
    const existing = await ProductModel.findById(id).exec();
    if (!existing) return { ok: false, error: "Unknown product." };

    // A replaced image leaves the old Cloudinary asset orphaned otherwise.
    const previousPublicId = existing.imagePublicId;
    if (previousPublicId && previousPublicId !== parsed.imagePublicId) {
      await destroyImage(previousPublicId);
    }

    existing.set({ ...parsed, slug: await uniqueSlug(parsed.name, id) });
    await existing.save();

    revalidateStorefront(id);
    return { ok: true, data: id };
  } catch (error) {
    return toResult(error);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, error: "Unknown product." };

    await connectToDatabase();
    const product = await ProductModel.findByIdAndDelete(id).exec();
    if (!product) return { ok: false, error: "Unknown product." };

    await destroyImage(product.imagePublicId);

    // Drop the deleted product from every cart and favorites list.
    await Promise.all([
      FavoriteModel.deleteMany({ productId: product._id }).exec(),
      CartModel.updateMany({}, { $pull: { items: { productId: product._id } } }).exec(),
    ]);

    revalidateStorefront(id);
    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}
