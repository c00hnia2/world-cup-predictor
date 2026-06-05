"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
} from "@/components/auth/AuthFormStyles";
import { initialAuthFormState } from "@/types/auth";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialAuthFormState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {state.message}
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
          placeholder="twoj@email.pl"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          className={`${authInputClass} ${state.fieldErrors?.email ? authInputErrorClass : ""}`}
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className={authFieldErrorClass}>
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className={authLabelClass}>
          Nazwa użytkownika
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          placeholder="np. typer2026"
          aria-invalid={Boolean(state.fieldErrors?.username)}
          aria-describedby={
            state.fieldErrors?.username ? "username-error" : undefined
          }
          className={`${authInputClass} ${state.fieldErrors?.username ? authInputErrorClass : ""}`}
        />
        {state.fieldErrors?.username ? (
          <p id="username-error" className={authFieldErrorClass}>
            {state.fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={authLabelClass}>
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          className={`${authInputClass} ${state.fieldErrors?.password ? authInputErrorClass : ""}`}
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className={authFieldErrorClass}>
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <AuthSubmitButton
        idleLabel="Utwórz konto"
        pendingLabel="Rejestracja…"
      />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Masz już konto?{" "}
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
