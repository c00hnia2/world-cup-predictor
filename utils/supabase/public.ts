import { createClient } from "@supabase/supabase-js";

// Klient do PUBLICZNYCH odczytów (mecze, drużyny) — bez cookies i bez sesji.
// Używany wewnątrz unstable_cache, które nie może sięgać po API żądania
// (cookies/headers). Dane są publiczne na mocy RLS (policy "viewable by everyone"),
// więc brak sesji jest bezpieczny i pożądany.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
