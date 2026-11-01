"use client";

import Link from "next/link";
import { messages } from "@/messages/en";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="shell destination-not-found global-error" role="alert">
      <h1>{messages.app.errorTitle}</h1>
      <p>{messages.app.errorDescription}</p>
      <div className="global-error-actions">
        <button className="button button-primary" onClick={retry} type="button">
          {messages.app.retry}
        </button>
        <Link className="button button-outline" href="/">
          {messages.app.backHome}
        </Link>
      </div>
    </main>
  );
}
