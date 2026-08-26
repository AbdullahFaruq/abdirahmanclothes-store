"use client";

import { useState } from "react";

import { CheckIcon } from "@/components/icons";

/**
 * A payment detail with a copy button — an account number nobody can copy is a
 * number people mistype.
 */
export function CopyField({
  label,
  value,
  copyValue,
  mono = false,
}: {
  label: string;
  value: string;
  /** What lands on the clipboard, when it differs from what is shown. */
  copyValue?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain HTTP or when permission is denied.
      setFailed(true);
      window.setTimeout(() => setFailed(false), 3000);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3.5 last:border-b-0">
      <div className="min-w-0">
        <dt className="eyebrow text-muted">{label}</dt>
        <dd
          className={`mt-1 break-words text-base text-ink ${
            mono ? "font-mono tracking-wide" : ""
          }`}
        >
          {value}
        </dd>
      </div>

      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="mt-1 shrink-0 text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
      >
        {copied ? (
          <span className="flex items-center gap-1.5 text-ink">
            <CheckIcon className="text-sm" />
            Copied
          </span>
        ) : failed ? (
          "Select & copy"
        ) : (
          "Copy"
        )}
      </button>
    </div>
  );
}
