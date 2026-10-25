import { z } from "zod";

// Server-side environment. Never import the result into code that must run only in the browser.
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_URL: z.string().optional(),
});

let cachedBackendUrl: string | undefined;

/** Absolute backend URL for server-side fetches (Server Components, route handlers). */
export function getBackendUrl(): string {
  if (cachedBackendUrl) return cachedBackendUrl;

  const env = serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_URL: process.env.BACKEND_URL,
  });

  let url = env.BACKEND_URL;
  if (!url) {
    if (env.NODE_ENV === "production") {
      throw new Error("BACKEND_URL is required in production (e.g. https://api.example.com)");
    }
    url = "http://localhost:5000";
  }

  const parsed = z.url().safeParse(url);
  if (!parsed.success) {
    throw new Error(`BACKEND_URL is not a valid URL: "${url}"`);
  }

  cachedBackendUrl = url.replace(/\/+$/, "");
  return cachedBackendUrl;
}
