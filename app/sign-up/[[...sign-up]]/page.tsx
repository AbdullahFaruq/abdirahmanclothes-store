import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an Abdirahman Asad Store account.",
};

export default function SignUpPage() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-16">
      <div className="mb-10 text-center">
        <p className="eyebrow text-brass">Join the store</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Create account</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Keep your favorites and bag in sync across every device.
        </p>
      </div>

      <SignUp
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
