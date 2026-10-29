"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  updateTrip,
  updateTripStatus,
  type TripListParams,
  type UpdateTripBody,
  type TripStatus,
} from "@/lib/api/trips";
import { queryKeys } from "@/lib/query-keys";

export function useTrips(params: TripListParams = {}) {
  return useQuery({
    queryKey: queryKeys.trips.list(params),
    queryFn: ({ signal }) => listTrips(params, signal),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => getTrip(id),
    enabled: id.length > 0,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTripBody }) => updateTrip(id, body),
    onSuccess: (_result, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(id) }),
      ]),
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TripStatus }) => updateTripStatus(id, status),
    onSuccess: (_result, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(id) }),
      ]),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: (_result, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.removeQueries({ queryKey: queryKeys.trips.detail(id) }),
      ]),
  });
}
