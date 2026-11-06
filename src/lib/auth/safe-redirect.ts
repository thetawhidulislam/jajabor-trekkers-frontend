export function safeRedirect(
  candidate: string | null | undefined,
  fallback = "/trips",
): string {
  if (
    typeof candidate !== "string" ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.startsWith("/\\") ||
    candidate.includes("\\") ||
    candidate.includes("://")
  ) {
    return fallback;
  }
  return candidate;
}
