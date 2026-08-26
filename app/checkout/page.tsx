import type { Metadata } from "next";

import { CheckoutView } from "@/components/CheckoutView";

// The root layout reads the Clerk session, so this route is request-time
// regardless; declaring it keeps the build output unambiguous.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Pay by Salaam Bank transfer or EVC Plus, then confirm your order on WhatsApp.",
};

export default function CheckoutPage() {
  return (
    <div className="shell py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brass">Almost there</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.08] md:text-6xl">
          Checkout
        </h1>
      </header>

      <div className="mt-12 md:mt-16">
        <CheckoutView />
      </div>
    </div>
  );
}
