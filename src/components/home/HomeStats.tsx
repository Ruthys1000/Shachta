"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ICON } from "@/lib/activities";
import type { GamificationSummary } from "@/lib/gamification";

function StatTile({
  href,
  icon: Icon,
  label,
  value,
  sub,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.99] sm:flex-row sm:gap-3 sm:text-right"
      aria-label={label}
    >
      <div className="rounded-full bg-primary-soft p-2 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-base font-bold leading-tight sm:text-lg">{value}</div>
        <div className="mt-0.5 text-xs leading-tight text-muted">{sub ?? label}</div>
      </div>
    </Link>
  );
}

export function HomeStats({ summary }: { summary: GamificationSummary | null }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  const unlocked = summary.achievements.filter((a) => a.unlocked).length;
  const total = summary.achievements.length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile
        href="/achievements"
        icon={ICON.level}
        label="רמה"
        value={`רמה ${summary.level}`}
        sub={`${summary.levelProgress.xpIntoLevel}/${summary.levelProgress.xpForNextLevel} XP`}
      />
      <StatTile
        href="/vocabulary"
        icon={ICON.vocabulary}
        label="מילים"
        value={`${summary.vocabularyCount}`}
        sub="מילים באוצר"
      />
      <StatTile
        href="/achievements"
        icon={ICON.achievements}
        label="הישגים"
        value={`${unlocked}/${total}`}
        sub="הישגים נפתחו"
      />
    </div>
  );
}
