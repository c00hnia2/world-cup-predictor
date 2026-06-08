import { type NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy, generateNonce } from "@/lib/csp";
import {
  copySupabaseCookies,
  updateSession,
} from "@/utils/supabase/middleware";

// Trasy wymagające logowania. Uwaga: "/" jest CELOWO publiczne (landing
// indeksowalny — patrz app/sitemap.ts i app/robots.ts), dlatego nie jest tu
// wymienione. Wcześniejszy "/dashboard" był martwym prefiksem (grupa routingu
// (dashboard) mapuje się na "/", nie na "/dashboard").
const PROTECTED_PREFIXES = ["/admin", "/leagues"] as const;
const AUTH_ROUTE_PREFIXES = ["/login", "/register"] as const;

function matchesRoutePrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function createRedirectWithSessionCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
  csp: string,
  searchParams?: Record<string, string>,
): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      redirectUrl.searchParams.set(key, value);
    }
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);
  redirectResponse.headers.set("Content-Security-Policy", csp);
  return copySupabaseCookies(supabaseResponse, redirectResponse);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nonce CSP: wstrzykiwany w nagłówki ŻĄDANIA (żeby Next doczepił go do swoich
  // skryptów) oraz w nagłówek ODPOWIEDZI (egzekwowanie polityki w przeglądarce).
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const { supabaseResponse, user } = await updateSession(
    request,
    requestHeaders,
  );
  supabaseResponse.headers.set("Content-Security-Policy", csp);

  const isAuthenticated = Boolean(user);
  const isProtectedRoute = matchesRoutePrefix(pathname, PROTECTED_PREFIXES);
  const isAuthRoute = matchesRoutePrefix(pathname, AUTH_ROUTE_PREFIXES);

  if (!isAuthenticated && isProtectedRoute) {
    return createRedirectWithSessionCookies(
      request,
      "/login",
      supabaseResponse,
      csp,
      { next: pathname },
    );
  }

  if (isAuthenticated && isAuthRoute) {
    return createRedirectWithSessionCookies(
      request,
      "/",
      supabaseResponse,
      csp,
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
