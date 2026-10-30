import type { DestinationListParams } from "@/lib/api/destinations";
import type { ExpenseListParams } from "@/lib/api/expenses";
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
  itinerary: {
    all: ["itinerary"] as const,
    list: (tripId: string) => ["itinerary", tripId] as const,
  },
  packing: {
    all: ["packing"] as const,
    list: (tripId: string) => ["packing", tripId] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    lists: (tripId: string) => ["expenses", tripId, "list"] as const,
    list: (tripId: string, params: ExpenseListParams = {}) =>
      ["expenses", tripId, "list", params] as const,
    balances: (tripId: string) => ["expenses", tripId, "balances"] as const,
    settlementLists: (tripId: string) => ["expenses", tripId, "settlements"] as const,
    settlements: (tripId: string, page = 1, limit = 10) =>
      ["expenses", tripId, "settlements", page, limit] as const,
  },
};
