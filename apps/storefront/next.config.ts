import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/**
 * Allow product/asset images served by the configured Spree backend. Spree
 * returns Active Storage URLs on its own host (which may differ from
 * SPREE_API_URL's — e.g. store URL vs API URL, http vs https, with or without a
 * port), so we allow the SPREE_API_URL hostname over both protocols and any
 * port rather than hardcoding specific hosts. The pathname stays scoped to
 * Active Storage. Falls back to `localhost` when SPREE_API_URL is unset (dev).
 */
function spreeImagePatterns(): RemotePattern[] {
  const raw = process.env.SPREE_API_URL?.trim();
  let hostname = "localhost";
  let port = "3001";
  if (raw) {
    try {
      const parsed = new URL(raw);
      hostname = parsed.hostname;
      port = parsed.port;
    } catch {
      // Malformed SPREE_API_URL — keep the localhost fallback.
    }
  }
  const pathname = "/rails/active_storage/**";
  return [
    { protocol: "http", hostname: "localhost", port: "3001", pathname },
    { protocol: "http", hostname: "localhost", pathname },
    { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname },
    { protocol: "http", hostname: "127.0.0.1", pathname },
    { protocol: "http", hostname, port: port || undefined, pathname },
    { protocol: "https", hostname, port: port || undefined, pathname },
    { protocol: "https", hostname: "cdn.shopify.com" },
  ];
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["shop.lvh.me", "*.trycloudflare.com", "192.168.33.13"],
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN || "",
  },
  transpilePackages: ["@spree/sdk"],
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
    ],
  },
  turbopack: {
    root: __dirname,
  },
  cacheComponents: true,
  cacheLife: {
    tenMinutes: {
      stale: 300, // 5 minutes client stale window
      revalidate: 600, // 10 minutes until background revalidation
      expire: 3600, // 1 hour max before recompute on idle entries
    },
  },
  images: {
    qualities: [25, 50, 75, 85, 90, 100],
    dangerouslyAllowLocalIP: true, // Allow localhost images in development
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Derived from SPREE_API_URL — the backend the storefront points at.
      ...spreeImagePatterns(),
      // Hero campaign imagery and hosted demo assets.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Hosted demo / tunnel backends whose image host differs from SPREE_API_URL.
    ],
  },
};

const configWithIntl = withNextIntl(nextConfig);

export default process.env.SENTRY_DSN
  ? withSentryConfig(configWithIntl, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically delete source maps after uploading to Sentry
      // so they are not served publicly
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },

      // Disables the Sentry SDK build-time telemetry
      telemetry: false,
    })
  : configWithIntl;
