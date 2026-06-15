import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RankingTable } from "@/components/leaderboard/RankingTable";
import { CopyInviteCode } from "@/components/leagues/CopyInviteCode";
import { buildLeagueRankEntries } from "@/lib/build-league-ranking";
import { fetchPublicProfilesByIds } from "@/lib/fetch-public-profiles";
import type { League } from "@/types/league";
import { createClient } from "@/utils/supabase/server";

interface LeagueDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getLeagueDetail(
  leagueId: string,
  userId: string,
): Promise<
  | { status: "ok"; league: League; ranking: ReturnType<typeof buildLeagueRankEntries> }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "access_denied" }
> {
  const supabase = await createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("league_members")
    .select("league_id")
    .eq("league_id", leagueId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    console.error("[league detail] membership:", membershipError.message);
    return { status: "error" };
  }

  if (!membership) {
    return { status: "access_denied" };
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, invite_code, created_by, created_at")
    .eq("id", leagueId)
    .maybeSingle();

  if (leagueError) {
    console.error("[league detail] league:", leagueError.message);
    return { status: "error" };
  }

  if (!league) {
    return { status: "not_found" };
  }

  const { data: members, error: membersError } = await supabase
    .from("league_members")
    .select("joined_at, user_id")
    .eq("league_id", leagueId);

  if (membersError) {
    console.error("[league detail] ranking:", membersError.message);
    return { status: "error" };
  }

  const profiles = await fetchPublicProfilesByIds(
    supabase,
    (members ?? []).map((member) => member.user_id),
  );

  const normalizedMembers = (members ?? []).map((member) => ({
    joined_at: member.joined_at,
    user: profiles.get(member.user_id) ?? null,
  }));

  return {
    status: "ok",
    league,
    ranking: buildLeagueRankEntries(normalizedMembers),
  };
}

export async function generateMetadata({
  params,
}: LeagueDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { title: "Liga | Typer MŚ 2026" };
  }

  const result = await getLeagueDetail(id, user.id);

  return {
    title:
      result.status === "ok"
        ? `${result.league.name} | Typer MŚ 2026`
        : "Liga | Typer MŚ 2026",
  };
}

export default async function LeagueDetailPage({ params }: LeagueDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/leagues/${id}`);
  }

  const result = await getLeagueDetail(id, user.id);

  if (result.status === "access_denied") {
    redirect("/leagues");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <>
        <Link
          href="/leagues"
          className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          ← Wróć do lig
        </Link>
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Nie udało się pobrać rankingu ligi. Spróbuj odświeżyć stronę.
        </p>
      </>
    );
  }

  const { league, ranking } = result;

  return (
    <>
      <header className="mb-10">
        <Link
          href="/leagues"
          className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          ← Wróć do lig
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {league.name}
        </h1>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Kod zaproszenia:{" "}
            <span className="font-mono tracking-widest">{league.invite_code}</span>
          </p>
          <CopyInviteCode inviteCode={league.invite_code} />
        </div>
      </header>

      <section
        aria-labelledby="ranking-heading"
        className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 sm:px-8">
          <h2
            id="ranking-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Ranking ligi
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {ranking.length}{" "}
            {ranking.length === 1 ? "gracz" : "graczy"}
          </p>
        </div>

        {ranking.length === 0 ? (
          <p
            role="status"
            className="px-6 py-12 text-center text-sm text-zinc-600 dark:text-zinc-400 sm:px-8"
          >
            Brak członków w tej lidze.
          </p>
        ) : (
          <RankingTable
            widePadding
            pointsLabel="Suma punktów"
            rows={ranking.map((entry) => ({
              key: entry.userId || `${entry.joinedAt}-${entry.position}`,
              position: entry.position,
              displayName: entry.displayName,
              exactScoresCount: entry.exactScoresCount,
              correctOutcomesCount: entry.correctOutcomesCount,
              totalPoints: entry.totalPoints,
              isCurrentUser: entry.userId === user.id,
            }))}
          />
        )}
      </section>
    </>
  );
}
