import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Abdirahman Asad Store account.",
};

export default function SignInPage() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-16">
      <div className="mb-10 text-center">
        <p className="eyebrow text-brass">Welcome back</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Sign in</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Your bag and favorites are waiting, saved to your account.
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full flex justify-center",
            cardBox: "shadow-none border border-line",
          },
        }}
      />
    </div>
  );
}
