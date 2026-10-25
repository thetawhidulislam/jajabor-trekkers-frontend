import { api } from "@/lib/api/client";

// TODO: replace these hand-written types with the generated ones from src/types/api.d.ts
// (run `npm run api:types` while the backend is running).
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

export type DestinationListParams = {
  page?: number;
  limit?: number;
  search?: string;
  division?: string;
  category?: string;
  difficulty?: "EASY" | "MODERATE" | "HARD";
  minCost?: number;
  maxCost?: number;
  featured?: boolean;
  sort?: "newest" | "rating" | "cost_asc" | "cost_desc";
};

export function listDestinations(params: DestinationListParams = {}, signal?: AbortSignal) {
  return api.get<DestinationCard[]>("/api/v1/destinations", { query: params, signal });
}
