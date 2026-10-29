import "server-only";

import { ApiError } from "@/lib/api/client";
import { getDestinationBySlug, listDestinations } from "@/lib/api/destinations";
import { listCategories } from "@/lib/api/categories";

export async function getCachedDestination(slug: string) {
  "use cache";
  try {
    return await getDestinationBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }
}

export async function getCachedCategories() {
  "use cache";
  return listCategories();
}

export async function getPublishedDestinationSlugs() {
  "use cache";
  const result = await listDestinations({ limit: 50 });
  return result.data.map(({ slug }) => slug);
}
