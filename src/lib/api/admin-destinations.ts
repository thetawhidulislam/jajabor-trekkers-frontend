import { api } from "@/lib/api/client";
import type { DestinationCard, DestinationDetail } from "@/lib/api/destinations";
import type { paths } from "@/types/api";

type AdminDestinationPath = "/api/v1/admin/destinations";
type AdminDestinationItemPath = "/api/v1/admin/destinations/{id}";
type AdminDestinationFeaturedPath = "/api/v1/admin/destinations/{id}/featured";

export type AdminDestinationParams = NonNullable<
  paths[AdminDestinationPath]["get"]["parameters"]["query"]
>;
export type CreateDestinationBody = NonNullable<
  paths[AdminDestinationPath]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateDestinationBody = NonNullable<
  paths[AdminDestinationItemPath]["patch"]["requestBody"]
>["content"]["application/json"];
export type DestinationFeaturedBody = NonNullable<
  paths[AdminDestinationFeaturedPath]["patch"]["requestBody"]
>["content"]["application/json"];
export type DestinationStatus = CreateDestinationBody["status"];
export type DestinationDifficulty = CreateDestinationBody["difficulty"];
export type DestinationImageInput = NonNullable<CreateDestinationBody["images"]>[number];

export type AdminDestination = Omit<DestinationDetail, "category"> & {
  category: { id: string; name: string; slug: string };
  lastVerifiedAt: string | null;
  status: NonNullable<DestinationStatus>;
  isFeatured: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  images: Array<{
    id: string;
    url: string;
    caption: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type AdminDestinationCard = DestinationCard & { status: NonNullable<DestinationStatus> };

export function listAdminDestinations(params: AdminDestinationParams = {}) {
  return api.get<AdminDestinationCard[]>("/api/v1/admin/destinations", { query: params });
}

export function getAdminDestination(id: string) {
  return api.get<AdminDestination>(`/api/v1/admin/destinations/${encodeURIComponent(id)}`);
}

export function createAdminDestination(body: CreateDestinationBody) {
  return api.post<AdminDestination>("/api/v1/admin/destinations", body);
}

export function updateAdminDestination(id: string, body: UpdateDestinationBody) {
  return api.patch<AdminDestination>(`/api/v1/admin/destinations/${encodeURIComponent(id)}`, body);
}

export function updateAdminDestinationStatus(id: string, status: NonNullable<DestinationStatus>) {
  return api.patch<AdminDestination>(
    `/api/v1/admin/destinations/${encodeURIComponent(id)}/status`,
    { status },
  );
}

export function updateAdminDestinationFeatured(id: string, body: DestinationFeaturedBody) {
  return api.patch<AdminDestination>(
    `/api/v1/admin/destinations/${encodeURIComponent(id)}/featured`,
    body,
  );
}

export function deleteAdminDestination(id: string) {
  return api.delete<{ id: string }>(`/api/v1/admin/destinations/${encodeURIComponent(id)}`);
}
