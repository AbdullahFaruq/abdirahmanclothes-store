import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, max: 99, default: 1 },
  },
  { _id: false },
);

/** One cart document per signed-in Clerk user. Guests use localStorage only. */
const CartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export type CartDoc = InferSchemaType<typeof CartSchema>;

export const CartModel: Model<CartDoc> =
  (mongoose.models.Cart as Model<CartDoc>) ??
  mongoose.model<CartDoc>("Cart", CartSchema);
