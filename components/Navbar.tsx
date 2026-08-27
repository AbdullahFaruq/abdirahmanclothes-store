"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BagIcon, CloseIcon, HeartIcon, MenuIcon } from "@/components/icons";
import { useStore } from "@/components/StoreProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/favorites", label: "Favorites" },
  { href: "/cart", label: "Cart" },
];

/** Small count bubble on the cart/favorites icons. */
function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.625rem] font-medium leading-none text-bone">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { cartCount, favoriteCount, hydrated } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer when the route changes. Adjusting state during render
  // (rather than in an effect) avoids a frame where the drawer covers the new
  // page. See https://react.dev/learn/you-might-not-need-an-effect
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // Lock body scroll behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Counts come from localStorage, so render them only after hydration to
  // avoid a server/client mismatch.
  const showCounts = hydrated;

  return (
    <>
      {/* The drawer below is a SIBLING of this header on purpose: `backdrop-blur`
          makes an element a containing block for `position: fixed` descendants,
          so a drawer nested inside would size against the 64px header instead
          of the viewport. */}
      <header className="sticky top-0 z-50 border-b border-line bg-bone/85 backdrop-blur-md">
      <nav aria-label="Primary" className="shell">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="-ml-2 p-2 text-xl transition-opacity hover:opacity-60 md:hidden"
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            className="font-display text-lg font-normal leading-none tracking-[0.02em] text-ink transition-opacity hover:opacity-70 sm:text-xl md:text-[1.4rem]"
          >
            Abdirahman Asad
            <span className="ml-1.5 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted">
              Store
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`eyebrow link-underline transition-colors hover:text-ink ${
                    pathname === link.href ? "text-ink" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`eyebrow link-underline text-brass transition-colors hover:text-ink ${
                    pathname.startsWith("/admin") ? "text-ink" : ""
                  }`}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            <Link
              href="/favorites"
              className="relative p-2 text-xl text-ink transition-opacity hover:opacity-60"
              aria-label={
                showCounts && favoriteCount > 0
                  ? `Favorites, ${favoriteCount} saved`
                  : "Favorites"
              }
            >
              <HeartIcon filled={showCounts && favoriteCount > 0} />
              {showCounts && <Badge count={favoriteCount} />}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-xl text-ink transition-opacity hover:opacity-60"
              aria-label={
                showCounts && cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
              }
            >
              <BagIcon />
              {showCounts && <Badge count={cartCount} />}
            </Link>

            <div className="ml-1 hidden items-center sm:flex">
              {!isLoaded ? (
                <div
                  className="h-8 w-20 animate-pulse bg-bone-deep"
                  aria-hidden="true"
                />
              ) : isSignedIn ? (
                <UserButton
                  appearance={{ elements: { avatarBox: "h-8 w-8" } }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button type="button" className="eyebrow link-underline text-muted transition-colors hover:text-ink">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button type="button" className="btn btn-primary !px-5 !py-2.5">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-scrim/30 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            className="animate-fade absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-line bg-bone"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="eyebrow text-muted">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="-mr-2 p-2 text-xl transition-opacity hover:opacity-60"
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="flex flex-col px-5 py-4">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="block border-b border-line py-4 font-display text-2xl transition-colors hover:text-brass"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="block border-b border-line py-4 font-display text-2xl text-brass transition-colors hover:text-ink"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <span className="eyebrow text-muted">Appearance</span>
              <ThemeToggle className="-mr-2" />
            </div>

            <div className="border-t border-line p-5">
              {!isLoaded ? (
                <div className="h-10 w-full animate-pulse bg-bone-deep" aria-hidden="true" />
              ) : isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
                  <span className="text-sm text-muted">Your account</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <SignUpButton mode="modal">
                    <button type="button" className="btn btn-primary w-full">
                      Sign Up
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button type="button" className="btn btn-outline w-full">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
