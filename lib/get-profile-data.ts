import { buildTimelineComparisonData } from "@/lib/build-ranking-history";
import { getUserPredictions } from "@/lib/get-user-predictions";
import {
  buildProfileChartData,
  type ProfileChartData,
} from "@/lib/profile-chart-data";
import { assignCompetitionPositions } from "@/lib/competition-rank";
import {
  getRankingStatsFromProfile,
  toRankingCriteria,
} from "@/lib/ranking-stats";
import {
  getUserDisplayName,
  type PublicProfile,
} from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export interface ProfilePageData {
  displayName: string;
  globalRank: number | null;
  totalPoints: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
  chartData: ProfileChartData;
  hasError: boolean;
}

async function getCurrentUserGlobalRank(
  userId: string,
): Promise<{ rank: number | null; profile: PublicProfile | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_profiles")
    .select(
      "id, username, total_points, exact_scores_count, correct_outcomes_count",
    )
    .order("total_points", { ascending: false })
    .order("exact_scores_count", { ascending: false })
    .order("correct_outcomes_count", { ascending: false });

  if (error) {
    console.error("[getProfilePageData] leaderboard fetch:", error.message);
    return { rank: null, profile: null };
  }

  const profiles = (data ?? []) as PublicProfile[];
  const positions = assignCompetitionPositions(profiles, (profile) =>
    toRankingCriteria(getRankingStatsFromProfile(profile)),
  );

  const userIndex = profiles.findIndex((profile) => profile.id === userId);

  if (userIndex === -1) {
    return { rank: null, profile: null };
  }

  return {
    rank: positions[userIndex],
    profile: profiles[userIndex],
  };
}

export async function getProfilePageData(
  userId: string,
): Promise<ProfilePageData> {
  const [predictionsResult, rankResult, timelineComparison] = await Promise.all([
    getUserPredictions(),
    getCurrentUserGlobalRank(userId),
    buildTimelineComparisonData(userId),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = getUserDisplayName({
    username: rankResult.profile?.username ?? null,
    email: user?.email ?? null,
  });

  if (predictionsResult.status === "error") {
    return {
      displayName,
      globalRank: rankResult.rank,
      totalPoints: rankResult.profile?.total_points ?? 0,
      exactScoresCount: rankResult.profile?.exact_scores_count ?? 0,
      correctOutcomesCount: rankResult.profile?.correct_outcomes_count ?? 0,
      chartData: buildProfileChartData([], timelineComparison, {
        currentUserId: userId,
        currentUserDisplayName: displayName,
      }),
      hasError: true,
    };
  }

  const predictions =
    predictionsResult.status === "ok" ? predictionsResult.predictions : [];

  const chartData = buildProfileChartData(predictions, timelineComparison, {
    currentUserId: userId,
    currentUserDisplayName: displayName,
  });

  return {
    displayName,
    globalRank: rankResult.rank,
    totalPoints: rankResult.profile?.total_points ?? 0,
    exactScoresCount: rankResult.profile?.exact_scores_count ?? 0,
    correctOutcomesCount: rankResult.profile?.correct_outcomes_count ?? 0,
    chartData,
    hasError: false,
  };
}
