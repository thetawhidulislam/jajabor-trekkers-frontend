import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/auth/auth-placeholder";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: messages.auth.termsTitle,
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <AuthPlaceholder title={messages.auth.termsTitle} />;
}
