"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Spinner } from "@/components/ui/Spinner";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import type { GamificationSummary } from "@/lib/gamification";

export default function AchievementsPage() {
  const [summary, setSummary] = useState<GamificationSummary | null>(null);

  useEffect(() => {
    fetch("/api/gamification/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const unlockedCount = summary?.achievements.filter((a) => a.unlocked).length ?? 0;
  const totalCount = summary?.achievements.length ?? 0;
  const sortedAchievements = summary
    ? [...summary.achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
    : [];

  return (
    <PageShell wide>
      <ScreenHeader
        title="הישגים"
        badge={
          summary && (
            <span className="inline-flex w-fit items-center rounded-full bg-muted-soft px-2 py-0.5 text-[11px] font-medium text-muted">
              {unlockedCount}/{totalCount}
            </span>
          )
        }
      />

      {!summary ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-muted" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>

          <footer className="mt-10 border-t border-border pt-6 text-center text-xs text-muted">
            ההישגים מחושבים מאוצר המילים, מבדקים, שיעורי בניית משפטים וסיפורים והבנת הנקרא.
          </footer>
        </>
      )}
    </PageShell>
  );
}
