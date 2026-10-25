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
  // TODO: restrict to the Cloudinary host once image upload is added.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
};

export default nextConfig;
