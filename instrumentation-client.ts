import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1",
  ),
  // Session Replay wyłączone domyślnie (prywatność + waga bundla).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});

// Instrumentacja nawigacji App Routera (wymagane przez SDK po stronie klienta).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
