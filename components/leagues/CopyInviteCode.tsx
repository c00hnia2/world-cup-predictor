"use client";

interface CopyInviteCodeProps {
  inviteCode: string;
}

export function CopyInviteCode({ inviteCode }: CopyInviteCodeProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // Fallback for unsupported clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = inviteCode;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-lg font-bold tracking-[0.25em] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
        {inviteCode}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Kopiuj kod
      </button>
    </div>
  );
}
