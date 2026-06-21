import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProfilePageView } from "@/components/profile/ProfilePageView";
import { getProfilePageDataByUsername } from "@/lib/get-profile-data";
import { createClient } from "@/utils/supabase/server";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  return {
    title: `${decodedUsername} | Profil | Typer MŚ 2026`,
    description: `Statystyki typowania gracza ${decodedUsername} w Typerze MŚ 2026.`,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/profile/${encodeURIComponent(decodedUsername)}`)}`,
    );
  }

  const result = await getProfilePageDataByUsername(decodedUsername, user.id);

  if (result.status === "not_found") {
    notFound();
  }

  return <ProfilePageView profileData={result} />;
}
