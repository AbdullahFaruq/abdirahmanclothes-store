/** Plain, serialisable shapes handed from Server Components to the client. */

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imagePublicId: string | null;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
};

export type HeroImage = {
  id: string;
  /** Doubles as the slide's alt text. */
  title: string;
  imageUrl: string;
  imagePublicId: string | null;
  order: number;
  active: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

/** Cart line joined with its product, ready to render. */
export type CartLine = {
  product: Product;
  quantity: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Offered in the admin product form, in this order. */
export const PRODUCT_CATEGORIES = [
  "Safaleti",
  "Goono",
  "Qamaar",
  "Kastumo",
  "Garan",
  "Funanad",
  "Surwaal",
  "Kabo",
  "Shaar",
  "Make up",
  "Boorso",
  "Buumo",
  "Funanad Maliyad",
  "Kabaha sports",
  "Kabo labis",
  "Saako",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
