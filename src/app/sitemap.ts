import type { MetadataRoute } from "next";
import { getPublishedDestinationSlugs } from "@/lib/api/public-destinations";

function siteUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedDestinationSlugs();

  return [
    { url: siteUrl("/") },
    { url: siteUrl("/destinations") },
    ...slugs.map((slug) => ({ url: siteUrl(`/destinations/${encodeURIComponent(slug)}`) })),
  ];
}
