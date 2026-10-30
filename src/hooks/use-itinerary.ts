"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createItineraryItem,
  deleteItineraryItem,
  getItinerary,
  reorderItineraryItems,
  updateItineraryItem,
  type CreateItineraryItemBody,
  type ReorderItineraryBody,
  type UpdateItineraryItemBody,
} from "@/lib/api/itinerary";
import { queryKeys } from "@/lib/query-keys";

export function useItinerary(tripId: string) {
  return useQuery({
    queryKey: queryKeys.itinerary.list(tripId),
    queryFn: ({ signal }) => getItinerary(tripId, signal),
    enabled: tripId.length > 0,
  });
}

export function useCreateItineraryItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateItineraryItemBody) => createItineraryItem(tripId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.list(tripId) }),
  });
}

export function useUpdateItineraryItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: UpdateItineraryItemBody }) =>
      updateItineraryItem(tripId, itemId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.list(tripId) }),
  });
}

export function useDeleteItineraryItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteItineraryItem(tripId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.list(tripId) }),
  });
}

export function useReorderItineraryItems(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderItineraryBody) => reorderItineraryItems(tripId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.list(tripId) }),
  });
}
