import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/auth/auth-placeholder";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: messages.auth.privacyTitle,
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <AuthPlaceholder title={messages.auth.privacyTitle} />;
}
