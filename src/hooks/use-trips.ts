"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrip,
  deleteTrip,
  getTrip,
  inviteTripMember,
  listTrips,
  listTripMembers,
  removeTripMember,
  respondToTripInvitation,
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

export function useTripMembers(tripId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: queryKeys.trips.members(tripId, page, limit),
    queryFn: () => listTripMembers(tripId, page, limit),
    enabled: tripId.length > 0,
  });
}

function invalidateTripMembers(queryClient: ReturnType<typeof useQueryClient>, tripId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.trips.memberLists(tripId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }),
  ]);
}

export function useInviteTripMember(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => inviteTripMember(tripId, email),
    onSuccess: () => invalidateTripMembers(queryClient, tripId),
  });
}

export function useRemoveTripMember(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeTripMember(tripId, userId),
    onSuccess: () => invalidateTripMembers(queryClient, tripId),
  });
}

export function useRespondToTripInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, action }: { tripId: string; action: "accept" | "decline" }) =>
      respondToTripInvitation(tripId, action),
    onSuccess: (_result, { tripId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }),
      ]),
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
