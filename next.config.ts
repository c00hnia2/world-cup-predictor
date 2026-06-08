import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Uwaga: Content-Security-Policy NIE jest tu ustawiane — budujemy je per-request
// z nonce w proxy.ts (lib/csp.ts), co pozwala wyeliminować 'unsafe-inline' dla
// skryptów w produkcji. Pozostałe nagłówki są statyczne (te same dla każdej
// odpowiedzi), więc zostają w konfiguracji.
const securityHeaders = [
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
