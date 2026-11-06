import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type UpdateProfileBody = NonNullable<
  paths["/api/v1/users/me"]["patch"]["requestBody"]
>["content"]["application/json"];

export function updateProfile(body: UpdateProfileBody) {
  return api.patch<unknown>("/api/v1/users/me", body);
}
