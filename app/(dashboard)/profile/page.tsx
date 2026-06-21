import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileAccuracyPieCharts } from "@/components/profile/ProfileAccuracyPieCharts";
import { ProfileStatsSummary } from "@/components/profile/ProfileStatsSummary";
import { ProfileTimelineCharts } from "@/components/profile/ProfileTimelineCharts";
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

  const profileData = await getProfilePageData(user.id);

  return (
    <>
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Twoje statystyki
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Profil gracza
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Podsumowanie skuteczności typowania, historii rankingu i zgromadzonych
          punktów.
        </p>
      </header>

      {profileData.hasError ? (
        <p
          role="alert"
          className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Nie udało się pobrać części statystyk profilu. Odśwież stronę i spróbuj
          ponownie.
        </p>
      ) : null}

      <div className="space-y-8">
        <ProfileStatsSummary
          displayName={profileData.displayName}
          globalRank={profileData.globalRank}
          totalPoints={profileData.totalPoints}
          exactScoresCount={profileData.exactScoresCount}
          correctOutcomesCount={profileData.correctOutcomesCount}
          finishedPredictions={profileData.chartData.stats.totalFinishedPredictions}
        />

        <ProfileAccuracyPieCharts
          exactScorePie={profileData.chartData.exactScorePie}
          overallAccuracyPie={profileData.chartData.overallAccuracyPie}
        />

        <ProfileTimelineCharts
          timelineComparison={profileData.chartData.timelineComparison}
          usingMockTimeline={profileData.chartData.usingMockTimeline}
        />
      </div>
    </>
  );
}
