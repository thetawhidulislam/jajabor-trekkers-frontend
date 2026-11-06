"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { ToastProvider } from "@/providers/toast-provider";

let authRedirectInProgress = false;

function handleUnauthorized(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401 || typeof window === "undefined") return;
  if (window.location.pathname === "/login" || window.location.pathname === "/signup") return;
  if (authRedirectInProgress) return;

  authRedirectInProgress = true;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Do not retry client errors (400-499): retrying a 401/403/404 never helps.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// New client per server render (no data leaks between requests); one shared client in the browser.
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
