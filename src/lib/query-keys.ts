import type { DestinationListParams } from "@/lib/api/destinations";

// Every query key lives here so invalidation after mutations stays predictable.
export const queryKeys = {
  destinations: {
    all: ["destinations"] as const,
    list: (params: DestinationListParams = {}) => ["destinations", "list", params] as const,
  },
};
