import Link from "next/link";
import type { ReactNode } from "react";

/** Shared empty/error placeholder so every surface fails the same way. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { href: string; label: string };
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={`flex flex-col items-center border px-6 py-20 text-center ${
        tone === "error" ? "border-danger-line bg-danger-surface/60" : "border-line bg-surface"
      }`}
    >
      {icon && (
        <span
          className={`mb-5 text-3xl ${tone === "error" ? "text-danger" : "text-muted"}`}
        >
          {icon}
        </span>
      )}

      <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{description}</p>

      {action && (
        <Link href={action.href} className="btn btn-primary mt-8">
          {action.label}
        </Link>
      )}
    </div>
  );
}
