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
  const firstPage = await listDestinations({ page: 1, limit: 50 });
  const totalPages = firstPage.meta?.totalPages ?? 1;
  const remainingPages =
    totalPages <= 1
      ? []
      : await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            listDestinations({ page: index + 2, limit: 50 }),
          ),
        );

  return [...firstPage.data, ...remainingPages.flatMap(({ data }) => data)].map(
    ({ slug }) => slug,
  );
}
