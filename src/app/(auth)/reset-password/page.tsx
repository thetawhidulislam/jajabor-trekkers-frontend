import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return (
    <Suspense
      fallback={
        <main className="auth-page" aria-busy="true">
          <p role="status">{messages.common.loading}</p>
        </main>
      }
    >
      <ResetPasswordPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordPageContent({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const hasError = params.error !== undefined;

  return <ResetPasswordForm token={token ?? ""} hasError={hasError} />;
}
