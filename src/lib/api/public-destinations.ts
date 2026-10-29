import "server-only";

import { getDestinationBySlug, listDestinations } from "@/lib/api/destinations";
import { listCategories } from "@/lib/api/categories";

export async function getCachedDestination(slug: string) {
  "use cache";
  return getDestinationBySlug(slug);
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
