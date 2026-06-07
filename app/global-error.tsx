"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Wystąpił nieoczekiwany błąd
        </h1>
        <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
          Przepraszamy za utrudnienia. Spróbuj odświeżyć stronę.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
        >
          Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
