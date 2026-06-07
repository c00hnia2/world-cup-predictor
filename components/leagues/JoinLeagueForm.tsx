"use client";

import { useActionState } from "react";
import { joinLeague } from "@/app/actions/leagues";
import { initialLeagueFormState } from "@/types/league";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import {
  authFieldErrorClass,
  authInputClass,
  authInputErrorClass,
  authLabelClass,
} from "@/components/auth/AuthFormStyles";
import { INVITE_CODE_LENGTH } from "@/types/league";

export function JoinLeagueForm() {
  const [state, formAction] = useActionState(joinLeague, initialLeagueFormState);

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
        <label htmlFor="invite-code" className={authLabelClass}>
          Kod zaproszenia
        </label>
        <input
          id="invite-code"
          name="inviteCode"
          type="text"
          required
          minLength={INVITE_CODE_LENGTH}
          maxLength={INVITE_CODE_LENGTH}
          autoComplete="off"
          spellCheck={false}
          placeholder="ABC123"
          aria-invalid={Boolean(state.fieldErrors?.inviteCode)}
          aria-describedby={
            state.fieldErrors?.inviteCode ? "invite-code-error" : undefined
          }
          className={`${authInputClass} uppercase tracking-[0.2em] ${state.fieldErrors?.inviteCode ? authInputErrorClass : ""}`}
        />
        {state.fieldErrors?.inviteCode ? (
          <p id="invite-code-error" className={authFieldErrorClass}>
            {state.fieldErrors.inviteCode}
          </p>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            6 znaków — litery i cyfry.
          </p>
        )}
      </div>

      <AuthSubmitButton idleLabel="Dołącz do ligi" pendingLabel="Dołączanie…" />
    </form>
  );
}
