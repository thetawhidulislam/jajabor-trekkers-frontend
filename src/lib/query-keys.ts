import type { DestinationListParams } from "@/lib/api/destinations";

// Every query key lives here so invalidation after mutations stays predictable.
export const queryKeys = {
  destinations: {
    all: ["destinations"] as const,
    list: (params: DestinationListParams = {}) => ["destinations", "list", params] as const,
    detail: (slug: string) => ["destinations", "detail", slug] as const,
    reviews: (slug: string, page = 1) => ["destinations", "reviews", slug, page] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => ["categories", "list"] as const,
  },
};
