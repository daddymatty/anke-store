import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anke-store.example";
const siteHost = new URL(siteUrl).host;

// SNAPSHOT=1 — режим знімка для GitHub Pages: сайт живе під basePath,
// зображення без рантайм-оптимізатора (на статичному хостингу його немає).
const isSnapshot = process.env.SNAPSHOT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // Для Docker-деплою (Dockerfile.storefront); на Vercel не заважає
  output: "standalone",
  basePath,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isSnapshot,
  },
  ...(isSnapshot ? {} : { redirects, headers }),
};

async function redirects() {
  return [
    // www → без www (301). http → https робить платформа/edge (Vercel/nginx).
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: `www.${siteHost}` }],
      destination: `${siteUrl}/:path*`,
      permanent: true,
    },
  ];
}

async function headers() {
  return [
    {
      // Статика Next: агресивний кеш (вимога розділу 9)
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/demo/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
    },
  ];
}

export default nextConfig;
