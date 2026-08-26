import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FavoriteSchema = new Schema(
  {
    // Clerk user id (`user_...`), not a Mongo ObjectId.
    userId: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true },
);

// One row per user/product pair — makes "favorite" idempotent.
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type FavoriteDoc = InferSchemaType<typeof FavoriteSchema>;

export const FavoriteModel: Model<FavoriteDoc> =
  (mongoose.models.Favorite as Model<FavoriteDoc>) ??
  mongoose.model<FavoriteDoc>("Favorite", FavoriteSchema);
