import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/types/role";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[admin/layout] role fetch:", error.message);
    redirect("/");
  }

  if (!isAdminRole(profile?.role)) {
    redirect("/");
  }

  return children;
}
