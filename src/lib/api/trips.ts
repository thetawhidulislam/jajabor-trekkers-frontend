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
  image?: string | null;
  role?: "OWNER" | "MEMBER";
};

export type TripMemberRecord = {
  id: string;
  name: string;
  image: string | null;
  status?: "ACCEPTED" | "PENDING";
  email?: string;
};

export type TripInvitation = {
  tripId: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string | null;
  owner: string;
  invitedAt: string;
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

export function listTripMembers(tripId: string, page = 1, limit = 50) {
  return api.get<TripMemberRecord[]>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/members`,
    { query: { page, limit } },
  );
}

export function inviteTripMember(tripId: string, email: string) {
  return api.post<{ id: string; name: string }>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/members`,
    { email },
  );
}

export function removeTripMember(tripId: string, userId: string) {
  return api.delete<{ userId: string }>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/members/${encodeURIComponent(userId)}`,
  );
}

export function listPendingInvitations(page = 1, limit = 50) {
  return api.get<TripInvitation[]>("/api/v1/trips/invitations", {
    query: { page, limit },
  });
}

export function respondToTripInvitation(
  tripId: string,
  action: "accept" | "decline",
) {
  return api.patch<{ tripId: string; action: "accepted" | "declined"; role?: "OWNER" | "MEMBER"; status?: "ACCEPTED" }>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/members/me/respond`,
    { action },
  );
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
