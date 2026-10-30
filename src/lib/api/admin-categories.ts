import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryBody = NonNullable<
  paths["/api/v1/admin/categories"]["post"]["requestBody"]
>["content"]["application/json"];

export function listAdminCategories() {
  return api.get<AdminCategory[]>("/api/v1/categories");
}

export function createAdminCategory(body: CategoryBody) {
  return api.post<AdminCategory>("/api/v1/admin/categories", body);
}

export function updateAdminCategory(id: string, body: CategoryBody) {
  return api.patch<AdminCategory>(`/api/v1/admin/categories/${encodeURIComponent(id)}`, body);
}

export function deleteAdminCategory(id: string) {
  return api.delete<{ id: string }>(`/api/v1/admin/categories/${encodeURIComponent(id)}`);
}
