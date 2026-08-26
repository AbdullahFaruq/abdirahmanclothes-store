"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow text-brass">Something went wrong</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">
        We couldn’t load this page
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
        This is usually temporary. Try again, and if it keeps happening the store
        database may be unreachable.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-9">
        Try again
      </button>
    </div>
  );
}
