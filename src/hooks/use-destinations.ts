import { useQuery } from "@tanstack/react-query";
import {
  listDestinations,
  type DestinationCard,
  type DestinationListParams,
} from "@/lib/api/destinations";
import { queryKeys } from "@/lib/query-keys";

type PublishedDestinationOption = Pick<DestinationCard, "id" | "name">;

export function useDestinations(params: DestinationListParams = {}) {
  return useQuery({
    queryKey: queryKeys.destinations.list(params),
    queryFn: ({ signal }) => listDestinations(params, signal),
  });
}

export function usePublishedDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations.published(),
    queryFn: async ({ signal }) => {
      const firstPage = await listDestinations({ page: 1, limit: 50 }, signal);
      const totalPages = firstPage.meta?.totalPages ?? 1;
      const remainingPages =
        totalPages <= 1
          ? []
          : await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) =>
                listDestinations({ page: index + 2, limit: 50 }, signal),
              ),
            );
      const publishedDestinations = [
        ...firstPage.data,
        ...remainingPages.flatMap(({ data }) => data),
      ];
      return publishedDestinations.map(
        ({ id, name }): PublishedDestinationOption => ({ id, name }),
      );
    },
  });
}
