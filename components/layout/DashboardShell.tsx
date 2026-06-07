import { Sidebar } from "@/components/layout/Sidebar";
import { getNavUser } from "@/lib/get-nav-user";

interface DashboardShellProps {
  children: React.ReactNode;
}

export async function DashboardShell({ children }: DashboardShellProps) {
  const navUser = await getNavUser();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Sidebar navUser={navUser} />
      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
