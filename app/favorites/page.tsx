import type { Metadata } from "next";

import { FavoritesView } from "@/components/FavoritesView";

// The root layout reads the Clerk session, so this route is request-time
// regardless; declaring it keeps the build output unambiguous.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favorites",
  description: "The pieces you've saved from the Abdirahman Asad Store collection.",
};

export default function FavoritesPage() {
  return (
    <div className="shell py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brass">Saved</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.08] md:text-6xl">
          Favorites
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
          Everything you’ve hearted, kept in one place.
        </p>
      </header>

      <div className="mt-12 md:mt-16">
        <FavoritesView />
      </div>
    </div>
  );
}
