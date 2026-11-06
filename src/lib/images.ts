export const ALLOWED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
] as const;

const imageFallback = "/destination-fallback.svg";

export function safeImageSrc(url?: string | null): string {
  if (!url) return imageFallback;

  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol === "https:" &&
      parsedUrl.port === "" &&
      ALLOWED_IMAGE_HOSTS.some((hostname) => parsedUrl.hostname === hostname)
    ) {
      return url;
    }
  } catch {
    return imageFallback;
  }

  return imageFallback;
}
