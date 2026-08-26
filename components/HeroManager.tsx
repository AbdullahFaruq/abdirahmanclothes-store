"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createHeroImage,
  deleteHeroImage,
  moveHeroImage,
  toggleHeroImage,
} from "@/app/actions/hero";
import { EmptyState } from "@/components/EmptyState";
import { ImageUploader, type UploadedImage } from "@/components/ImageUploader";
import { useToast } from "@/components/ToastProvider";
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import type { HeroImage } from "@/types";

export function HeroManager({ slides }: { slides: HeroImage[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [image, setImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Tracks which slide row is mid-request so only that row shows a spinner.
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onCreate(formData: FormData) {
    setError(null);

    if (!image?.url) {
      setError("Please upload a hero image first.");
      return;
    }

    setSaving(true);
    formData.set("imageUrl", image.url);
    formData.set("imagePublicId", image.publicId ?? "");

    const result = await createHeroImage(formData);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setImage(null);
    toast("Hero slide added.");
    router.refresh();
  }

  /** Wraps a row action with its own busy state and toast handling. */
  async function run(
    id: string,
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string,
  ) {
    setBusyId(id);
    const result = await action();
    setBusyId(null);

    if (!result.ok) {
      toast(result.error ?? "That didn't work.", "error");
      return;
    }

    toast(successMessage);
    router.refresh();
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[22rem_1fr] lg:gap-16">
      <section aria-labelledby="add-slide-heading">
        <h3 id="add-slide-heading" className="font-display text-2xl">
          Add a slide
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Wide, high-resolution photography works best — the hero is full-bleed.
        </p>

        <form action={onCreate} className="mt-6 flex flex-col gap-5">
          <ImageUploader
            folder="hero"
            value={image}
            onChange={setImage}
            label="Hero image"
          />

          <div>
            <label htmlFor="hero-title" className="field-label">
              Describe the image
            </label>
            <input
              id="hero-title"
              name="title"
              required
              maxLength={160}
              placeholder="Model in a camel wool overcoat on a city street"
              className="field"
            />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Used as the image’s alt text for screen readers. It is not shown
              over the slide.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <AlertIcon className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn btn-primary gap-2">
            {saving && <SpinnerIcon />}
            {saving ? "Adding…" : "Add slide"}
          </button>
        </form>
      </section>

      <section aria-labelledby="slides-heading">
        <h3 id="slides-heading" className="font-display text-2xl">
          Carousel order
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Slides play top to bottom, changing every two seconds.
        </p>

        <div className="mt-6">
          {slides.length === 0 ? (
            <EmptyState
              title="No hero slides yet"
              description="Add your first slide and it will appear on the homepage straight away."
            />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {slides.map((slide, index) => {
                const busy = busyId === slide.id;

                return (
                  <li key={slide.id} className="flex items-center gap-4 py-5">
                    <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden bg-bone-deep sm:w-36">
                      <Image
                        src={slide.imageUrl}
                        alt=""
                        fill
                        sizes="144px"
                        className={`object-cover ${slide.active ? "" : "opacity-40 grayscale"}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="eyebrow text-muted">Slide {index + 1}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-soft">
                        {slide.title}
                      </p>
                      <p className="mt-1.5 text-xs text-muted">
                        {slide.active ? "Visible on the homepage" : "Hidden"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={busy || index === 0}
                          onClick={() =>
                            run(
                              slide.id,
                              () => moveHeroImage(slide.id, "up"),
                              "Slide moved earlier.",
                            )
                          }
                          aria-label={`Move slide ${index + 1} earlier`}
                          className="flex h-8 w-8 rotate-90 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30"
                        >
                          <ArrowLeftIcon className="text-sm" />
                        </button>
                        <button
                          type="button"
                          disabled={busy || index === slides.length - 1}
                          onClick={() =>
                            run(
                              slide.id,
                              () => moveHeroImage(slide.id, "down"),
                              "Slide moved later.",
                            )
                          }
                          aria-label={`Move slide ${index + 1} later`}
                          className="flex h-8 w-8 rotate-90 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30"
                        >
                          <ArrowRightIcon className="text-sm" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              slide.id,
                              () => toggleHeroImage(slide.id),
                              slide.active ? "Slide hidden." : "Slide is now visible.",
                            )
                          }
                          className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink disabled:opacity-50"
                        >
                          {slide.active ? "Hide" : "Show"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              slide.id,
                              () => deleteHeroImage(slide.id),
                              "Slide deleted.",
                            )
                          }
                          aria-label={`Delete slide ${index + 1}`}
                          className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-red-700 disabled:opacity-50"
                        >
                          {busy ? <SpinnerIcon /> : <TrashIcon className="text-sm" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
