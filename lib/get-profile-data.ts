import { buildTimelineComparisonData } from "@/lib/build-ranking-history";
import {
  getPredictionsForUser,
  getUserPredictions,
} from "@/lib/get-user-predictions";
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
  profileUsername: string | null;
  globalRank: number | null;
  totalPoints: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
  chartData: ProfileChartData;
  isOwnProfile: boolean;
  hasError: boolean;
}

export type ProfilePageDataResult =
  | ({ status: "ok" } & ProfilePageData)
  | { status: "not_found" };

async function getUserGlobalRank(
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

export async function findProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const trimmedUsername = username.trim();

  if (!trimmedUsername) {
    return null;
  }

  const { data, error } = await supabase
    .from("public_profiles")
    .select(
      "id, username, total_points, exact_scores_count, correct_outcomes_count",
    )
    .ilike("username", trimmedUsername)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[findProfileByUsername] fetch:", error.message);
    return null;
  }

  return (data as PublicProfile | null) ?? null;
}

async function buildProfilePageDataForUser(
  targetUserId: string,
  options: {
    viewerUserId: string | null;
    emailFallback?: string | null;
  },
): Promise<ProfilePageData> {
  const isOwnProfile = options.viewerUserId === targetUserId;

  const [predictionsResult, rankResult, timelineComparison] = await Promise.all([
    isOwnProfile
      ? getUserPredictions()
      : getPredictionsForUser(targetUserId),
    getUserGlobalRank(targetUserId),
    buildTimelineComparisonData(targetUserId),
  ]);

  const displayName = getUserDisplayName({
    username: rankResult.profile?.username ?? null,
    email: isOwnProfile ? (options.emailFallback ?? null) : null,
  });

  if (predictionsResult.status === "error") {
    return {
      displayName,
      profileUsername: rankResult.profile?.username ?? null,
      globalRank: rankResult.rank,
      totalPoints: rankResult.profile?.total_points ?? 0,
      exactScoresCount: rankResult.profile?.exact_scores_count ?? 0,
      correctOutcomesCount: rankResult.profile?.correct_outcomes_count ?? 0,
      chartData: buildProfileChartData([], timelineComparison, {
        currentUserId: targetUserId,
        currentUserDisplayName: displayName,
      }),
      isOwnProfile,
      hasError: true,
    };
  }

  const predictions =
    predictionsResult.status === "ok" ? predictionsResult.predictions : [];

  const chartData = buildProfileChartData(predictions, timelineComparison, {
    currentUserId: targetUserId,
    currentUserDisplayName: displayName,
  });

  return {
    displayName,
    profileUsername: rankResult.profile?.username ?? null,
    globalRank: rankResult.rank,
    totalPoints: rankResult.profile?.total_points ?? 0,
    exactScoresCount: rankResult.profile?.exact_scores_count ?? 0,
    correctOutcomesCount: rankResult.profile?.correct_outcomes_count ?? 0,
    chartData,
    isOwnProfile,
    hasError: false,
  };
}

export async function getProfilePageData(
  userId: string,
  email?: string | null,
): Promise<ProfilePageData> {
  return buildProfilePageDataForUser(userId, {
    viewerUserId: userId,
    emailFallback: email ?? null,
  });
}

export async function getProfilePageDataByUsername(
  username: string,
  viewerUserId: string | null,
): Promise<ProfilePageDataResult> {
  const profile = await findProfileByUsername(username);

  if (!profile) {
    return { status: "not_found" };
  }

  const data = await buildProfilePageDataForUser(profile.id, {
    viewerUserId,
  });

  return { status: "ok", ...data };
}
