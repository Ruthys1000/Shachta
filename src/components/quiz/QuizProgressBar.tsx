export function QuizProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round(((current + 1) / total) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-soft">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted">
        שאלה {current + 1} מתוך {total}
      </span>
    </div>
  );
}
