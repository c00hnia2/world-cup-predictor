import { ProfileAccuracyPieCharts } from "@/components/profile/ProfileAccuracyPieCharts";
import { ProfilePageProvider } from "@/components/profile/ProfilePageProvider";
import { ProfileStatsSummary } from "@/components/profile/ProfileStatsSummary";
import { ProfileTimelineCharts } from "@/components/profile/ProfileTimelineCharts";
import type { ProfilePageData } from "@/lib/get-profile-data";

interface ProfilePageViewProps {
  profileData: ProfilePageData;
}

export function ProfilePageView({ profileData }: ProfilePageViewProps) {
  const { isOwnProfile } = profileData;

  return (
    <ProfilePageProvider
      username={profileData.profileUsername}
      displayName={profileData.displayName}
    >
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {isOwnProfile ? "Twoje statystyki" : "Statystyki gracza"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Profil gracza
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          {isOwnProfile
            ? "Podsumowanie skuteczności typowania, historii rankingu i zgromadzonych punktów."
            : "Statystyki typowania, historia rankingu i zgromadzone punkty wybranego gracza."}
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
          finishedPredictions={
            profileData.chartData.stats.totalFinishedPredictions
          }
          isOwnProfile={isOwnProfile}
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
    </ProfilePageProvider>
  );
}
