/**
 * Seeds MongoDB with a realistic sample catalogue so the storefront is testable
 * before anything is uploaded through the admin.
 *
 *   npm run seed          # add sample data, skip anything already there
 *   npm run seed -- --reset   # wipe products + hero slides first
 *
 * Sample imagery is served from Unsplash. Anything uploaded through the admin
 * goes to Cloudinary instead.
 */
import { config } from "dotenv";
import mongoose from "mongoose";

// Load .env.local first (Next's convention), then fall back to .env.
config({ path: ".env.local" });
config({ path: ".env" });

const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const PRODUCTS = [
  {
    name: "Olive Cotton Field Jacket",
    slug: "olive-cotton-field-jacket",
    description:
      "A relaxed utility jacket in washed olive cotton, with four flap pockets and a slightly dropped shoulder. Roomy enough to layer over a heavy knit through autumn.",
    price: 325,
    category: "Outerwear",
    imageUrl: unsplash("photo-1544022613-e87ca75a784a"),
    featured: true,
  },
  {
    name: "Rust Nylon Bomber",
    slug: "rust-nylon-bomber",
    description:
      "A lightweight bomber in a warm rust nylon, with ribbed cuffs and hem, a two-way zip and a utility pocket at the sleeve. Cut clean and close to the body.",
    price: 295,
    category: "Outerwear",
    imageUrl: unsplash("photo-1591047139829-d91aecb6caea"),
    featured: true,
  },
  {
    name: "Prince of Wales Check Blazer",
    slug: "prince-of-wales-check-blazer",
    description:
      "A double-breasted blazer in a soft grey Prince of Wales check. Unstructured through the shoulder so it wears more like a cardigan than tailoring.",
    price: 385,
    category: "Outerwear",
    imageUrl: unsplash("photo-1608234808654-2a8875faa7fd"),
    featured: false,
  },
  {
    name: "Fringed Cotton Knit Poncho",
    slug: "fringed-cotton-knit-poncho",
    description:
      "An open-gauge poncho in undyed cotton with a deep V-neck and a hand-knotted fringe. One size, and it falls differently on everyone.",
    price: 215,
    category: "Knitwear",
    imageUrl: unsplash("photo-1434389677669-e08b4cac3105"),
    featured: true,
  },
  {
    name: "Heavyweight Cotton Sweatshirt",
    slug: "heavyweight-cotton-sweatshirt",
    description:
      "A 400gsm loopback cotton crewneck in optic white, with set-in sleeves and a ribbed hem that holds its shape through repeated washing.",
    price: 145,
    category: "Knitwear",
    imageUrl: unsplash("photo-1620799140408-edc6dcb6d633"),
    featured: false,
  },
  {
    name: "Dotted Chambray Shirt",
    slug: "dotted-chambray-shirt",
    description:
      "Indigo chambray with a small woven dot, softened in the wash. A classic point collar, curved hem and a single chest pocket.",
    price: 135,
    category: "Shirts",
    imageUrl: unsplash("photo-1596755094514-f87e34085b2c"),
    featured: false,
  },
  {
    name: "Khaki Cotton Chino",
    slug: "khaki-cotton-chino",
    description:
      "A mid-rise chino in a dry-finish cotton twill, tapered from the knee and finished with a clean hem. Wears in rather than out.",
    price: 165,
    category: "Trousers",
    imageUrl: unsplash("photo-1473966968600-fa801b869a1a"),
    featured: false,
  },
  {
    name: "Patched High-Rise Denim",
    slug: "patched-high-rise-denim",
    description:
      "A high-rise, tapered jean in rigid indigo denim, finished by hand with embroidered patches and worked-in distressing. Every pair is slightly different.",
    price: 210,
    category: "Trousers",
    imageUrl: unsplash("photo-1541099649105-f69ad21f3246"),
    inStock: false,
    featured: false,
  },
  {
    name: "Crimson Silk Maxi Dress",
    slug: "crimson-silk-maxi-dress",
    description:
      "A floor-length dress in crimson silk faille, with a squared neckline, narrow straps and a full skirt that carries real movement.",
    price: 395,
    category: "Dresses",
    imageUrl: unsplash("photo-1595777457583-95e059d581b8"),
    featured: true,
  },
  {
    name: "Plum Corduroy Shirt Dress",
    slug: "plum-corduroy-shirt-dress",
    description:
      "A midi shirt dress in fine-wale plum corduroy, with a gathered waist, three-quarter sleeves and deep side pockets.",
    price: 265,
    category: "Dresses",
    imageUrl: unsplash("photo-1585487000160-6ebcfceb0d03"),
    featured: false,
  },
  {
    name: "Rattan and Leather Top-Handle Bag",
    slug: "rattan-and-leather-top-handle-bag",
    description:
      "A structured top-handle bag in woven rattan with vegetable-tanned leather trim, a turn-lock closure and a detachable shoulder strap.",
    price: 340,
    category: "Accessories",
    imageUrl: unsplash("photo-1590874103328-eac38a683ce7"),
    featured: true,
  },
  {
    name: "Lacquered Leather Top-Handle Bag",
    slug: "lacquered-leather-top-handle-bag",
    description:
      "A compact top-handle bag in high-shine lacquered leather, with a polished silver clasp and a slim removable strap.",
    price: 420,
    category: "Accessories",
    imageUrl: unsplash("photo-1584917865442-de89df76afd3"),
    featured: false,
  },
];

const HERO_IMAGES = [
  // `title` is the alt text a screen reader announces, so each one describes
  // what is actually in the photograph.
  {
    title:
      "A rail of pale neutral garments hanging on wooden hangers against a white wall",
    imageUrl: unsplash("photo-1490481651871-ab68de25d43d", 2400),
    order: 0,
  },
  {
    title:
      "A flat lay of brown leather boots, a leather belt, grey trousers, sunglasses, a watch and a white t-shirt arranged on a white floor",
    imageUrl: unsplash("photo-1479064555552-3ef4979f8908", 2400),
    order: 1,
  },
  {
    title:
      "The interior of a boutique, with clothing rails and folded stock lit by hanging pendant lamps",
    imageUrl: unsplash("photo-1441984904996-e0b6ba687e04", 2400),
    order: 2,
  },
  {
    title:
      "Rails of cream and camel knitwear seen through a shop window under warm lights",
    imageUrl: unsplash("photo-1445205170230-053b83016050", 2400),
    order: 3,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "\n  MONGODB_URI is not set.\n  Copy .env.example to .env.local and add your connection string.\n",
    );
    process.exit(1);
  }

  const reset = process.argv.includes("--reset");

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  // Defined inline so the script has no dependency on the Next.js path aliases.
  const Product =
    mongoose.models.Product ??
    mongoose.model(
      "Product",
      new mongoose.Schema(
        {
          name: String,
          slug: { type: String, unique: true },
          description: String,
          price: Number,
          category: String,
          imageUrl: String,
          imagePublicId: { type: String, default: null },
          inStock: { type: Boolean, default: true },
          featured: { type: Boolean, default: false },
        },
        { timestamps: true },
      ),
    );

  const HeroImage =
    mongoose.models.HeroImage ??
    mongoose.model(
      "HeroImage",
      new mongoose.Schema(
        {
          title: String,
          imageUrl: String,
          imagePublicId: { type: String, default: null },
          order: { type: Number, default: 0 },
          active: { type: Boolean, default: true },
        },
        { timestamps: true },
      ),
    );

  if (reset) {
    const [products, heroes] = await Promise.all([
      Product.deleteMany({}),
      HeroImage.deleteMany({}),
    ]);
    console.log(
      `Reset: removed ${products.deletedCount} products and ${heroes.deletedCount} hero slides`,
    );
  }

  let created = 0;
  for (const product of PRODUCTS) {
    // Upsert on slug so re-running the seed is safe.
    const result = await Product.updateOne(
      { slug: product.slug },
      { $setOnInsert: { inStock: true, ...product } },
      { upsert: true },
    );
    if (result.upsertedCount) created += 1;
  }
  console.log(`Products: ${created} created, ${PRODUCTS.length - created} already present`);

  let heroCreated = 0;
  for (const slide of HERO_IMAGES) {
    const result = await HeroImage.updateOne(
      { imageUrl: slide.imageUrl },
      { $setOnInsert: { active: true, ...slide } },
      { upsert: true },
    );
    if (result.upsertedCount) heroCreated += 1;
  }
  console.log(
    `Hero slides: ${heroCreated} created, ${HERO_IMAGES.length - heroCreated} already present`,
  );

  await mongoose.disconnect();
  console.log("\nDone. Run `npm run dev` and open http://localhost:3000\n");
}

main().catch(async (error) => {
  console.error("\nSeed failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
