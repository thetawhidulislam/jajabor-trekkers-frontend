"use client";

import { useDestinations } from "@/hooks/use-destinations";
import { ApiError } from "@/lib/api/client";
import { messages } from "@/messages/en";

// Temporary F1 check: proves browser -> Next.js proxy -> backend works end to end.
export function DestinationCount() {
  const { data, error, isPending, refetch } = useDestinations({ limit: 1 });

  if (isPending) {
    return <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" aria-busy="true" />;
  }

  if (error) {
    const message = error instanceof ApiError ? error.message : messages.common.genericError;
    return (
      <div role="alert" className="space-y-2">
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {messages.common.retry}
        </button>
      </div>
    );
  }

  const total = data.meta?.total ?? data.data.length;
  return (
    <p className="text-lg font-medium">
      {total === 0 ? messages.home.noDestinations : messages.home.destinationCount(total)}
    </p>
  );
}
