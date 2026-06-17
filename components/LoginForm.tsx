"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
} from "@/components/auth/AuthFormStyles";
import { initialAuthFormState } from "@/types/auth";

interface LoginFormProps {
  successMessage?: string | null;
}

export function LoginForm({ successMessage }: LoginFormProps) {
  const [state, formAction] = useActionState(login, initialAuthFormState);

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

      {successMessage ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      ) : null}

      {state.status === "success" && state.message ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
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
        <label htmlFor="password" className={authLabelClass}>
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
        <p className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            Zapomniałeś hasła?
          </Link>
        </p>
      </div>

      <AuthSubmitButton idleLabel="Zaloguj się" pendingLabel="Logowanie…" />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Nie masz konta?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Zarejestruj się
        </Link>
      </p>
    </form>
  );
}
