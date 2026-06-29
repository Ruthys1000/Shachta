import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function ScreenHeader({ title, badge }: { title: string; badge?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 lg:mb-6">
      <Link
        href="/"
        className="rounded-full p-2 text-muted transition hover:bg-muted-soft"
        aria-label="חזרה לדף הבית"
      >
        <ChevronRight className="size-5" />
      </Link>
      <h1 className="text-lg font-bold lg:text-xl">{title}</h1>
      {badge}
    </div>
  );
}
