import Link from "next/link";
import { Award, ChevronLeft } from "lucide-react";

export function AchievementsTeaser({
  unlockedCount,
  totalCount,
}: {
  unlockedCount: number;
  totalCount: number;
}) {
  return (
    <Link
      href="/achievements"
      className="flex items-center gap-2 rounded-xl px-1 py-1 text-sm transition hover:bg-muted-soft"
    >
      <Award className="size-4 shrink-0 text-secondary" />
      <span className="flex-1 font-medium">
        {unlockedCount}/{totalCount} הישגים נפתחו
      </span>
      <ChevronLeft className="size-4 text-muted" />
    </Link>
  );
}
