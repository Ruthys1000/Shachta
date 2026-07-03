import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ScreenHeader({
  title,
  icon: Icon,
  badge,
}: {
  title: string;
  icon?: LucideIcon;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 lg:mb-6">
      <Link
        href="/"
        className="rounded-full p-2 text-muted transition hover:bg-muted-soft"
        aria-label="חזרה לדף הבית"
      >
        <ChevronRight className="size-5" />
      </Link>
      {Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
      )}
      <h1 className="text-lg font-bold lg:text-xl">{title}</h1>
      {badge}
    </div>
  );
}
