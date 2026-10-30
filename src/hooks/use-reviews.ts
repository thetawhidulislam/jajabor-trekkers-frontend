"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDestinationReview,
  type DestinationReviewList,
  deleteMyDestinationReview,
  getDestinationRating,
  getMyDestinationReview,
  listDestinationReviews,
  updateMyDestinationReview,
  type CreateReviewBody,
  type UpdateReviewBody,
} from "@/lib/api/reviews";
import type { DestinationDetail } from "@/lib/api/destinations";
import type { ApiResult } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

export function useDestinationReviews(
  slug: string,
  page = 1,
  initialData?: ApiResult<DestinationReviewList>,
) {
  return useQuery({
    queryKey: queryKeys.destinations.reviews(slug, page),
    queryFn: () => listDestinationReviews(slug, page),
    ...(initialData ? { initialData } : {}),
    enabled: slug.length > 0,
  });
}

export function useMyDestinationReview(slug: string) {
  return useQuery({
    queryKey: queryKeys.destinations.myReview(slug),
    queryFn: () => getMyDestinationReview(slug),
    enabled: slug.length > 0,
    retry: false,
  });
}

export function useDestinationRating(
  slug: string,
  initialData?: ApiResult<DestinationDetail>,
) {
  return useQuery({
    queryKey: queryKeys.destinations.detail(slug),
    queryFn: () => getDestinationRating(slug),
    ...(initialData ? { initialData } : {}),
    enabled: slug.length > 0,
  });
}

function invalidateReviewData(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.reviewLists(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.detail(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.myReview(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all }),
  ]);
}

export function useCreateDestinationReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewBody) => createDestinationReview(slug, body),
    onSuccess: () => invalidateReviewData(queryClient, slug),
  });
}

export function useUpdateMyDestinationReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReviewBody) => updateMyDestinationReview(slug, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.destinations.myReview(slug) }),
        invalidateReviewData(queryClient, slug),
      ]),
  });
}

export function useDeleteMyDestinationReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMyDestinationReview(slug),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.destinations.myReview(slug) }),
        invalidateReviewData(queryClient, slug),
      ]),
  });
}
