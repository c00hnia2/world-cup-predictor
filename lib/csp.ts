// Content Security Policy budowane per-request (nonce). Stosowane w proxy.ts.
//
// Produkcja: script-src oparte na 'nonce-...' + 'strict-dynamic' — eliminuje
// 'unsafe-inline' dla skryptów (twardsza ochrona przed XSS). Next.js sam
// dokleja nonce do swoich skryptów, gdy nagłówek Content-Security-Policy jest
// obecny w nagłówkach ŻĄDANIA (patrz proxy.ts).
//
// Development: zachowujemy 'unsafe-inline' + 'unsafe-eval' bez strict-dynamic,
// bo React Refresh / HMR wstrzykują skrypty, które nie mają nonce.

const isDev = process.env.NODE_ENV === "development";

// Edge runtime: brak Node Buffer, używamy Web Crypto + btoa.
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function buildContentSecurityPolicy(nonce: string): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    "default-src 'self'",
    scriptSrc,
    // Style nadal pozwalają 'unsafe-inline' — Tailwind / next/font wstrzykują
    // style inline; nonce na stylach byłby kosztowny i kruchy.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://flagcdn.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
