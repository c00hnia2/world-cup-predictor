import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/types/role";

export type AdminAccessResult =
  | { authorized: true; userId: string }
  | { authorized: false; message: string };

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, message: "Brak uprawnień." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[requireAdminAccess] profile fetch:", profileError.message);
    return { authorized: false, message: "Brak uprawnień." };
  }

  if (!isAdminRole(profile?.role)) {
    return { authorized: false, message: "Brak uprawnień." };
  }

  return { authorized: true, userId: user.id };
}
