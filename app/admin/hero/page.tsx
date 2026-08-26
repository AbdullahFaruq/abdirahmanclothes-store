import { EmptyState } from "@/components/EmptyState";
import { HeroManager } from "@/components/HeroManager";
import { AlertIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getHeroImages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await requireAdmin();

  let slides;
  try {
    slides = await getHeroImages({ includeInactive: true });
  } catch (error) {
    console.error("[admin/hero]", error);
    return (
      <EmptyState
        tone="error"
        icon={<AlertIcon />}
        title="Can't reach the database"
        description="Check that MONGODB_URI is set correctly and the database is reachable, then reload."
      />
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl">Hero images</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        The homepage hero is an image-only carousel. Slides are stored in
        MongoDB and served from Cloudinary.
      </p>

      <div className="mt-10">
        <HeroManager slides={slides} />
      </div>
    </div>
  );
}
