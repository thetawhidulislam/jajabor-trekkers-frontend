"use client";

import Link from "next/link";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { messages } from "@/messages/en";

export function DestinationPlanCta({ destinationId }: { destinationId: string }) {
  const { data, isPending, error, refetch } = authClient.useSession();
  const tripPath = `/trips/new?destinationId=${encodeURIComponent(destinationId)}`;

  if (isPending) {
    return (
      <button className="button button-primary destination-plan-button" type="button" disabled>
        {messages.destinationsPage.tripCtaLoading}
      </button>
    );
  }

  if (error) {
    return (
      <div className="destination-session-error" role="alert">
        <p><AlertCircle size={16} />{messages.destinationsPage.sessionError}</p>
        <button className="button button-outline" type="button" onClick={() => void refetch()}>
          {messages.destinationsPage.sessionRetry}
        </button>
      </div>
    );
  }

  const href = data?.user
    ? tripPath
    : `/signup?${new URLSearchParams({ next: tripPath }).toString()}`;

  return (
    <Link className="button button-primary destination-plan-button" href={href}>
      {messages.destinationsPage.tripCta}
      <ArrowUpRight size={18} />
    </Link>
  );
}
