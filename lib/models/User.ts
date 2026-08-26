import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Clerk owns authentication; this collection mirrors the parts of a user the
 * store needs to query on its own (role, display name) keyed by Clerk's id.
 * `role` here is a cache of Clerk's `publicMetadata.role` — Clerk remains the
 * source of truth, see lib/auth.ts.
 */
const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    name: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const UserModel: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", UserSchema);
