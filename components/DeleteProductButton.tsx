"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProduct } from "@/app/actions/products";
import { useToast } from "@/components/ToastProvider";
import { SpinnerIcon, TrashIcon } from "@/components/icons";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    const result = await deleteProduct(productId);

    if (!result.ok) {
      toast(result.error, "error");
      setDeleting(false);
      setConfirming(false);
      return;
    }

    toast(`${productName} deleted.`);
    router.refresh();
  }

  // Two-step confirm — deleting also removes the Cloudinary asset.
  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-danger transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          {deleting ? <SpinnerIcon /> : null}
          {deleting ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${productName}`}
      className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-danger"
    >
      <TrashIcon className="text-sm" />
      Delete
    </button>
  );
}
