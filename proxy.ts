import { type NextRequest, NextResponse } from "next/server";
import {
  copySupabaseCookies,
  updateSession,
} from "@/utils/supabase/middleware";

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/leagues"] as const;
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
  return copySupabaseCookies(supabaseResponse, redirectResponse);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  const isAuthenticated = Boolean(user);
  const isProtectedRoute = matchesRoutePrefix(pathname, PROTECTED_PREFIXES);
  const isAuthRoute = matchesRoutePrefix(pathname, AUTH_ROUTE_PREFIXES);

  if (!isAuthenticated && isProtectedRoute) {
    return createRedirectWithSessionCookies(
      request,
      "/login",
      supabaseResponse,
      { next: pathname },
    );
  }

  if (isAuthenticated && isAuthRoute) {
    return createRedirectWithSessionCookies(request, "/", supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
