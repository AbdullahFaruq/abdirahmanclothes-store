import type { Metadata } from "next";

import { CartView } from "@/components/CartView";

// The root layout reads the Clerk session, so this route is request-time
// regardless; declaring it keeps the build output unambiguous.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the pieces in your bag.",
};

export default function CartPage() {
  return (
    <div className="shell py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brass">Your selection</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.08] md:text-6xl">
          Shopping bag
        </h1>
      </header>

      <div className="mt-12 md:mt-16">
        <CartView />
      </div>
    </div>
  );
}
