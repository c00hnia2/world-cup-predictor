"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/actions/auth";

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      {pending ? "Wylogowywanie…" : "Wyloguj"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmitButton />
    </form>
  );
}
