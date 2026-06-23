import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ScreenHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Link
        href="/"
        className="rounded-full p-2 text-muted transition hover:bg-muted-soft"
        aria-label="חזרה לדף הבית"
      >
        <ChevronRight className="size-5" />
      </Link>
      <h1 className="text-lg font-bold">{title}</h1>
    </div>
  );
}
