import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

export type SessionUpdateResult = {
  supabaseResponse: NextResponse;
  user: User | null;
};

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
): Promise<SessionUpdateResult> {
  // Przekazujemy zmodyfikowane nagłówki żądania (np. z nonce CSP) dalej do
  // renderu, żeby Next mógł odczytać nonce i doczepić go do swoich skryptów.
  const headers = requestHeaders ?? request.headers;

  let supabaseResponse = NextResponse.next({
    request: { headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}

export function copySupabaseCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}
