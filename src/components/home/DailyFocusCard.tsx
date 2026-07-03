"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Sparkles, ListPlus, PartyPopper, ChevronLeft } from "lucide-react";
import type { GamificationSummary } from "@/lib/gamification";

function ProgressTrack({ percent, reached }: { percent: number; reached: boolean }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-card/70">
      <div
        className={clsx(
          "h-full rounded-full transition-all",
          reached ? "bg-success" : "bg-primary"
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function DailyFocusCard({ summary }: { summary: GamificationSummary | null }) {
  // Loading skeleton — fixed height so the page doesn't jump when data lands.
  if (!summary) {
    return (
      <div className="h-[168px] animate-pulse rounded-2xl border border-border bg-primary-soft/50" />
    );
  }

  // Brand-new user with no words yet: point them at the first step.
  if (summary.vocabularyCount === 0) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 sm:p-6">
        <h2 className="text-lg font-bold text-primary-dark">בואי נתחיל! 🌱</h2>
        <p className="mt-1 text-sm text-primary-dark/80">
          כדי לתרגל צריך קודם כמה מילים. הוסיפי מילים ראשונות או סרקי עמוד שיעור.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/add-words"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98]"
          >
            <ListPlus className="size-4" />
            הוספת מילים
          </Link>
          <Link
            href="/lesson"
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-soft active:scale-[0.98]"
          >
            סריקת שיעור
          </Link>
        </div>
      </div>
    );
  }

  const { current, target } = summary.dailyGoal;
  const reached = current >= target;
  const percent = target === 0 ? 100 : Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div
      className={clsx(
        "rounded-2xl border p-5 sm:p-6",
        reached ? "border-success/30 bg-success-soft" : "border-primary/20 bg-primary-soft"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            {reached ? (
              <>
                <PartyPopper className="size-5 text-success" />
                כל הכבוד, סיימת להיום!
              </>
            ) : (
              <>
                <Sparkles className="size-5 text-primary" />
                התרגול היומי שלך
              </>
            )}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {reached
              ? "השלמת את היעד היומי. רוצה עוד סיבוב?"
              : `עוד ${remaining} מילים ותשלימי את היעד של היום`}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-muted">
          {current}/{target}
        </span>
      </div>

      <div className="mt-4">
        <ProgressTrack percent={percent} reached={reached} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98]"
        >
          <Sparkles className="size-4" />
          {reached ? "עוד מבדק" : "יאללה, לתרגול"}
        </Link>
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-dark transition hover:bg-card/60"
        >
          לכל התרגילים
          <ChevronLeft className="size-4" />
        </Link>
      </div>
    </div>
  );
}
