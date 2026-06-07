"use client";

import { useActionState } from "react";
import { createLeague } from "@/app/actions/leagues";
import { initialLeagueFormState } from "@/types/league";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
} from "@/components/auth/AuthFormStyles";

export function CreateLeagueForm() {
  const [state, formAction] = useActionState(createLeague, initialLeagueFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="league-name" className={authLabelClass}>
          Nazwa ligi
        </label>
        <input
          id="league-name"
          name="name"
          type="text"
          required
          maxLength={60}
          placeholder="np. Liga szkolna"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "league-name-error" : undefined}
          className={`${authInputClass} ${state.fieldErrors?.name ? authInputErrorClass : ""}`}
        />
        {state.fieldErrors?.name ? (
          <p id="league-name-error" className={authFieldErrorClass}>
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <AuthSubmitButton idleLabel="Utwórz ligę" pendingLabel="Tworzenie…" />
    </form>
  );
}
