"use server";

import { revalidatePath } from "next/cache";

import { AuthError, requireAdmin } from "@/lib/auth";
import { destroyImage } from "@/lib/cloudinary";
import { isValidObjectId } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { HeroImageModel } from "@/lib/models/HeroImage";
import type { ActionResult } from "@/types";

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof AuthError) return { ok: false, error: error.message };
  console.error("[hero action]", error);
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function createHeroImage(formData: FormData): Promise<ActionResult<string>> {
  try {
    await requireAdmin();

    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    if (!imageUrl) return { ok: false, error: "Please upload a hero image." };

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return { ok: false, error: "Describe the slide — it becomes the image alt text." };
    }

    await connectToDatabase();
    const count = await HeroImageModel.countDocuments().exec();

    const created = await HeroImageModel.create({
      title,
      imageUrl,
      imagePublicId: String(formData.get("imagePublicId") ?? "").trim() || null,
      // New slides go to the end of the carousel.
      order: count,
      active: true,
    });

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true, data: String(created._id) };
  } catch (error) {
    return toResult(error);
  }
}

export async function toggleHeroImage(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, error: "Unknown slide." };

    await connectToDatabase();
    const slide = await HeroImageModel.findById(id).exec();
    if (!slide) return { ok: false, error: "Unknown slide." };

    slide.active = !slide.active;
    await slide.save();

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}

/** Moves a slide one position earlier or later by swapping `order` values. */
export async function moveHeroImage(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, error: "Unknown slide." };

    await connectToDatabase();
    const slides = await HeroImageModel.find().sort({ order: 1, createdAt: 1 }).exec();
    const index = slides.findIndex((slide) => String(slide._id) === id);
    if (index === -1) return { ok: false, error: "Unknown slide." };

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) {
      return { ok: false, error: "That slide is already at the end." };
    }

    [slides[index], slides[target]] = [slides[target], slides[index]];
    await Promise.all(
      slides.map((slide, position) => {
        slide.order = position;
        return slide.save();
      }),
    );

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}

export async function deleteHeroImage(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, error: "Unknown slide." };

    await connectToDatabase();
    const slide = await HeroImageModel.findByIdAndDelete(id).exec();
    if (!slide) return { ok: false, error: "Unknown slide." };

    await destroyImage(slide.imagePublicId);

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true, data: undefined };
  } catch (error) {
    return toResult(error);
  }
}
