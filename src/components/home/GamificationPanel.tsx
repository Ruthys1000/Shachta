"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LevelProgressBar } from "@/components/gamification/LevelProgressBar";
import { DailyGoalBar } from "@/components/gamification/DailyGoalBar";
import { AchievementsTeaser } from "@/components/gamification/AchievementsTeaser";
import type { GamificationSummary } from "@/lib/gamification";

export function GamificationPanel() {
  const [summary, setSummary] = useState<GamificationSummary | null>(null);

  useEffect(() => {
    fetch("/api/gamification/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  return (
    <Card className="flex w-full max-w-md flex-col gap-3">
      <LevelProgressBar
        level={summary.level}
        xpIntoLevel={summary.levelProgress.xpIntoLevel}
        xpForNextLevel={summary.levelProgress.xpForNextLevel}
        percent={summary.levelProgress.percent}
      />
      <div className="border-t border-border" />
      <DailyGoalBar current={summary.dailyGoal.current} target={summary.dailyGoal.target} />
      <div className="border-t border-border" />
      <AchievementsTeaser
        unlockedCount={summary.achievements.filter((a) => a.unlocked).length}
        totalCount={summary.achievements.length}
      />
    </Card>
  );
}
