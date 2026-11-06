"use client";

import { useQuery } from "@tanstack/react-query";
import { listPendingInvitations } from "@/lib/api/trips";
import { queryKeys } from "@/lib/query-keys";

export function usePendingInvitations(enabled = true, page = 1, limit = 50) {
  return useQuery({
    queryKey: queryKeys.invitations.pending(page, limit),
    queryFn: () => listPendingInvitations(page, limit),
    enabled,
    staleTime: 60_000,
  });
}
