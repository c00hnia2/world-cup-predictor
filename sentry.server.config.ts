import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Bez DSN SDK jest bezczynne (enabled:false) — zero narzutu na dev/preview.
Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
  debug: false,
});
