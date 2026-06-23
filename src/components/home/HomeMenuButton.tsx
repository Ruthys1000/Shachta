import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function HomeMenuButton({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4 transition hover:border-primary/40 hover:shadow-md active:scale-[0.99]">
        <div className="rounded-full bg-primary-soft p-3">
          <Icon className="size-6 text-primary" />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-semibold">{title}</span>
          <span className="text-sm text-muted">{description}</span>
        </div>
        <ChevronLeft className="size-5 text-muted" />
      </Card>
    </Link>
  );
}
