export function LevelProgressBar({
  level,
  xpIntoLevel,
  xpForNextLevel,
  percent,
}: {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">רמה {level}</span>
        <span className="text-xs text-muted">
          {xpIntoLevel}/{xpForNextLevel} XP
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-soft">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
