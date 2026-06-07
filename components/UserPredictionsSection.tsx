import Link from "next/link";
import { UserPredictionsList } from "@/components/UserPredictionsList";
import { getUserPredictions } from "@/lib/get-user-predictions";

export async function UserPredictionsSection() {
  const result = await getUserPredictions();

  if (result.status === "unauthenticated") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          Zaloguj się, aby zobaczyć swoje zapisane typy.
        </p>
        <Link
          href="/login?next=/"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
        >
          Zaloguj się
        </Link>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
      >
        Nie udało się pobrać zapisanych typów.
      </p>
    );
  }

  return <UserPredictionsList predictions={result.predictions} />;
}
