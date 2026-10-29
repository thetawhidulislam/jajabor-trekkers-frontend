import { api } from "@/lib/api/client";
import type { DestinationCard } from "@/lib/api/destinations";
import type { paths } from "@/types/api";

export type TripListParams = NonNullable<paths["/api/v1/trips"]["get"]["parameters"]["query"]>;
export type TripStatus = NonNullable<TripListParams["status"]>;
export type TripSort = NonNullable<TripListParams["sort"]>;
export type CreateTripBody = NonNullable<
  paths["/api/v1/trips"]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateTripBody = NonNullable<
  paths["/api/v1/trips/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];

export type TripDestination = Pick<DestinationCard, "name" | "slug"> & {
  coverImage: string | null;
};

export type TripMember = {
  id: string;
  name: string;
};

export type Trip = {
  id: string;
  title: string;
  status: TripStatus;
  destinationId?: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  notes: string | null;
  destination: TripDestination | null;
  memberCount: number;
  myRole: string;
  owner: { id: string; name: string };
  members: TripMember[];
};

export function listTrips(params: TripListParams = {}, signal?: AbortSignal) {
  return api.get<Trip[]>("/api/v1/trips", { query: params, signal });
}

export function getTrip(id: string) {
  return api.get<Trip>(`/api/v1/trips/${encodeURIComponent(id)}`);
}

export function createTrip(body: CreateTripBody) {
  return api.post<Trip>("/api/v1/trips", body);
}

export function updateTrip(id: string, body: UpdateTripBody) {
  return api.patch<Trip>(`/api/v1/trips/${encodeURIComponent(id)}`, body);
}

export function updateTripStatus(id: string, status: TripStatus) {
  return api.patch<Trip>(`/api/v1/trips/${encodeURIComponent(id)}/status`, { status });
}

export function deleteTrip(id: string) {
  return api.delete<unknown>(`/api/v1/trips/${encodeURIComponent(id)}`);
}
