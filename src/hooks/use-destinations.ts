import { useQuery } from "@tanstack/react-query";
import { listDestinations, type DestinationListParams } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/query-keys";

export function useDestinations(params: DestinationListParams = {}) {
  return useQuery({
    queryKey: queryKeys.destinations.list(params),
    queryFn: ({ signal }) => listDestinations(params, signal),
  });
}
