import { api } from "@/lib/api/client";

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
  items: unknown[];
  summary: DestinationReviewSummary;
};

export function listDestinationReviews(slug: string, page = 1, limit = 10) {
  return api.get<DestinationReviewList>(`/api/v1/destinations/${encodeURIComponent(slug)}/reviews`, {
    query: { page, limit },
  });
}
