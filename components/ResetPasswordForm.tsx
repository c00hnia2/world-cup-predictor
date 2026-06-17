"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
  authSubmitButtonClass,
} from "@/components/auth/AuthFormStyles";
import { translateAuthError } from "@/lib/auth-errors";
import { validateNewPassword } from "@/lib/auth-validation";
import { createClient } from "@/utils/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        setHasSession(Boolean(session));
        setSessionChecked(true);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const passwordError = validateNewPassword(password);
    const confirmPasswordError =
      password !== confirmPassword ? "Hasła muszą być identyczne." : null;

    if (passwordError || confirmPasswordError) {
      setFieldErrors({
        password: passwordError ?? undefined,
        confirmPassword: confirmPasswordError ?? undefined,
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFormError(translateAuthError(error));
        return;
      }

      await supabase.auth.signOut();
      router.push("/login?message=password_reset_success");
    } catch {
      setFormError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!sessionChecked) {
    return (
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Weryfikacja linku resetującego…
      </p>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col gap-5">
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Link resetujący wygasł lub jest nieprawidłowy. Poproś o nowy link
          resetowania hasła.
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-400 hover:to-emerald-500"
        >
          Wyślij nowy link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={authLabelClass}>
          Nowe hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "password-error" : undefined
          }
          className={`${authInputClass} ${fieldErrors.password ? authInputErrorClass : ""}`}
        />
        {fieldErrors.password ? (
          <p id="password-error" className={authFieldErrorClass}>
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={authLabelClass}>
          Potwierdź nowe hasło
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword ? "confirm-password-error" : undefined
          }
          className={`${authInputClass} ${fieldErrors.confirmPassword ? authInputErrorClass : ""}`}
        />
        {fieldErrors.confirmPassword ? (
          <p id="confirm-password-error" className={authFieldErrorClass}>
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className={authSubmitButtonClass}
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            <span>Zapisywanie…</span>
          </>
        ) : (
          <span>Ustaw nowe hasło</span>
        )}
      </button>
    </form>
  );
}
