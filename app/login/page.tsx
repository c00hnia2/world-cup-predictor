import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

// Render per-request — wymagane, by skrypty dostały nonce CSP z proxy.ts.
// Bez tego strona byłaby statyczna, a jej skrypty (bez nonce) zostałyby
// zablokowane przez script-src 'strict-dynamic'.
export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ message?: string; error?: string }>;
}

const LOGIN_MESSAGES: Record<string, string> = {
  password_reset_success:
    "Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.",
};

const LOGIN_ERRORS: Record<string, string> = {
  auth_callback:
    "Nie udało się potwierdzić linku z wiadomości e-mail. Spróbuj ponownie.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message, error } = await searchParams;
  const successMessage = message ? LOGIN_MESSAGES[message] : null;
  const errorMessage = error ? LOGIN_ERRORS[error] : null;

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
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Zaloguj się
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Wróć do typowania wyników Mistrzostw Świata.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {errorMessage ? (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {errorMessage}
            </div>
          ) : null}
          <LoginForm successMessage={successMessage} />
        </div>
      </main>
    </div>
  );
}
