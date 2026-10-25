import { getBackendUrl } from "@/lib/env";

/** One field-level validation problem from the backend error envelope. */
export type ApiFieldError = { field?: string; message: string };

/** Pagination meta returned by every list endpoint. */
export type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResult<T> = { data: T; meta?: ApiMeta; message: string };

/** Thrown for every failed request (HTTP error, backend error envelope, or network failure). */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
}

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

// Browser: same-origin relative URL (Next.js rewrites /api/* to the backend).
// Server: absolute backend URL. NOTE: cookies are NOT forwarded automatically on the server;
// authenticated server-side fetches must pass the Cookie header explicitly (added in F2).
function resolveUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = typeof window === "undefined" ? getBackendUrl() : "";
  const url = base + path;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

type ErrorEnvelope = { success?: boolean; message?: string; errors?: ApiFieldError[] };
type SuccessEnvelope<T> = { success: true; message: string; data: T; meta?: ApiMeta };

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(resolveUrl(path, options.query), {
      method,
      headers,
      credentials: "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const envelope = (json ?? {}) as ErrorEnvelope;
    throw new ApiError(
      response.status,
      envelope.message ?? (response.statusText || "Request failed"),
      envelope.errors,
    );
  }

  if (json === null) {
    // e.g. 204 No Content
    return { data: undefined as T, message: "" };
  }

  const envelope = json as SuccessEnvelope<T> | ErrorEnvelope;
  if ("success" in envelope && envelope.success === false) {
    const failure = envelope as ErrorEnvelope;
    throw new ApiError(response.status, failure.message ?? "Request failed", failure.errors);
  }

  const ok = envelope as SuccessEnvelope<T>;
  return { data: ok.data, meta: ok.meta, message: ok.message };
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>("POST", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
};
