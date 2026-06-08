import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/types/role";

export type AdminAccessResult =
  | { authorized: true; userId: string }
  | { authorized: false; message: string };

// Wspólne źródło prawdy o roli admina — używane przez akcje serwerowe
// (requireAdminAccess) oraz layout panelu admina (app/(dashboard)/admin/layout.tsx).
export async function fetchIsAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[fetchIsAdmin] profile fetch:", error.message);
    return false;
  }

  return isAdminRole(profile?.role);
}

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, message: "Brak uprawnień." };
  }

  if (!(await fetchIsAdmin(supabase, user.id))) {
    return { authorized: false, message: "Brak uprawnień." };
  }

  return { authorized: true, userId: user.id };
}
