"use client";

import { useState } from "react";

type DashboardTab = "matches" | "predictions";

interface DashboardTabsProps {
  matchesContent: React.ReactNode;
  predictionsContent: React.ReactNode;
}

const tabs: { id: DashboardTab; label: string }[] = [
  { id: "matches", label: "Wszystkie mecze" },
  { id: "predictions", label: "Moje typy" },
];

export function DashboardTabs({
  matchesContent,
  predictionsContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("matches");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sekcje dashboardu"
        className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`dashboard-panel-${tab.id}`}
              id={`dashboard-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="dashboard-panel-matches"
        aria-labelledby="dashboard-tab-matches"
        hidden={activeTab !== "matches"}
      >
        {matchesContent}
      </div>

      <div
        role="tabpanel"
        id="dashboard-panel-predictions"
        aria-labelledby="dashboard-tab-predictions"
        hidden={activeTab !== "predictions"}
      >
        {predictionsContent}
      </div>
    </div>
  );
}
