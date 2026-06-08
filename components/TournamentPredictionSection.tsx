import { OtherTournamentPredictions } from "@/components/OtherTournamentPredictions";
import { TournamentPredictionForm } from "@/components/TournamentPredictionForm";
import { getTournamentPredictionData } from "@/lib/get-tournament-prediction-data";

export async function TournamentPredictionSection() {
  const data = await getTournamentPredictionData();

  if (data.status === "unauthenticated") {
    return null;
  }

  if (data.status === "error") {
    return (
      <section
        aria-labelledby="tournament-prediction-heading"
        className="mb-10 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 dark:border-rose-900/50 dark:bg-rose-950/20"
      >
        <h2
          id="tournament-prediction-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Typowanie turniejowe
        </h2>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
          Nie udało się pobrać danych typowania turniejowego.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="tournament-prediction-heading"
      className="mb-10 rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-6">
        <h2
          id="tournament-prediction-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Typowanie turniejowe
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Wytypuj zwycięzcę całego mundialu oraz króla strzelców przed pierwszym
          meczem.
        </p>
      </div>

      <TournamentPredictionForm
        teams={data.teams}
        players={data.players}
        prediction={data.prediction}
        isLocked={data.isLocked}
      />

      <OtherTournamentPredictions />
    </section>
  );
}
