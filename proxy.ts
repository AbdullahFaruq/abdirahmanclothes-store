import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Next.js 16 renamed `middleware` to `proxy`. `clerkMiddleware()` runs here to
 * attach the Clerk session to every request, which is what makes `auth()` and
 * `currentUser()` work in Server Components, Route Handlers and Server Actions.
 *
 * It deliberately performs no authorization. Clerk deprecated path-based
 * matching here because proxy path matching can diverge from how Next.js
 * actually routes a request, leaving protected resources reachable. Every
 * protected resource therefore checks for itself, right where the data is
 * touched:
 *
 *   - app/admin/layout.tsx      redirects non-admins out of the admin section
 *   - every admin page          calls `requireAdmin()`
 *   - every admin Server Action calls `requireAdmin()` (app/actions/*.ts)
 *   - the Cloudinary signature  route calls `requireAdmin()`
 *
 * See https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static assets, run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
