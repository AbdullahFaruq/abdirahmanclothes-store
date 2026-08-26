import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { StoreProvider } from "@/components/StoreProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { getStoreUser } from "@/lib/auth";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Abdirahman Asad Store — Considered Modern Clothing",
    template: "%s · Abdirahman Asad Store",
  },
  description:
    "A considered wardrobe of modern essentials. Outerwear, knitwear and tailoring made from natural fibres, cut for everyday wear.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read once per request and pass down, so the nav can show the admin link
  // without every child re-querying Clerk.
  const user = await getStoreUser();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col bg-bone text-ink">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.14em] focus:text-bone"
          >
            Skip to content
          </a>

          <ToastProvider>
            <StoreProvider>
              <Navbar isAdmin={user?.role === "admin"} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </StoreProvider>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
