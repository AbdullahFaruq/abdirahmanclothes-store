"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import type { HeroImage } from "@/types";

const AUTOPLAY_MS = 2000;

/**
 * Full-bleed, image-only hero carousel. Slides advance every two seconds and
 * can be driven with the arrow buttons, the dot controls, or the keyboard.
 * Autoplay pauses on hover/focus and is disabled entirely for visitors who ask
 * for reduced motion.
 */
export function HeroSlider({ slides }: { slides: HeroImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const count = slides.length;
  // Derived rather than corrected in an effect, so removing slides while the
  // page is open can never leave the carousel on a missing index.
  const activeIndex = count > 0 ? index % count : 0;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const previous = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  useEffect(() => {
    if (count <= 1 || paused || prefersReducedMotion) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, prefersReducedMotion, next]);

  if (count === 0) return null;

  return (
    <section
      aria-label="Featured collection"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-bone-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }
      }}
    >
      {/* 3:2 matches the source photography, so `object-contain` shows each
          image complete with no letterboxing. Any other ratio an admin uploads
          still shows in full, matted against the section background. */}
      <div className="relative aspect-[3/2] max-h-[85vh] w-full">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === activeIndex;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${count}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {/* Portrait photography cannot fill a full-bleed hero without
                  being cropped, so a blurred, scaled copy of the same image
                  fills the space beside it. Delete this block to have the
                  matting fall back to the flat section background. */}
              <Image
                src={slide.imageUrl}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                quality={40}
                className="scale-110 object-cover blur-2xl"
              />

              {/* The photograph itself — never cropped. */}
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                // The hero spans the viewport at every breakpoint.
                sizes="100vw"
                // Only the first slide is the LCP candidate on load.
                // `priority` was deprecated in Next.js 16 in favour of `preload`.
                preload={slideIndex === 0}
                quality={85}
                className="object-contain"
              />
            </div>
          );
        })}

        {count > 1 && (
          <>
            <SliderButton side="left" onClick={previous} label="Previous slide" />
            <SliderButton side="right" onClick={next} label="Next slide" />

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink/40 px-3.5 py-2.5 backdrop-blur-sm md:bottom-7">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(slideIndex)}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  aria-current={slideIndex === activeIndex ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                    slideIndex === activeIndex
                      ? "w-8 bg-bone"
                      : "w-1.5 bg-bone/55 hover:bg-bone/85"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Announces slide changes without moving focus. */}
      <p className="sr-only" aria-live="polite">
        {`Slide ${activeIndex + 1} of ${count}: ${slides[activeIndex]?.title ?? ""}`}
      </p>
    </section>
  );
}

function SliderButton({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-bone/30 bg-ink/60 text-lg text-bone backdrop-blur-sm transition-all duration-300 hover:border-bone hover:bg-bone hover:text-ink md:h-13 md:w-13 md:text-xl ${
        side === "left" ? "left-3 md:left-6" : "right-3 md:right-6"
      }`}
    >
      {side === "left" ? <ArrowLeftIcon /> : <ArrowRightIcon />}
    </button>
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The media query is an external system, so read it as an external store. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", listener);
      return () => query.removeEventListener("change", listener);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // Assume motion is fine on the server; the client corrects on hydration.
    () => false,
  );
}
