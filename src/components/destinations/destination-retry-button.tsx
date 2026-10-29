"use client";

import { useRouter } from "next/navigation";
import { messages } from "@/messages/en";

export function DestinationRetryButton() {
  const router = useRouter();

  return (
    <button className="button button-outline" type="button" onClick={() => router.refresh()}>
      {messages.destinationsPage.retry}
    </button>
  );
}
