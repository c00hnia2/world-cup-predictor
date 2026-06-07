"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { NavIcon } from "@/components/layout/NavIcon";
import type { NavUser } from "@/lib/get-nav-user";
import { isNavItemActive, mainNavItems } from "@/lib/navigation";

interface SidebarProps {
  navUser: NavUser;
}

function SidebarContent({
  navUser,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const visibleItems = mainNavItems.filter(
    (item) => !item.adminOnly || navUser.isAdmin,
  );

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <NavIcon icon="matches" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Typer MŚ 2026</p>
          <p className="truncate text-xs text-zinc-400">Mistrzostwa Świata</p>
        </div>
      </div>

      <nav aria-label="Główne menu" className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const active = isNavItemActive(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {navUser.isLoggedIn ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <p className="text-xs text-zinc-400">Zalogowany jako</p>
              <p className="truncate text-sm font-semibold text-white">
                {navUser.username}
              </p>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              onClick={onNavigate}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5"
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              onClick={onNavigate}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              Zarejestruj się
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export function Sidebar({ navUser }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Zamknij menu po zmianie trasy — wzorzec "adjust state during render"
  // (zamiast setState w useEffect, które powoduje kaskadowe rendery).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          aria-label="Otwórz menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Typer MŚ 2026
        </p>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Zamknij menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-zinc-950 shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:z-40`}
      >
        <SidebarContent navUser={navUser} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <aside
        aria-hidden="true"
        className="hidden w-72 shrink-0 lg:block"
      />
    </>
  );
}
