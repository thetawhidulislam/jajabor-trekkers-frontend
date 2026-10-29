import type { DestinationListParams } from "@/lib/api/destinations";
import type { TripListParams } from "@/lib/api/trips";

// Every query key lives here so invalidation after mutations stays predictable.
export const queryKeys = {
  destinations: {
    all: ["destinations"] as const,
    list: (params: DestinationListParams = {}) => ["destinations", "list", params] as const,
    published: () => ["destinations", "published"] as const,
    detail: (slug: string) => ["destinations", "detail", slug] as const,
    reviews: (slug: string, page = 1) => ["destinations", "reviews", slug, page] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => ["categories", "list"] as const,
  },
  trips: {
    all: ["trips"] as const,
    lists: ["trips", "list"] as const,
    list: (params: TripListParams = {}) => ["trips", "list", params] as const,
    detail: (id: string) => ["trips", "detail", id] as const,
  },
};
