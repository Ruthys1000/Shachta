import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

type MenuEmphasis = "solid" | "soft";

const emphasisClasses: Record<MenuEmphasis, string> = {
  solid: "bg-primary text-white",
  soft: "bg-primary-soft text-primary",
};

export function HomeMenuButton({
  href,
  icon: Icon,
  title,
  description,
  tag,
  emphasis = "soft",
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  emphasis?: MenuEmphasis;
}) {
  return (
    <Link href={href} className="flex">
      <Card className="flex h-full w-full items-center gap-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.99]">
        <div className={`rounded-full p-3 ${emphasisClasses[emphasis]}`}>
          <Icon className="size-6" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="font-semibold">{title}</span>
          <span className="inline-flex w-fit items-center rounded-full bg-muted-soft px-2 py-0.5 text-[11px] font-medium text-muted">
            {tag}
          </span>
          <span className="text-sm text-muted">{description}</span>
        </div>
        <ChevronLeft className="size-5 text-muted" />
      </Card>
    </Link>
  );
}
