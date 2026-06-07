"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center dark:border-rose-900/50 dark:bg-rose-950/40"
    >
      <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200">
        Coś poszło nie tak
      </h2>
      <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
        Nie udało się załadować tej sekcji. Spróbuj ponownie za chwilę.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 focus-visible:ring-4 focus-visible:ring-rose-500/30"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
