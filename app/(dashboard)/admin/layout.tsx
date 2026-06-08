import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchIsAdmin } from "@/lib/require-admin";

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

  if (!(await fetchIsAdmin(supabase, user.id))) {
    redirect("/");
  }

  return children;
}
