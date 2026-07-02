import { clsx } from "clsx";

export function DailyGoalBar({ current, target }: { current: number; target: number }) {
  const percent = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  const reached = current >= target;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">היעד היומי</span>
        <span className="text-xs text-muted">
          {current}/{target} מילים תורגלו היום במבדק
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-soft">
        <div
          className={clsx("h-full rounded-full transition-all", reached ? "bg-success" : "bg-primary")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
