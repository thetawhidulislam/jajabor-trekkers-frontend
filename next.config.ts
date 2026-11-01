import type { NextConfig } from "next";

// Backend base URL, used ONLY on the server (rewrites proxy + server-side fetches).
// Browser code never sees it: it calls same-origin /api/* and Next.js proxies it.
function resolveBackendUrl(): string {
  const raw = process.env.BACKEND_URL;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BACKEND_URL is required in production (e.g. https://api.example.com)");
    }
    return "http://localhost:5000";
  }
  try {
    return new URL(raw).toString().replace(/\/+$/, "");
  } catch {
    throw new Error(`BACKEND_URL is not a valid URL: "${raw}"`);
  }
}

const backendUrl = resolveBackendUrl();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Same-origin proxy: browser -> /api/* -> backend. Avoids CORS and cross-site cookie problems.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
