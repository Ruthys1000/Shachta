import { Lock } from "lucide-react";
import { clsx } from "clsx";
import type { AchievementResult } from "@/lib/achievements";
import { Card } from "@/components/ui/Card";
import { achievementIcons } from "@/components/gamification/achievementIcons";

export function AchievementCard({ achievement }: { achievement: AchievementResult }) {
  const Icon = achievementIcons[achievement.icon];
  const { title, description, unlocked, current, target, percent } = achievement;

  return (
    <Card className={clsx("flex flex-col gap-3", !unlocked && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            unlocked ? "bg-secondary-soft text-secondary" : "bg-muted-soft text-muted"
          )}
        >
          {unlocked ? <Icon className="size-5" /> : <Lock className="size-5" />}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-semibold">{title}</span>
          <span className="text-sm text-muted">{description}</span>
        </div>
      </div>

      {!unlocked && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-soft">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs text-muted">
            {current}/{target}
          </span>
        </div>
      )}
    </Card>
  );
}
