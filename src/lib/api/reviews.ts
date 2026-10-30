import { api } from "@/lib/api/client";
import { getDestinationBySlug, type DestinationDetail } from "@/lib/api/destinations";
import type { paths } from "@/types/api";

type ReviewBase = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type DestinationReview = ReviewBase;

export type DestinationReviewSummary = {
  avgRating: number;
  reviewCount: number;
  distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
};

export type DestinationReviewList = {
  items: DestinationReview[];
  summary: DestinationReviewSummary;
};

export type MyDestinationReview = {
  review: DestinationReview | null;
  canReview: boolean;
};

export type CreateReviewBody = NonNullable<
  paths["/api/v1/destinations/{slug}/reviews"]["post"]["requestBody"]
>["content"]["application/json"];

export type UpdateReviewBody = NonNullable<
  paths["/api/v1/destinations/{slug}/reviews/me"]["patch"]["requestBody"]
>["content"]["application/json"];

export function listDestinationReviews(slug: string, page = 1, limit = 10) {
  return api.get<DestinationReviewList>(
    `/api/v1/destinations/${encodeURIComponent(slug)}/reviews`,
    { query: { page, limit } },
  );
}

export function getMyDestinationReview(slug: string) {
  return api.get<MyDestinationReview>(
    `/api/v1/destinations/${encodeURIComponent(slug)}/reviews/me`,
  );
}

export function createDestinationReview(slug: string, body: CreateReviewBody) {
  return api.post<DestinationReview>(
    `/api/v1/destinations/${encodeURIComponent(slug)}/reviews`,
    body,
  );
}

export function updateMyDestinationReview(slug: string, body: UpdateReviewBody) {
  return api.patch<DestinationReview>(
    `/api/v1/destinations/${encodeURIComponent(slug)}/reviews/me`,
    body,
  );
}

export function deleteMyDestinationReview(slug: string) {
  return api.delete<null>(
    `/api/v1/destinations/${encodeURIComponent(slug)}/reviews/me`,
  );
}

export function getDestinationRating(slug: string) {
  return getDestinationBySlug(slug);
}

export type DestinationRating = Pick<DestinationDetail, "avgRating" | "reviewCount">;
