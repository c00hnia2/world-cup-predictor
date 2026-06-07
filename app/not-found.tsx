import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Błąd 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Nie znaleziono strony
      </h1>
      <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
        Strona, której szukasz, nie istnieje lub nie masz do niej dostępu.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
      >
        Wróć na stronę główną
      </Link>
    </main>
  );
}
