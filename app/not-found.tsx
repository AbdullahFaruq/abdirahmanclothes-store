import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow text-brass">404</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">
        This page has moved on
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
        The piece or page you’re looking for is no longer available. The rest of
        the collection is still here.
      </p>
      <Link href="/products" className="btn btn-primary mt-9">
        Browse the collection
      </Link>
    </div>
  );
}
