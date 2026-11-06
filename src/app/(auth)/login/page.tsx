import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-forms";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<p className="auth-loading" role="status">{messages.common.loading}</p>}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  return <LoginForm safeNext={safeRedirect(next)} />;
}
