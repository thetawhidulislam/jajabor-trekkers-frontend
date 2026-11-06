import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getBackendUrl } from "@/lib/env";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readUser(value: unknown): SessionUser | null {
  if (!isRecord(value)) return null;
  const { id, name, email, image, role } = value;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    (image !== null && typeof image !== "string") ||
    (role !== "USER" && role !== "ADMIN")
  ) {
    return null;
  }
  return { id, name, email, image, role };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token")
    ?? cookieStore.get("__Secure-better-auth.session_token")
    ?? cookieStore.get("better-auth-session_token")
    ?? cookieStore.get("__Secure-better-auth-session_token");
  if (!sessionCookie) return null;

  const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Could not read the Better Auth session", response.status, response.statusText);
      return null;
    }

    const payload: unknown = await response.json();
    if (payload === null) return null;
    if (!isRecord(payload)) {
      console.error("Better Auth returned an invalid session response");
      return null;
    }
    return readUser(payload.user);
  } catch (error) {
    console.error("Could not reach the Better Auth session endpoint", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}
