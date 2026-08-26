import "server-only";

import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { CartModel } from "@/lib/models/Cart";
import { FavoriteModel } from "@/lib/models/Favorite";
import { HeroImageModel } from "@/lib/models/HeroImage";
import { ProductModel } from "@/lib/models/Product";
import type { CartItem, HeroImage, Product } from "@/types";

/** Shape returned by `.lean()` — Mongo internals plus our fields. */
type Lean<T> = T & { _id: Types.ObjectId; createdAt?: Date };

export function serializeProduct(doc: Lean<Record<string, unknown>>): Product {
  return {
    id: String(doc._id),
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    price: Number(doc.price ?? 0),
    category: String(doc.category ?? ""),
    imageUrl: String(doc.imageUrl ?? ""),
    imagePublicId: (doc.imagePublicId as string | null) ?? null,
    inStock: Boolean(doc.inStock ?? true),
    featured: Boolean(doc.featured ?? false),
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

export function serializeHeroImage(doc: Lean<Record<string, unknown>>): HeroImage {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    imageUrl: String(doc.imageUrl ?? ""),
    imagePublicId: (doc.imagePublicId as string | null) ?? null,
    order: Number(doc.order ?? 0),
    active: Boolean(doc.active ?? true),
  };
}

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;
}

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------

export async function getProducts(options?: {
  category?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (options?.category && options.category !== "All") {
    filter.category = options.category;
  }
  if (options?.featuredOnly) filter.featured = true;

  const query = ProductModel.find(filter).sort({ createdAt: -1 }).lean();
  if (options?.limit) query.limit(options.limit);

  const docs = await query.exec();
  return docs.map((doc) => serializeProduct(doc as Lean<Record<string, unknown>>));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();

  const doc = await ProductModel.findById(id).lean().exec();
  return doc ? serializeProduct(doc as Lean<Record<string, unknown>>) : null;
}

/** Resolves a list of ids to products, preserving the caller's ordering. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const valid = ids.filter(isValidObjectId);
  if (valid.length === 0) return [];

  await connectToDatabase();
  const docs = await ProductModel.find({ _id: { $in: valid } })
    .lean()
    .exec();

  const byId = new Map(
    docs.map((doc) => {
      const product = serializeProduct(doc as Lean<Record<string, unknown>>);
      return [product.id, product] as const;
    }),
  );

  return valid
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

export async function getCategories(): Promise<string[]> {
  await connectToDatabase();
  const categories = await ProductModel.distinct("category").exec();
  return (categories as string[]).filter(Boolean).sort();
}

// --------------------------------------------------------------------------
// Hero images
// --------------------------------------------------------------------------

export async function getHeroImages(options?: { includeInactive?: boolean }): Promise<
  HeroImage[]
> {
  await connectToDatabase();

  const filter = options?.includeInactive ? {} : { active: true };
  const docs = await HeroImageModel.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .lean()
    .exec();

  return docs.map((doc) => serializeHeroImage(doc as Lean<Record<string, unknown>>));
}

// --------------------------------------------------------------------------
// Favorites & cart (signed-in users)
// --------------------------------------------------------------------------

export async function getFavoriteIds(userId: string): Promise<string[]> {
  await connectToDatabase();
  const docs = await FavoriteModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
  return docs.map((doc) => String(doc.productId));
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  await connectToDatabase();
  const cart = await CartModel.findOne({ userId }).lean().exec();
  if (!cart) return [];

  return (cart.items ?? []).map((item) => ({
    productId: String(item.productId),
    quantity: Number(item.quantity),
  }));
}
