"use client";

import Image from "next/image";
import Link from "next/link";

import { CopyField } from "@/components/CopyField";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/components/StoreProvider";
import { useResolvedProducts } from "@/components/useResolvedProducts";
import { AlertIcon, BagIcon, WhatsAppIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import {
  BANK_TRANSFER,
  EVC_PLUS,
  buildWhatsAppMessage,
  whatsAppLink,
} from "@/lib/payment";

export function CheckoutView() {
  const { cart, hydrated } = useStore();
  const { products, loading, error } = useResolvedProducts(
    cart.map((item) => item.productId),
  );

  const lines = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );

  if (!hydrated || (loading && cart.length > 0)) {
    return (
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16" aria-hidden="true">
        <div className="h-72 animate-pulse border border-line bg-bone-deep/60" />
        <div className="h-72 animate-pulse border border-line bg-bone-deep/60" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        tone="error"
        icon={<AlertIcon />}
        title="We couldn't load your order"
        description={error}
        action={{ href: "/cart", label: "Back to your bag" }}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<BagIcon />}
        title="There's nothing to check out"
        description="Add a piece to your bag and the payment details will appear here."
        action={{ href: "/products", label: "Browse the collection" }}
      />
    );
  }

  const message = buildWhatsAppMessage(
    lines.map((line) => ({
      name: line.product.name,
      quantity: line.quantity,
      lineTotal: formatPrice(line.product.price * line.quantity),
    })),
    formatPrice(total),
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      {/* ---------------------------------------------------------------- */}
      {/* Order recap                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="order-heading">
        <h2 id="order-heading" className="font-display text-2xl">
          Your order
        </h2>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-4 py-4">
              <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-bone-deep">
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{product.name}</p>
                <p className="mt-0.5 text-xs text-muted">Quantity {quantity}</p>
              </div>
              <p className="shrink-0 text-sm tabular-nums text-ink-soft">
                {formatPrice(product.price * quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-baseline justify-between">
          <p className="eyebrow text-muted">Amount to pay</p>
          <p className="font-display text-3xl tabular-nums">{formatPrice(total)}</p>
        </div>

        <Link
          href="/cart"
          className="link-underline mt-6 inline-block text-xs uppercase tracking-[0.14em] text-muted hover:text-ink"
        >
          Edit your bag
        </Link>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Payment details                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="payment-heading">
        <h2 id="payment-heading" className="font-display text-2xl">
          How to pay
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Send {formatPrice(total)} using either method below, then confirm on
          WhatsApp so we can prepare your order.
        </p>

        <div className="mt-7 flex flex-col gap-5">
          <article className="border border-line bg-surface p-6">
            <h3 className="eyebrow text-brass">{BANK_TRANSFER.label}</h3>
            <dl className="mt-4">
              <CopyField label="Bank" value={BANK_TRANSFER.bank} />
              <CopyField
                label="Account number"
                value={BANK_TRANSFER.accountNumber}
                mono
              />
              <CopyField label="Account name" value={BANK_TRANSFER.accountName} />
            </dl>
          </article>

          <article className="border border-line bg-surface p-6">
            <h3 className="eyebrow text-brass">{EVC_PLUS.label}</h3>
            <dl className="mt-4">
              <CopyField
                label="Number"
                value={EVC_PLUS.displayNumber}
                copyValue={EVC_PLUS.dialNumber}
                mono
              />
              <CopyField label="Name" value={EVC_PLUS.accountName} />
            </dl>
          </article>
        </div>

        {/* Brand WhatsApp green with ink text: white on #25D366 is only
            1.98:1, while ink on it is 9.92:1. */}
        <a
          href={whatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 flex w-full items-center justify-center gap-3 bg-[#25D366] px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-scrim transition-colors duration-300 hover:bg-[#1EBE5B]"
        >
          <WhatsAppIcon className="text-lg" />
          Confirm on WhatsApp
        </a>

        <p className="mt-3 text-center text-xs leading-relaxed text-muted">
          Opens a chat with your order already written out — send it to confirm
          payment, or to ask a question before you pay.
        </p>
      </section>
    </div>
  );
}
