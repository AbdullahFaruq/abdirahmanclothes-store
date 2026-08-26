import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * The hero is an image-only slider, so a slide carries just its asset plus the
 * text that describes it. `title` is the image's alt text (and the label the
 * admin sees in the manager) — it is never drawn over the image.
 */
const HeroImageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: null },
    // Slide position in the carousel, ascending.
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type HeroImageDoc = InferSchemaType<typeof HeroImageSchema>;

export const HeroImageModel: Model<HeroImageDoc> =
  (mongoose.models.HeroImage as Model<HeroImageDoc>) ??
  mongoose.model<HeroImageDoc>("HeroImage", HeroImageSchema);
