"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/actions/auth";

const defaultButtonClass =
  "inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70";

interface LogoutButtonProps {
  className?: string;
}

function LogoutSubmitButton({ className = defaultButtonClass }: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? "Wylogowywanie…" : "Wyloguj"}
    </button>
  );
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logout} className="w-full">
      <LogoutSubmitButton className={className} />
    </form>
  );
}
