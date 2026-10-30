"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
  type CategoryBody,
} from "@/lib/api/admin-categories";
import {
  createAdminDestination,
  deleteAdminDestination,
  getAdminDestination,
  listAdminDestinations,
  updateAdminDestination,
  updateAdminDestinationFeatured,
  updateAdminDestinationStatus,
  type AdminDestinationParams,
  type CreateDestinationBody,
  type DestinationStatus,
  type DestinationFeaturedBody,
  type UpdateDestinationBody,
} from "@/lib/api/admin-destinations";
import {
  deleteAdminReview,
  listAdminReviews,
  setAdminReviewVisibility,
  type AdminReviewParams,
  type ReviewVisibilityBody,
} from "@/lib/api/admin-reviews";
import { queryKeys } from "@/lib/query-keys";

function invalidateDestinationData(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.destinations.lists }),
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all }),
  ]);
}

export function useAdminDestinations(params: AdminDestinationParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.destinations.list(params),
    queryFn: () => listAdminDestinations(params),
  });
}

export function useAdminDestination(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.destinations.detail(id),
    queryFn: () => getAdminDestination(id),
    enabled: id.length > 0,
  });
}

export function useCreateAdminDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDestinationBody) => createAdminDestination(body),
    onSuccess: () => invalidateDestinationData(queryClient),
  });
}

export function useUpdateAdminDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDestinationBody }) =>
      updateAdminDestination(id, body),
    onSuccess: (_result, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.destinations.detail(variables.id) }),
        invalidateDestinationData(queryClient),
      ]),
  });
}

export function useSetAdminDestinationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ destinationId, status }: { destinationId: string; status: NonNullable<DestinationStatus> }) =>
      updateAdminDestinationStatus(destinationId, status),
    onSuccess: (_result, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.destinations.detail(variables.destinationId) }),
        invalidateDestinationData(queryClient),
      ]),
  });
}

export function useSetAdminDestinationFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DestinationFeaturedBody }) =>
      updateAdminDestinationFeatured(id, body),
    onSuccess: (_result, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.destinations.detail(variables.id) }),
        invalidateDestinationData(queryClient),
      ]),
  });
}

export function useDeleteAdminDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminDestination,
    onSuccess: () => invalidateDestinationData(queryClient),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories.all,
    queryFn: listAdminCategories,
  });
}

function invalidateCategoryData(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all }),
  ]);
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryBody) => createAdminCategory(body),
    onSuccess: () => invalidateCategoryData(queryClient),
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryBody }) =>
      updateAdminCategory(id, body),
    onSuccess: () => invalidateCategoryData(queryClient),
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => invalidateCategoryData(queryClient),
  });
}

export function useAdminReviews(params: AdminReviewParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.reviews.list(params),
    queryFn: () => listAdminReviews(params),
  });
}

export function useSetAdminReviewVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReviewVisibilityBody }) =>
      setAdminReviewVisibility(id, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews.lists }),
        queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all }),
      ]),
  });
}

export function useDeleteAdminReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews.lists }),
        queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all }),
      ]),
  });
}
