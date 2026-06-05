import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium uppercase tracking-wider text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Typer MŚ 2026
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
            <svg
              className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Sprawdź skrzynkę
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sprawdź swoją skrzynkę odbiorczą. Wysłaliśmy link aktywacyjny na Twój
            adres e-mail
            {email ? (
              <>
                {" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  ({email})
                </span>
              </>
            ) : null}
            .
          </p>

          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            Kliknij link w wiadomości, aby aktywować konto. Jeśli nie widzisz
            maila, sprawdź folder spam.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-400 hover:to-emerald-500"
            >
              Przejdź do logowania
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
