import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type DestinationListParams = NonNullable<
  paths["/api/v1/destinations"]["get"]["parameters"]["query"]
>;

export type DestinationCategory = {
  id: string;
  name: string;
  slug: string;
};

export type DestinationCard = {
  id: string;
  slug: string;
  name: string;
  division: string;
  district: string | null;
  coverImage: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  recommendedDays: number;
  difficulty: "EASY" | "MODERATE" | "HARD";
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
};

export type DestinationDetail = DestinationCard & {
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  bestTimeToVisit?: string | null;
  activities?: string[] | null;
  safetyNotes?: string | null;
  permissionRequired?: boolean;
  permissionNote?: string | null;
  images?: {
    id: string;
    url: string;
    caption: string | null;
    sortOrder: number;
  }[];
};

export function listDestinations(params: DestinationListParams = {}, signal?: AbortSignal) {
  return api.get<DestinationCard[]>("/api/v1/destinations", { query: params, signal });
}

export function getDestinationBySlug(slug: string) {
  return api.get<DestinationDetail>(`/api/v1/destinations/${encodeURIComponent(slug)}`);
}
