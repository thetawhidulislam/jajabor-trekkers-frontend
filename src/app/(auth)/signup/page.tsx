import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/auth-forms";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <Suspense fallback={<p className="auth-loading" role="status">{messages.common.loading}</p>}>
      <SignupPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignupPageContent({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  return <SignupForm safeNext={safeRedirect(next)} />;
}
