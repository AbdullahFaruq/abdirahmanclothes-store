import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";

import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/User";

export type Role = "user" | "admin";

export type StoreUser = {
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  role: Role;
};

/** Emails promoted to admin via env — used to bootstrap the first administrator. */
function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function primaryEmail(user: User): string {
  const primary = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  );
  return (primary ?? user.emailAddresses[0])?.emailAddress?.toLowerCase() ?? "";
}

function roleOf(user: User): Role {
  const metadataRole = user.publicMetadata?.role;
  if (metadataRole === "admin") return "admin";
  return adminEmailAllowlist().includes(primaryEmail(user)) ? "admin" : "user";
}

/**
 * The signed-in user in store terms, or `null` for guests.
 *
 * A Clerk outage or misconfiguration resolves to `null` rather than throwing:
 * this is called from the root layout, so throwing would take down every page,
 * and `null` fails closed — it denies admin access rather than granting it.
 */
export async function getStoreUser(): Promise<StoreUser | null> {
  let user: User | null = null;

  try {
    user = await currentUser();
  } catch (error) {
    console.error(
      "[auth] Could not reach Clerk — treating this request as signed out.",
      error,
    );
    return null;
  }

  if (!user) return null;

  return {
    clerkId: user.id,
    email: primaryEmail(user),
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      primaryEmail(user),
    imageUrl: user.imageUrl ?? "",
    role: roleOf(user),
  };
}

export async function isAdmin(): Promise<boolean> {
  const user = await getStoreUser();
  return user?.role === "admin";
}

/** Clerk user id of the current session, or `null`. Cheap — no Backend API call. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Gate for every mutation a regular user must never perform. Throws instead of
 * returning a flag so a forgotten `if` cannot silently open up write access.
 */
export async function requireAdmin(): Promise<StoreUser> {
  const user = await getStoreUser();
  if (!user) throw new AuthError("You must be signed in to do that.", 401);
  if (user.role !== "admin") {
    throw new AuthError("Administrator access is required.", 403);
  }
  return user;
}

export async function requireUser(): Promise<StoreUser> {
  const user = await getStoreUser();
  if (!user) throw new AuthError("You must be signed in to do that.", 401);
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Mirrors the Clerk user into MongoDB so the store can list users and their
 * roles without paging the Clerk API. Safe to call on every authenticated page.
 */
export async function syncUserToDatabase(user: StoreUser): Promise<void> {
  await connectToDatabase();
  await UserModel.updateOne(
    { clerkId: user.clerkId },
    {
      $set: {
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role,
      },
    },
    { upsert: true },
  );
}
