"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
  authSubmitButtonClass,
} from "@/components/auth/AuthFormStyles";
import { translateAuthError } from "@/lib/auth-errors";
import { validateEmail } from "@/lib/auth-validation";
import { createClient } from "@/utils/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );

      if (error) {
        setFormError(translateAuthError(error));
        return;
      }

      setSuccessMessage(
        "Sprawdź skrzynkę odbiorczą — wysłaliśmy link do resetowania hasła. Jeśli nie widzisz wiadomości, zajrzyj do folderu spam.",
      );
    } catch {
      setFormError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
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

      {successMessage ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={authLabelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="twoj@email.pl"
          disabled={Boolean(successMessage)}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "email-error" : undefined}
          className={`${authInputClass} ${fieldError ? authInputErrorClass : ""}`}
        />
        {fieldError ? (
          <p id="email-error" className={authFieldErrorClass}>
            {fieldError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || Boolean(successMessage)}
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
            <span>Wysyłanie…</span>
          </>
        ) : (
          <span>Wyślij link resetujący</span>
        )}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Pamiętasz hasło?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
