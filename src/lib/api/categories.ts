import { api } from "@/lib/api/client";
import type { DestinationCategory } from "@/lib/api/destinations";

export function listCategories() {
  return api.get<DestinationCategory[]>("/api/v1/categories");
}
