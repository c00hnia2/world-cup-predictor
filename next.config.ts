import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy.
// Uwaga: 'unsafe-inline' dla script-src jest wymagane przez bootstrap/hydrację
// Next.js bez nonce. Docelowo można przejść na nonce + 'strict-dynamic'
// wstrzykiwane w middleware. 'unsafe-eval' włączamy tylko w dev (React Refresh).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://flagcdn.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
]
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Cisza w logach buildu, gdy brak konfiguracji Sentry (np. lokalnie/preview).
  silent: !process.env.CI,
  // Upload sourcemap tylko przy obecnym SENTRY_AUTH_TOKEN (CI produkcyjne).
  widenClientFileUpload: true,
  // Zdarzenia tunelowane przez własny origin — zgodne z CSP connect-src 'self'
  // i odporne na blokery reklam.
  tunnelRoute: "/monitoring",
});
