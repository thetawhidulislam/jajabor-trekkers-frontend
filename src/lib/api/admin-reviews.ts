import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type AdminReviewParams = NonNullable<
  paths["/api/v1/admin/reviews"]["get"]["parameters"]["query"]
>;
export type ReviewVisibilityBody = NonNullable<
  paths["/api/v1/admin/reviews/{id}/visibility"]["patch"]["requestBody"]
>["content"]["application/json"];

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; image: string | null };
  destination: { id: string; name: string; slug: string };
};

export function listAdminReviews(params: AdminReviewParams = {}) {
  return api.get<AdminReview[]>("/api/v1/admin/reviews", { query: params });
}

export function setAdminReviewVisibility(id: string, body: ReviewVisibilityBody) {
  return api.patch<AdminReview>(
    `/api/v1/admin/reviews/${encodeURIComponent(id)}/visibility`,
    body,
  );
}

export function deleteAdminReview(id: string) {
  return api.delete<{ id: string }>(`/api/v1/admin/reviews/${encodeURIComponent(id)}`);
}
