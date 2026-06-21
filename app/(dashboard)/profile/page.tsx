import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfilePageView } from "@/components/profile/ProfilePageView";
import { getProfilePageData } from "@/lib/get-profile-data";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Profil | Typer MŚ 2026",
  description:
    "Statystyki typowania, skuteczność trafień i historia punktów zalogowanego gracza.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const profileData = await getProfilePageData(user.id, user.email);

  return <ProfilePageView profileData={profileData} />;
}
